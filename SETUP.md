# DIRAGON Setup Guide

Complete setup instructions for the DIRAGON rental apartment rating platform.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console account (for Google Places API)
- Apple Developer account (optional, for Apple Sign-In - $99/year)

## 1. Environment Setup

### 1.1 Clone and Install

```bash
# Install dependencies
npm install
```

### 1.2 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Places API (Required for address autocomplete)
# Get from: https://console.cloud.google.com/google/maps-apis/credentials
VITE_GOOGLE_PLACES_API_KEY=your-api-key-here

# Admin Configuration (Optional - falls back to config/admin.js)
VITE_ADMIN_EMAILS=email1@example.com,email2@example.com
```

## 2. Supabase Setup

### 2.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env`

### 2.2 Database Schema

Run the following SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  street TEXT NOT NULL,
  building_number TEXT NOT NULL,
  floor INTEGER NOT NULL,
  apartment TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'תל אביב',
  neighborhood TEXT,
  overall_rating DECIMAL(3,2) DEFAULT 0,
  maintenance_rating DECIMAL(3,2) DEFAULT 0,
  communication_rating DECIMAL(3,2) DEFAULT 0,
  value_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  deposit_returned_count INTEGER DEFAULT 0,
  contract_respected_count INTEGER DEFAULT 0,
  maintenance_timely_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(street, building_number, floor, apartment, city)
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  maintenance_rating INTEGER CHECK (maintenance_rating >= 1 AND maintenance_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  review_text TEXT NOT NULL,
  rental_start DATE,
  rental_end DATE,
  monthly_rent INTEGER,
  tags JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderation_notes TEXT,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review helpfulness table
CREATE TABLE review_helpfulness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Review reports table
CREATE TABLE review_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_rating ON properties(overall_rating DESC);
CREATE INDEX idx_reviews_property ON reviews(property_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (true);
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "User profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
```

### 2.3 Enable Authentication Providers

#### Email/Password (Required)
1. Go to Authentication > Providers in Supabase Dashboard
2. Enable "Email" provider
3. Configure email templates (optional)

#### Google OAuth (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: Add your Supabase callback URL
     - Format: `https://<project-id>.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret
6. In Supabase Dashboard > Authentication > Providers:
   - Enable "Google" provider
   - Paste Client ID and Client Secret
   - Save

#### Apple Sign-In (Optional - $99/year)

**Requirements:**
- Apple Developer Program membership ($99/year)
- Your domain verified with Apple

**Setup Steps:**

1. **Create an App ID:**
   - Go to [Apple Developer Portal](https://developer.apple.com)
   - Certificates, Identifiers & Profiles > Identifiers
   - Register a new App ID
   - Enable "Sign in with Apple" capability

2. **Create a Services ID:**
   - Certificates, Identifiers & Profiles > Identifiers
   - Register a Services ID (this is your Client ID)
   - Enable "Sign in with Apple"
   - Configure domains and return URLs:
     - Domain: `<project-id>.supabase.co`
     - Return URL: `https://<project-id>.supabase.co/auth/v1/callback`

3. **Create a Private Key:**
   - Certificates, Identifiers & Profiles > Keys
   - Register a new key
   - Enable "Sign in with Apple"
   - Download the `.p8` private key file (only available once!)
   - Note the Key ID

4. **Configure in Supabase:**
   - Go to Authentication > Providers > Apple
   - Enable Apple provider
   - Enter:
     - **Services ID** (Client ID from step 2)
     - **Team ID** (found in Apple Developer account)
     - **Key ID** (from step 3)
     - **Private Key** (contents of .p8 file)
   - Save

**Note:** Apple Sign-In requires a paid Apple Developer account and is optional. The app works perfectly with Email/Password and Google OAuth.

## 3. Google Places API Setup

### 3.1 Enable API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable "Places API" and "Geocoding API"
3. Create credentials > API Key
4. Restrict the API key:
   - Application restrictions: HTTP referrers (web sites)
   - Add your domain (localhost for development)
   - API restrictions: Select "Places API" and "Geocoding API"
5. Copy API key to `.env` as `VITE_GOOGLE_PLACES_API_KEY`

## 4. Admin Configuration

### 4.1 Environment Variable Method (Recommended)
Add admin emails to `.env`:
```env
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### 4.2 Config File Method (Fallback)
Edit `src/config/admin.js`:
```javascript
export const FALLBACK_ADMIN_EMAILS = [
  'admin1@example.com',
  'admin2@example.com',
]
```

### 4.3 Database Method (Most Secure)
Update user role in Supabase:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE id = '<user-uuid>';
```

## 5. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 6. Deployment

### 6.1 Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### 6.2 Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables
4. Deploy

### 6.3 Custom Server

```bash
# Build the app
npm run build

# Serve the dist folder with any static server
npx serve -s dist
```

## 7. Post-Deployment

### 7.1 Update OAuth Redirect URIs
Update your OAuth provider redirect URIs to include your production domain:
- Google: Add `https://yourdomain.com` to authorized origins
- Apple: Add your domain to Services ID configuration

### 7.2 Update Supabase URL Redirects
In Supabase Dashboard > Authentication > URL Configuration:
- Add your production domain to redirect URLs

### 7.3 Test All Features
- [ ] User registration and login
- [ ] Google OAuth login
- [ ] Apple Sign-In (if enabled)
- [ ] Write review with address autocomplete
- [ ] Search properties
- [ ] Admin dashboard access
- [ ] Review moderation

## 8. Troubleshooting

### Google OAuth Not Working
- Verify redirect URI matches exactly (including https://)
- Check that Google+ API is enabled
- Ensure Client ID and Secret are correct in Supabase

### Apple Sign-In Issues
- Verify all certificates and keys are properly configured
- Check domain verification in Apple Developer Portal
- Ensure Services ID return URL matches Supabase callback

### Address Autocomplete Not Working
- Verify Google Places API key is correct
- Check API is enabled in Google Cloud Console
- Verify API key restrictions allow your domain

### Admin Access Not Working
- Verify email in VITE_ADMIN_EMAILS (case-insensitive)
- Check user_profiles table for role = 'admin'
- Clear browser cache and re-login

## 9. Performance Optimization

The app includes several performance optimizations:
- Code splitting with React.lazy()
- Route-based lazy loading
- Debounced search inputs
- Pagination for large result sets
- Indexed database queries

## 10. Security Notes

- Never commit `.env` file to version control
- Rotate API keys regularly
- Use Supabase RLS policies for data access control
- Implement rate limiting for API calls (Supabase has built-in limits)
- Regularly update dependencies for security patches

## 11. Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include error messages and screenshots

## 12. License

[Your License Here]
