-- 🐉 Dirgon Database Schema
-- הרץ את הקובץ הזה ב-Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- TABLES
-- ======================

-- 1. Properties (דירות)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  street TEXT NOT NULL,
  building_number TEXT NOT NULL,
  floor TEXT NOT NULL,
  apartment TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'תל אביב',
  neighborhood TEXT,
  
  -- Aggregated ratings (מחושב מביקורות)
  overall_rating DECIMAL(2,1) DEFAULT 0,
  maintenance_rating DECIMAL(2,1) DEFAULT 0,
  communication_rating DECIMAL(2,1) DEFAULT 0,
  value_rating DECIMAL(2,1) DEFAULT 0,
  
  -- Statistics
  total_reviews INTEGER DEFAULT 0,
  deposit_returned_count INTEGER DEFAULT 0,
  contract_respected_count INTEGER DEFAULT 0,
  maintenance_timely_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Unique constraint על הכתובת המדויקת
  UNIQUE(street, building_number, floor, apartment, city)
);

-- 2. Reviews (ביקורות)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Ratings
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  maintenance_rating INTEGER CHECK (maintenance_rating >= 1 AND maintenance_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Review content
  review_text TEXT NOT NULL CHECK (LENGTH(review_text) >= 20),
  
  -- Rental details
  rental_start TEXT, -- YYYY-MM format
  rental_end TEXT,   -- YYYY-MM format
  monthly_rent INTEGER,
  
  -- Tags (stored as JSONB)
  tags JSONB,
  
  -- Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes TEXT,
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- One review per user per property
  UNIQUE(property_id, user_id)
);

-- 3. Review Reports (דיווחים על ביקורות)
CREATE TABLE IF NOT EXISTS review_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Review Helpfulness (האם הביקורת עזרה?)
CREATE TABLE IF NOT EXISTS review_helpfulness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- One vote per user per review
  UNIQUE(review_id, user_id)
);

-- 5. User Profiles (פרופילים משתמש)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord', 'admin')),
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ======================
-- INDEXES
-- ======================

CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_rating ON properties(overall_rating DESC);

-- ======================
-- FUNCTIONS
-- ======================

-- Function to update property ratings
CREATE OR REPLACE FUNCTION update_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties
  SET
    overall_rating = (
      SELECT ROUND(AVG(overall_rating)::numeric, 1)
      FROM reviews
      WHERE property_id = NEW.property_id AND status = 'approved'
    ),
    maintenance_rating = (
      SELECT ROUND(AVG(maintenance_rating)::numeric, 1)
      FROM reviews
      WHERE property_id = NEW.property_id AND status = 'approved' AND maintenance_rating IS NOT NULL
    ),
    communication_rating = (
      SELECT ROUND(AVG(communication_rating)::numeric, 1)
      FROM reviews
      WHERE property_id = NEW.property_id AND status = 'approved' AND communication_rating IS NOT NULL
    ),
    value_rating = (
      SELECT ROUND(AVG(value_rating)::numeric, 1)
      FROM reviews
      WHERE property_id = NEW.property_id AND status = 'approved' AND value_rating IS NOT NULL
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = NEW.property_id AND status = 'approved'
    ),
    deposit_returned_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = NEW.property_id 
        AND status = 'approved'
        AND tags->>'depositReturned' = 'true'
    ),
    contract_respected_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = NEW.property_id 
        AND status = 'approved'
        AND tags->>'contractRespected' = 'true'
    ),
    maintenance_timely_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = NEW.property_id 
        AND status = 'approved'
        AND tags->>'maintenanceTimely' = 'true'
    ),
    updated_at = NOW()
  WHERE id = NEW.property_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================
-- TRIGGERS
-- ======================

-- Update property ratings when review is added/updated
DROP TRIGGER IF EXISTS update_property_ratings_trigger ON reviews;
CREATE TRIGGER update_property_ratings_trigger
  AFTER INSERT OR UPDATE OF status, overall_rating
  ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_property_ratings();

-- Create user profile on signup
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- ======================
-- ROW LEVEL SECURITY (RLS)
-- ======================

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Properties: Everyone can read
CREATE POLICY "Properties are viewable by everyone"
  ON properties FOR SELECT
  USING (true);

-- Reviews: Everyone can read approved reviews
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

-- Reviews: Users can create their own reviews
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Reviews: Users can update their own pending reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Review Reports: Users can create reports
CREATE POLICY "Users can create reports"
  ON review_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- Review Helpfulness: Users can vote
CREATE POLICY "Users can vote on helpfulness"
  ON review_helpfulness FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Profiles: Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

-- User Profiles: Users can update own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ======================
-- SAMPLE DATA (Optional)
-- ======================

-- הוסף דירות לדוגמה
-- INSERT INTO properties (street, building_number, floor, apartment, city) VALUES
-- ('דיזנגוף', '100', '3', '12', 'תל אביב'),
-- ('רוטשילד', '45', '5', '8', 'תל אביב'),
-- ('בן יהודה', '89', '2', '6', 'תל אביב');

-- הערה: ביקורות לדוגמה יכולות להתווסף אחרי שיש משתמשים מחוברים
