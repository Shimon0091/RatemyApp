-- ======================
-- Fix Seed Data Tag Format
-- ======================
-- Problem: seed_reviews_v2.sql stored tags as arrays ["deposit_returned", "contract_respected"]
--          but the trigger and app expect objects {"depositReturned": true, "contractRespected": false}
--          This caused deposit/contract/repair percentages to always show 0%.
--
-- Run this ONCE in Supabase SQL Editor.

-- Step 1: Convert all reviews with array-format tags to object format
UPDATE reviews
SET tags = jsonb_build_object(
  'depositReturned',   tags @> '"deposit_returned"'::jsonb,
  'contractRespected', tags @> '"contract_respected"'::jsonb,
  'maintenanceTimely', tags @> '"maintenance_timely"'::jsonb
)
WHERE jsonb_typeof(tags) = 'array';

-- Step 2: Recalculate all property stats based on the corrected tags
UPDATE properties p SET
  deposit_returned_count = (
    SELECT COUNT(*) FROM reviews
    WHERE property_id = p.id
      AND status = 'approved'
      AND tags->>'depositReturned' = 'true'
  ),
  contract_respected_count = (
    SELECT COUNT(*) FROM reviews
    WHERE property_id = p.id
      AND status = 'approved'
      AND tags->>'contractRespected' = 'true'
  ),
  maintenance_timely_count = (
    SELECT COUNT(*) FROM reviews
    WHERE property_id = p.id
      AND status = 'approved'
      AND tags->>'maintenanceTimely' = 'true'
  ),
  total_reviews = (
    SELECT COUNT(*) FROM reviews
    WHERE property_id = p.id
      AND status = 'approved'
  );

-- Verify: after running, check that counts are > 0 for properties with seed reviews
-- SELECT id, total_reviews, deposit_returned_count, contract_respected_count, maintenance_timely_count
-- FROM properties
-- ORDER BY total_reviews DESC
-- LIMIT 10;
