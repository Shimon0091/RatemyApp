-- ======================
-- MIGRATION: Add neighborhood tag counters
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to run multiple times (IF NOT EXISTS + CREATE OR REPLACE)
-- ======================

-- 1. Add new counter columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_available_count INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nice_neighbors_count INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nearby_amenities_count INTEGER DEFAULT 0;

-- 2. Update the trigger function to count new tags
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
    parking_available_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = NEW.property_id
        AND status = 'approved'
        AND tags->>'parkingAvailable' = 'true'
    ),
    nice_neighbors_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = NEW.property_id
        AND status = 'approved'
        AND tags->>'niceNeighbors' = 'true'
    ),
    nearby_amenities_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = NEW.property_id
        AND status = 'approved'
        AND tags->>'nearbyAmenities' = 'true'
    ),
    updated_at = NOW()
  WHERE id = NEW.property_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Update trigger to also fire on tag changes
DROP TRIGGER IF EXISTS update_property_ratings_trigger ON reviews;
CREATE TRIGGER update_property_ratings_trigger
  AFTER INSERT OR UPDATE OF status, overall_rating, tags
  ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_property_ratings();
