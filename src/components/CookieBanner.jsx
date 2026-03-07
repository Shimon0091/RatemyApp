import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const COOKIE_KEY = 'diragon_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) {
      // Small delay so it doesn't flash on first render
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined')
    setVisible(false)
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
                className="text-blue-600 underline hover:text-blue-800 transition-colors"
                onClick={handleAccept}
              >
                מדיניות הפרטיות
              </Link>
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            דחה
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            אני מסכים/ה
          </button>
        </div>
      </div>
    </div>
  )
}
