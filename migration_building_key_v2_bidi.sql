-- migration_building_key_v2_bidi.sql — 2026-07-04
-- Release 0.1 of the "building entity" feature — HARDENING, not a logic change.
-- Follows migration_add_building_key.sql (v1), which is already applied to the
-- live DB (functions diragon_normalize_part / diragon_building_key, the GENERATED
-- properties.building_key column, idx_properties_building_key, and the
-- buildings_summary VIEW all exist).
--
-- WHY: Hebrew addresses coming from Google Places autocomplete (and some OS
-- keyboards) carry INVISIBLE bidi / directional-formatting marks — e.g. a street
-- stored as 'ויצמן' + U+202C (POP DIRECTIONAL FORMATTING). v1's normalizer did
-- NOT strip them, so building_key retained the mark. The same building typed once
-- WITH and once WITHOUT the mark would then get two different keys and fail to
-- merge (under-merge) — a real risk for a live Hebrew product with autocomplete.
--
-- WHAT THIS DOES (additive / safe; same normalization contract, just hardened):
--   1) CREATE OR REPLACE both normalization functions. Only step 3 of
--      diragon_normalize_part changes: it now ALSO removes the bidi marks
--      LRM/RLM (U+200E/U+200F), LRE/RLE/PDF/LRO/RLO (U+202A..U+202E) and
--      LRI/RLI/FSI/PDI (U+2066..U+2069). Every other step (lower, dash->space,
--      collapse, trim, city alias) is byte-for-byte identical to v1. Chars are
--      built with chr() so the SQL source stays pure ASCII.
--   2) RECOMPUTE building_key for every existing row. building_key is a GENERATED
--      STORED column, so replacing the function does NOT retroactively recompute
--      it — only a row rewrite does. We force that rewrite by dropping and
--      re-adding the column with the SAME GENERATED definition, then restoring
--      the index and the view.
--
-- SAFETY / PRODUCTION IMPACT: the live site (branch `main`) does NOT read
-- properties.building_key or the buildings_summary VIEW — the building-entity
-- feature lives on branch feat/building-entity and is not deployed. So dropping
-- and re-adding the column/VIEW here does NOT affect the running production app.
-- The whole thing runs in one transaction, so callers never see a half-applied
-- state. Re-adding a STORED generated column rewrites the properties table once
-- under a brief ACCESS EXCLUSIVE lock (effectively instant on this dataset;
-- prefer a low-traffic window regardless).
--
-- NOT YET APPLIED TO THE LIVE DB. Applying it touches production
-- (xtfhyazefgznrepdfhdb) and is an APPROVAL GATE — run only after the
-- manager/Shimon approves, via app-live/.tools/sql.mjs. NEVER run a full schema
-- dump on the live DB; only additive numbered migrations like this one.
--
-- The JS twin src/lib/address.js (normalizePart / buildingKey) was updated in the
-- same change to strip the exact same characters in the exact same step order —
-- JS<->SQL key identity is required or building lookups silently return nothing.

BEGIN;

-- ======================================================================
-- 1) Drop the dependents FIRST so the functions have no dependency blocking
--    CREATE OR REPLACE, and so the column can be re-added (recomputed).
-- ======================================================================
-- Order matters: the VIEW depends on the column; the GENERATED column depends on
-- the functions. Removing both up front lets us replace the functions cleanly.
-- Dropping the column also drops idx_properties_building_key automatically.
DROP VIEW IF EXISTS public.buildings_summary;

ALTER TABLE public.properties
  DROP COLUMN IF EXISTS building_key;

-- ======================================================================
-- 2) NORMALIZATION FUNCTIONS (IMMUTABLE — safe for GENERATED column + index)
-- ======================================================================
--
-- diragon_normalize_part() is the single source of truth for how one address
-- part (street / building number / city) is canonicalized. The JS twin in
-- src/lib/address.js (normalizePart) MUST perform the EXACT same ordered steps:
--
--   step 1  coalesce NULL -> ''                       (coalesce)
--   step 2  lowercase                                 (lower)   [Latin only; Hebrew has no case]
--   step 3  remove quote/separator/bidi chars -> ''    (translate)
--             geresh       U+05F3 (chr 1523)
--             gershayim    U+05F4 (chr 1524)
--             apostrophe   U+0027 (chr 39)
--             backtick     U+0060 (chr 96)
--             pipe         U+007C (chr 124)   -- the key separator; must never survive inside a part
--             --- bidi / directional formatting marks (NEW in v2) ---
--             LRM          U+200E (chr 8206)
--             RLM          U+200F (chr 8207)
--             LRE          U+202A (chr 8234)
--             RLE          U+202B (chr 8235)
--             PDF          U+202C (chr 8236)  -- the exact mark seen from Google Places
--             LRO          U+202D (chr 8237)
--             RLO          U+202E (chr 8238)
--             LRI          U+2066 (chr 8294)
--             RLI          U+2067 (chr 8295)
--             FSI          U+2068 (chr 8296)
--             PDI          U+2069 (chr 8297)
--   step 4  turn dash-like chars + NBSP into a space   (translate -> single space each)
--             hyphen-minus U+002D (chr 45)
--             en dash      U+2013 (chr 8211)
--             em dash      U+2014 (chr 8212)
--             Hebrew maqaf U+05BE (chr 1470)
--             no-break sp  U+00A0 (chr 160)
--   step 5  collapse runs of whitespace -> one space   (regexp_replace \s+)
--   step 6  trim leading/trailing spaces               (btrim)
--
-- Char sets are built with chr()/concatenation so the SQL source stays pure
-- ASCII — no literal apostrophe and no invisible bidi/NBSP to corrupt the file.
CREATE OR REPLACE FUNCTION public.diragon_normalize_part(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT btrim(
    regexp_replace(
      translate(
        translate(
          lower(coalesce(txt, '')),
          -- remove: quotes/separator (v1) + bidi/directional marks (v2)
          chr(1523) || chr(1524) || chr(39) || chr(96) || chr(124)
            || chr(8206) || chr(8207)
            || chr(8234) || chr(8235) || chr(8236) || chr(8237) || chr(8238)
            || chr(8294) || chr(8295) || chr(8296) || chr(8297),
          ''
        ),
        chr(45) || chr(8211) || chr(8212) || chr(1470) || chr(160),  -- -> space
        repeat(' ', 5)
      ),
      '\s+', ' ', 'g'
    )
  );
$$;

COMMENT ON FUNCTION public.diragon_normalize_part(text) IS
  'Canonicalizes one address part (strips quotes/separators + bidi/directional marks). Must stay in sync with normalizePart() in src/lib/address.js.';

-- diragon_building_key() assembles the stable grouping key for a building:
--   normalize(street) | normalize(building_number) | alias(normalize(city))
--
-- UNCHANGED from v1 — re-declared here only so the migration is self-contained.
-- The pipe separator is safe because step 3 above strips U+007C from every part.
--
-- City alias map: applied to the ALREADY-NORMALIZED city token (post step 6).
-- 'תל אביב-יפו' normalizes to 'תל אביב יפו' (maqaf/hyphen -> space), which we
-- fold to the canonical 'תל אביב'. To add more aliases later, extend the CASE
-- (and the CITY_ALIASES map in JS).
CREATE OR REPLACE FUNCTION public.diragon_building_key(
  street text,
  building_number text,
  city text
)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT public.diragon_normalize_part(street)
      || '|' ||
         public.diragon_normalize_part(building_number)
      || '|' ||
         CASE public.diragon_normalize_part(city)
           WHEN 'תל אביב יפו' THEN 'תל אביב'
           ELSE public.diragon_normalize_part(city)
         END;
$$;

COMMENT ON FUNCTION public.diragon_building_key(text, text, text) IS
  'Stable per-building grouping/routing key. Must match buildingKey() in src/lib/address.js.';

-- ======================================================================
-- 3) RE-ADD the GENERATED building_key column (forces recompute of every row)
-- ======================================================================
-- Same definition as v1. Because it was dropped above, ADD recomputes the value
-- for every existing row using the NOW-hardened diragon_building_key(), scrubbing
-- any bidi marks that leaked into keys under v1.
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS building_key text
  GENERATED ALWAYS AS (
    public.diragon_building_key(street, building_number, city)
  ) STORED;

COMMENT ON COLUMN public.properties.building_key IS
  'Generated stable building identifier (normalized street|building_number|city). Read-only; do not write.';

-- ======================================================================
-- 4) INDEX for grouping / lookup by building_key (dropped with the column above)
-- ======================================================================
CREATE INDEX IF NOT EXISTS idx_properties_building_key
  ON public.properties (building_key);

-- ======================================================================
-- 5) buildings_summary VIEW (read-only aggregate, security_invoker)
-- ======================================================================
-- Recreated VERBATIM from v1 — no semantic change here. Kept in this migration
-- because dropping the column in step 1 also dropped the view that referenced it.
--
-- security_invoker=on (PG15+) makes the view run with the CALLER's privileges
-- and RLS, inheriting the "Properties are viewable by everyone" SELECT policy
-- instead of the view owner's rights. The view reads ONLY the properties table
-- (whose *aggregated* columns already reflect approved reviews only, via the
-- update_property_ratings trigger), so no pending/unapproved review data can
-- leak through it.
--
-- METRIC SEPARATION (binding legal constraint, spec §5 + manager decision 1):
-- only the building-wide overall score and LOCATION metrics (parking /
-- neighbors / nearby amenities) are rolled up to the building. Landlord-
-- dependent metrics (communication, deposit return, contract compliance) as
-- well as maintenance/value are intentionally NOT aggregated here — they stay
-- attributed to the specific apartment/property row.
--
-- K-ANONYMITY HEADLINE GATE (fail-secure, spec §5 + trust/security/database review):
-- the building-wide `overall_rating` is exposed ONLY when there are >= 3 approved
-- reviews spread across >= 2 apartments that ACTUALLY have reviews
-- (reviewed_apartment_count). Below that the VIEW returns NULL, so a single
-- apartment / landlord can never be re-identified through a building-wide number
-- (e.g. 3 reviews all on one unit in a 5-unit building must NOT publish a score).
-- Gating lives HERE at the data layer — the frontend meetsHeadlineGate() mirrors
-- it for UX, but the VIEW is the authoritative guard even for direct API callers.
--
-- The aggregates are computed in a CTE first because an outer CASE cannot
-- reference aggregate aliases (apartment_count / reviewed_apartment_count /
-- total_reviews) from the same SELECT level.
CREATE VIEW public.buildings_summary
WITH (security_invoker = on) AS
WITH building_agg AS (
  SELECT
    p.building_key                                            AS building_key,
    -- Representative display fields. Rows sharing a key may differ only by raw
    -- casing / city spelling; MIN() is deterministic. (A curated canonical name
    -- can be added in a later release.)
    MIN(p.street)                                             AS street,
    MIN(p.building_number)                                    AS building_number,
    MIN(p.city)                                               AS city,
    MIN(p.neighborhood)                                       AS neighborhood,
    -- Distinct physical apartments registered in the building. Counting distinct
    -- (floor, apartment) avoids double-counting the same unit when it exists
    -- under two city spellings (e.g. 'תל אביב' vs 'תל אביב-יפו').
    COUNT(DISTINCT COALESCE(TRIM(p.floor), '') || '/' || COALESCE(TRIM(p.apartment), '')) AS apartment_count,
    -- Distinct apartments that actually have >= 1 approved review. This is the
    -- honest denominator for "across M apartments" and the k-anonymity gate
    -- input — NOT apartment_count, which includes review-less registered units.
    COUNT(DISTINCT COALESCE(TRIM(p.floor), '') || '/' || COALESCE(TRIM(p.apartment), ''))
      FILTER (WHERE p.total_reviews > 0)                     AS reviewed_apartment_count,
    -- Total APPROVED reviews across the building (per-property total_reviews is
    -- already approved-only, maintained by the trigger).
    COALESCE(SUM(p.total_reviews), 0)                         AS total_reviews,
    -- Weighted overall score = SUM(rating * reviews) / SUM(reviews). NOT an
    -- average of averages, so a 1-review apartment doesn't weigh like an 8-review
    -- one. NULL when the building has zero approved reviews. Gated below.
    ROUND(
      SUM(p.overall_rating * p.total_reviews)::numeric
        / NULLIF(SUM(p.total_reviews), 0),
      1
    )                                                         AS weighted_rating,
    -- Location-only rollups (safe to aggregate across landlords).
    COALESCE(SUM(p.parking_available_count), 0)               AS parking_available_count,
    COALESCE(SUM(p.nice_neighbors_count), 0)                  AS nice_neighbors_count,
    COALESCE(SUM(p.nearby_amenities_count), 0)                AS nearby_amenities_count,
    -- Convenience: the property ids that make up this building, so callers can
    -- fetch the unified review feed (getBuildingReviews) without a second lookup.
    array_agg(DISTINCT p.id)                                  AS property_ids
  FROM public.properties p
  WHERE p.building_key <> '||'   -- guard against a fully-empty address key
  GROUP BY p.building_key
)
SELECT
  building_key,
  street,
  building_number,
  city,
  neighborhood,
  -- Legitimate counters — always exposed (they reveal only aggregate volume,
  -- never a single renter's identity/score).
  apartment_count,
  reviewed_apartment_count,
  total_reviews,
  -- Fail-secure k-anonymity gate: publish the weighted headline ONLY at/above
  -- the threshold, else NULL. Keep in sync with HEADLINE_MIN_REVIEWS (3) and
  -- HEADLINE_MIN_APARTMENTS (2) in src/lib/buildingSummary.js.
  CASE
    WHEN total_reviews >= 3 AND reviewed_apartment_count >= 2
      THEN weighted_rating
    ELSE NULL
  END                                                         AS overall_rating,
  -- Location metrics stay exposed (aggregate, landlord-independent).
  parking_available_count,
  nice_neighbors_count,
  nearby_amenities_count,
  property_ids
FROM building_agg;

COMMENT ON VIEW public.buildings_summary IS
  'Read-only building aggregate over properties. Location metrics + weighted overall only; landlord-dependent metrics stay per-property. overall_rating is fail-secure gated at the VIEW: exposed only when total_reviews >= 3 AND reviewed_apartment_count >= 2 (k-anonymity), else NULL. Counters (apartment_count, reviewed_apartment_count, total_reviews) are always exposed.';

-- ======================================================================
-- 6) GRANTS (RLS still gates the underlying properties rows)
-- ======================================================================
GRANT SELECT ON public.buildings_summary TO anon, authenticated;

COMMIT;

-- ----------------------------------------------------------------------
-- Post-apply verification (run manually, READ-ONLY — do NOT include in the tx):
--   -- No building_key may retain a bidi/directional mark after the recompute.
--   -- (chr codes: 8206,8207,8234,8235,8236,8237,8238,8294,8295,8296,8297)
--   SELECT id, street, building_key
--   FROM public.properties
--   WHERE building_key ~ ('['
--     || chr(8206) || chr(8207)
--     || chr(8234) || chr(8235) || chr(8236) || chr(8237) || chr(8238)
--     || chr(8294) || chr(8295) || chr(8296) || chr(8297)
--     || ']');           -- expect 0 rows
--
--   -- Sanity: the ויצמן 30 case collapses to ONE building row.
--   SELECT * FROM public.buildings_summary
--   WHERE building_key LIKE 'ויצמן|30|%';
--
--   -- Confirm the k-anonymity gate still holds: any row with overall_rating NOT
--   -- NULL must have total_reviews >= 3 AND reviewed_apartment_count >= 2.
--   SELECT * FROM public.buildings_summary
--   WHERE overall_rating IS NOT NULL
--     AND (total_reviews < 3 OR reviewed_apartment_count < 2);   -- expect 0 rows
-- ----------------------------------------------------------------------
