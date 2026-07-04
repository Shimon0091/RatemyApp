import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  loadGA4,
  trackPageView,
  hasAnalyticsConsent,
  syncAnalyticsConsent,
  CONSENT_EVENT,
} from '../lib/analytics'

/**
 * Wires GA4 into the app, consent-first:
 *  - On mount, loads GA4 only if consent was already "accepted".
 *  - Listens for the in-app consent event so acceptance later in the session
 *    loads GA4 immediately and records the current page.
 *  - Sends a manual page_view on every react-router route change (a no-op
 *    until GA4 has been loaded, i.e. until the user has accepted).
 *
 * Must be called inside a Router (uses useLocation).
 */
export function useAnalytics() {
  const location = useLocation()

  // Load on mount if already consented, and react to mid-session consent changes.
  useEffect(() => {
    if (hasAnalyticsConsent()) {
      loadGA4()
    }

    const handleConsentChange = () => {
      // Apply the new choice immediately: accept loads GA4; decline (withdrawal)
      // sets Google's opt-out flag so any already-loaded GA stops sending hits.
      syncAnalyticsConsent()
      if (hasAnalyticsConsent()) {
        // Record the page the user was on when they accepted (route did not change).
        trackPageView(window.location.pathname + window.location.search)
      }
    }

    window.addEventListener(CONSENT_EVENT, handleConsentChange)
    return () => window.removeEventListener(CONSENT_EVENT, handleConsentChange)
  }, [])

  // Track page views on route change (no-op until GA4 is loaded).
  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])
}
