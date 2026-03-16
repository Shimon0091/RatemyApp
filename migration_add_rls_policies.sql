-- ======================
-- MIGRATION: Add missing RLS policies
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to run multiple times (drops before creating)
-- ======================

-- 1. Allow admins to read ALL reviews (pending, rejected, etc.)
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Allow admins to approve/reject reviews
DROP POLICY IF EXISTS "Admins can moderate reviews" ON reviews;
CREATE POLICY "Admins can moderate reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Allow admins to read reports (without this, reports tab is always empty!)
DROP POLICY IF EXISTS "Admins can read reports" ON review_reports;
CREATE POLICY "Admins can read reports"
  ON review_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Allow admins to update reports (resolve/dismiss)
DROP POLICY IF EXISTS "Admins can update reports" ON review_reports;
CREATE POLICY "Admins can update reports"
  ON review_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Allow users to read their own votes (needed to check if already voted)
DROP POLICY IF EXISTS "Users can read own votes" ON review_helpfulness;
CREATE POLICY "Users can read own votes"
  ON review_helpfulness FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Allow users to change their vote
DROP POLICY IF EXISTS "Users can update own votes" ON review_helpfulness;
CREATE POLICY "Users can update own votes"
  ON review_helpfulness FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Allow users to delete their own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);
