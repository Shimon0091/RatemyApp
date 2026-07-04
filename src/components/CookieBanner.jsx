import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  COOKIE_CONSENT_KEY,
  CONSENT_ACCEPTED,
  CONSENT_DECLINED,
  CONSENT_EVENT,
  CONSENT_OPEN_EVENT,
} from '../lib/analytics'

// Notify the app (useAnalytics) that the stored consent value changed.
function notifyConsentChange() {
  window.dispatchEvent(new Event(CONSENT_EVENT))
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    let timer
    if (!consent) {
      // Small delay so it doesn't flash on first render
      timer = setTimeout(() => setVisible(true), 800)
    }

    // Allow re-opening the banner at any time (e.g. footer "ניהול עוגיות"),
    // so a user can review and withdraw a previously given consent — as easily
    // as they gave it (Amendment 13 §8C).
    const handleOpen = () => setVisible(true)
    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen)

    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, CONSENT_ACCEPTED)
    setVisible(false)
    notifyConsentChange()
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, CONSENT_DECLINED)
    setVisible(false)
    notifyConsentChange()
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-label="הסכמה לעוגיות"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        {/* Icon + Text */}
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl mt-0.5">🍪</span>
          <div>
            <p className="font-semibold text-gray-900 text-base mb-1">
              האתר משתמש בעוגיות
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              אנחנו משתמשים בעוגיות כדי לשפר את חוויית הגלישה שלך ולנתח את השימוש באתר.{' '}
              <Link
                to="/privacy"
                className="text-petrol-700 font-medium underline hover:text-petrol-500 transition-colors"
              >
                מדיניות הפרטיות
              </Link>
            </p>
          </div>
        </div>

        {/* Buttons — deliberately equal weight so consent is freely given:
            same size, style and prominence for both decline and accept. */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none min-w-[120px] px-5 py-2.5 text-sm font-semibold text-petrol-700 bg-white border border-petrol-700 rounded-lg hover:bg-petrol-50 transition-colors"
          >
            דחה
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none min-w-[120px] px-5 py-2.5 text-sm font-semibold text-petrol-700 bg-white border border-petrol-700 rounded-lg hover:bg-petrol-50 transition-colors"
          >
            אני מסכים/ה
          </button>
        </div>
      </div>
    </div>
  )
}
