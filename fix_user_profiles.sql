-- 🔧 תיקון בעיית הרשמת משתמשים
-- הרץ את הקוד הזה ב-Supabase SQL Editor

-- 1. הוסף policy שמאפשרת למשתמשים ליצור את הפרופיל שלהם
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. עדכן את ה-trigger להיות יותר עמיד לשגיאות
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- לא לכשל את ההרשמה אם יש בעיה עם הפרופיל
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ודא שה-trigger קיים
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- 4. בדוק שהטבלה קיימת עם כל העמודות
DO $$
BEGIN
  -- ודא שהטבלה קיימת
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      display_name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord', 'admin')),
      reviews_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );
    
    -- הפעל RLS
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Created user_profiles table';
  END IF;
END $$;

-- 5. ודא שכל ה-policies קיימות
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON user_profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- הודעת סיום
DO $$
BEGIN
  RAISE NOTICE '✅ תיקון הושלם בהצלחה!';
  RAISE NOTICE 'עכשיו משתמשים יכולים להירשם ללא שגיאות.';
END $$;
