// Google Analytics 4 (GA4) helper — consent-gated.
//
// Privacy note (Israeli Privacy Protection Amendment 13 / GDPR-style):
// gtag.js is loaded and GA cookies are set ONLY after the user has explicitly
// ACCEPTED cookies via the CookieBanner. If the user rejects or has not chosen,
// nothing here loads and no GA cookie is set. If VITE_GA4_MEASUREMENT_ID is
// absent, every function is a safe no-op.

import { logger } from '../utils/logger'

const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID

// Single source of truth for the consent value + the in-app consent event.
// CookieBanner reads/writes this key and dispatches CONSENT_EVENT on change.
export const COOKIE_CONSENT_KEY = 'diragon_cookie_consent'
export const CONSENT_ACCEPTED = 'accepted'
export const CONSENT_DECLINED = 'declined'
// Dispatched when the stored consent value changes (accept / decline).
export const CONSENT_EVENT = 'diragon:cookie-consent'
// Dispatched (e.g. by the footer "ניהול עוגיות" link) to re-open the banner so
// the user can review or withdraw a previously given consent at any time.
export const CONSENT_OPEN_EVENT = 'diragon:open-consent'

// Guard so gtag.js is injected at most once per session.
let gaLoaded = false

/**
 * @returns {boolean} true only when the stored consent value is "accepted".
 */
export function hasAnalyticsConsent() {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === CONSENT_ACCEPTED
  } catch {
    // localStorage can throw (private mode, disabled storage) — treat as no consent.
    return false
  }
}

/**
 * @returns {boolean} true when a GA4 Measurement ID is configured at build time.
 */
export function isAnalyticsConfigured() {
  return Boolean(MEASUREMENT_ID)
}

/**
 * Load GA4 gtag.js and run `config`. Idempotent and consent-gated: it does
 * nothing unless a Measurement ID is configured AND consent === "accepted".
 */
export function loadGA4() {
  if (!MEASUREMENT_ID) return
  if (gaLoaded) return
  if (!hasAnalyticsConsent()) return
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  try {
    gaLoaded = true

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    // Must be a real (non-arrow) function so `arguments` is captured.
    function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag

    gtag('js', new Date())
    // Privacy-conservative config: no advertising / cross-device signals, and
    // SPA page views are sent manually on route change (send_page_view: false).
    gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false,
    })
  } catch (error) {
    gaLoaded = false
    logger.error('Failed to load GA4', error)
  }
}

/**
 * Reflect the current stored consent onto GA4 at runtime.
 *
 * On accept: clears Google's opt-out flag and (idempotently) loads GA4.
 * On decline / no choice: sets Google's official per-property opt-out flag
 * `ga-disable-<ID>` = true, so that if a user WITHDRAWS consent mid-session —
 * after gtag.js was already injected earlier — no further hits are sent, with
 * no page reload required. This keeps withdrawal as effective as acceptance
 * (Amendment 13 §8C symmetry). Safe no-op when no Measurement ID is configured.
 */
export function syncAnalyticsConsent() {
  if (!MEASUREMENT_ID) return
  if (typeof window === 'undefined') return

  if (hasAnalyticsConsent()) {
    window[`ga-disable-${MEASUREMENT_ID}`] = false
    loadGA4()
  } else {
    window[`ga-disable-${MEASUREMENT_ID}`] = true
  }
}

/**
 * Send a manual SPA page_view. No-op unless GA4 has been loaded (which itself
 * requires consent), so this never fires for users who declined.
 * @param {string} path route path (e.g. "/property/123?tab=reviews")
 */
export function trackPageView(path) {
  if (!MEASUREMENT_ID) return
  if (!gaLoaded) return
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  try {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    })
  } catch (error) {
    logger.error('Failed to send GA4 page_view', error)
  }
}
