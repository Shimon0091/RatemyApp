// buildingSummary.js — pure, deterministic presentation logic for the building
// header. NO AI, NO free text: everything here is derived mechanically from the
// buildings_summary row so the "בשורה תחתונה" is reproducible and defensible.
//
// Two locked product rules from the manager live here:
//  1. METRIC SEPARATION — only the weighted overall score + the 3 LOCATION
//     metrics (parking / neighbors / nearby amenities) may be rolled up to the
//     building header. Landlord-dependent metrics (communication, deposit,
//     contract, maintenance, value) stay on PropertyPage per apartment. The
//     buildings_summary VIEW deliberately does not even expose them.
//  2. PUBLICATION GATE (k-anonymity) — a unified numeric headline is shown ONLY
//     when there are >= 3 approved reviews AND >= 2 apartments that ACTUALLY have
//     reviews (reviewed_apartment_count, NOT the count of registered apartments).
//     This mirrors the fail-secure CASE in the buildings_summary VIEW: the VIEW is
//     authoritative (overall_rating is NULL below threshold); this gate is the UX
//     twin. Below threshold, reviews are listed per-apartment with no aggregate.

export const HEADLINE_MIN_REVIEWS = 3
export const HEADLINE_MIN_APARTMENTS = 2

// A location metric is "highlighted" in the bottom-line sentence at/above this
// share of reviews. Keeps the sentence honest (only genuine majorities surface).
const HIGHLIGHT_MIN_PCT = 50

// The ONLY metrics allowed at building level (rule #1). labelKey resolves via i18n.
export const BUILDING_LOCATION_METRICS = [
  { key: 'parking_available_count', labelKey: 'building.metricParking' },
  { key: 'nice_neighbors_count', labelKey: 'building.metricNeighbors' },
  { key: 'nearby_amenities_count', labelKey: 'building.metricAmenities' },
]

/**
 * Coerce a rating that PostgREST may return as a numeric string.
 * NULL / non-numeric → null (render "בניין חדש", never a fake 0.0).
 * @param {unknown} value
 * @returns {number | null}
 */
export function coerceRating(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Non-negative integer coercion (bigints may arrive as strings). */
function toCount(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0
}

/**
 * Publication gate for the unified numeric headline (rule #2).
 * @param {object | null | undefined} building buildings_summary row
 * @returns {boolean}
 */
export function meetsHeadlineGate(building) {
  if (!building) return false
  return (
    toCount(building.total_reviews) >= HEADLINE_MIN_REVIEWS &&
    toCount(building.reviewed_apartment_count) >= HEADLINE_MIN_APARTMENTS
  )
}

/**
 * Per-metric location stats as percentages of total approved reviews.
 * pct = count / total_reviews (share of reviews that reported the metric).
 * Returns [] when there are no reviews.
 * @param {object | null | undefined} building
 * @returns {{ key: string, labelKey: string, count: number, pct: number }[]}
 */
export function locationMetricStats(building) {
  const total = toCount(building?.total_reviews)
  if (total <= 0) return []
  return BUILDING_LOCATION_METRICS.map((m) => {
    const count = toCount(building[m.key])
    return { ...m, count, pct: Math.round((count / total) * 100) }
  })
}

/**
 * Location metrics that clear the highlight threshold, strongest first.
 * These are the only phrases the deterministic bottom-line sentence may use.
 * @param {object | null | undefined} building
 * @returns {{ key: string, labelKey: string, count: number, pct: number }[]}
 */
export function locationHighlights(building) {
  return locationMetricStats(building)
    .filter((s) => s.pct >= HIGHLIGHT_MIN_PCT)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 2)
}
