// address.js — building-key normalization, the JS twin of the SQL functions in
// migration_add_building_key.sql (diragon_normalize_part / diragon_building_key).
//
// WHY THIS MUST MATCH THE DB EXACTLY:
// The DB stores a GENERATED `building_key` per property row and groups the
// `buildings_summary` view by it. The frontend computes the SAME key here to
// build /building/... links and to look a building up by key (getBuildingByKey).
// If the two implementations disagree for a given address, lookups silently
// return nothing. So the ordered steps below produce output identical to the SQL.
// Any change here requires the same change in the migration.

// --- Character sets ---

// step 3 — removed entirely. Mirrors normalizeSearchText() in database.js, plus
// the pipe (the key separator), which must never survive inside a part:
//   geresh U+05F3, gershayim U+05F4, apostrophe U+0027, backtick U+0060, pipe U+007C
const REMOVE_CHARS = /[׳״'`|]/g;

// step 4 — dash-like chars turned into a single space each:
//   hyphen-minus U+002D, en dash U+2013, em dash U+2014, Hebrew maqaf U+05BE.
// NB: the SQL twin ALSO maps NBSP (U+00A0) here, but in JS the NBSP is caught one
// step later by \s in WHITESPACE_RUN (JS \s is Unicode-aware; Postgres \s is not),
// so the final output is identical. NBSP is deliberately NOT in this class to keep
// the source free of irregular-whitespace characters.
const DASH_CHARS = /[-–—־]/g;

// step 5 — collapse any remaining whitespace run (incl. NBSP in JS) to one space.
const WHITESPACE_RUN = /\s+/g;

/**
 * City alias map, keyed on the ALREADY-NORMALIZED city token (i.e. the output of
 * normalizePart, not the raw input). 'תל אביב-יפו' normalizes to 'תל אביב יפו'
 * (the maqaf/hyphen becomes a space), which we fold to the canonical 'תל אביב'.
 * Extend this together with the CASE in diragon_building_key().
 * @type {Record<string, string>}
 */
export const CITY_ALIASES = {
  'תל אביב יפו': 'תל אביב',
};

/**
 * Canonicalize one address part (street / building number / city).
 * Ordered steps — output identical to SQL diragon_normalize_part():
 *   1. coalesce null/undefined -> ''
 *   2. lowercase (Latin only; Hebrew has no case)
 *   3. remove quote/separator chars
 *   4. turn dash-like chars into a space
 *   5. collapse whitespace runs (incl. NBSP) to a single space
 *   6. trim
 * @param {string | null | undefined} text
 * @returns {string}
 */
export function normalizePart(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(REMOVE_CHARS, '')
    .replace(DASH_CHARS, ' ')
    .replace(WHITESPACE_RUN, ' ')
    .trim();
}

/**
 * Normalize a city and apply the alias map. Idempotent: passing an
 * already-canonical city returns it unchanged.
 * @param {string | null | undefined} city
 * @returns {string}
 */
export function normalizeCity(city) {
  const normalized = normalizePart(city);
  return CITY_ALIASES[normalized] ?? normalized;
}

/**
 * Build the stable per-building key: normalize(street)|normalize(number)|alias(city).
 * The pipe is a safe separator because normalizePart strips U+007C from every part.
 * @param {string | null | undefined} street
 * @param {string | null | undefined} buildingNumber
 * @param {string | null | undefined} city
 * @returns {string}
 */
export function buildingKey(street, buildingNumber, city) {
  return `${normalizePart(street)}|${normalizePart(buildingNumber)}|${normalizeCity(city)}`;
}

/**
 * Convert a building key to its canonical route path
 * `/building/:city/:street/:number`. Each segment is URI-encoded (Hebrew,
 * spaces, and building numbers that may contain letters).
 * @param {string} key A building_key of the form `street|number|city`.
 * @returns {string} Route path, or '/search' if the key is missing/malformed.
 */
export function buildingKeyToPath(key) {
  if (!key || typeof key !== 'string') return '/search';
  const [street = '', number = '', city = ''] = key.split('|');
  if (!street && !number && !city) return '/search';
  return `/building/${encodeURIComponent(city)}/${encodeURIComponent(street)}/${encodeURIComponent(number)}`;
}

/**
 * Reconstruct the building key from decoded route params
 * (React Router useParams for `/building/:city/:street/:number`).
 * Re-normalizes each segment via buildingKey(), which is idempotent for
 * canonical URLs and also repairs a hand-typed / non-canonical URL
 * (e.g. /building/תל אביב-יפו/... resolves to the same key as /building/תל אביב/...).
 * @param {{ city?: string, street?: string, number?: string }} params
 * @returns {string}
 */
export function pathToBuildingKey({ city, street, number } = {}) {
  return buildingKey(street, number, city);
}

/**
 * Convenience: address fields -> canonical building route path.
 * Lets a property card/page link straight to its building without a DB round-trip.
 * @param {string | null | undefined} street
 * @param {string | null | undefined} buildingNumber
 * @param {string | null | undefined} city
 * @returns {string}
 */
export function addressToBuildingPath(street, buildingNumber, city) {
  return buildingKeyToPath(buildingKey(street, buildingNumber, city));
}
