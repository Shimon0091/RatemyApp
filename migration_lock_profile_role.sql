-- ======================
-- MIGRATION: Lock user_profiles role field
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to run multiple times (drops before creating)
-- ======================

-- Problem: Current "Users can update own profile" policy allows users
-- to change ANY field, including role. A malicious user can run:
--   UPDATE user_profiles SET role = 'admin' WHERE id = auth.uid()
-- and grant themselves admin access.

-- Fix: Replace the policy with one that prevents role changes.
-- Users can update display_name and avatar_url, but role stays unchanged.

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM user_profiles WHERE id = auth.uid())
  );

-- Also update the schema file's version of this policy for documentation
