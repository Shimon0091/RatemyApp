import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { logger } from '../utils/logger'
import {
  LineCheck, LineAlert, LineUser, LineLock, LineBadgeCheck, LineHeart,
} from '../components/icons/line'

export default function LoginPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { user, signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from || '/'

  useEffect(() => {
    if (user) {
      logger.log('✅ User already logged in, redirecting to:', from)
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      logger.log('🔵 Clicked Google Sign In button')
      const { data, error } = await signInWithGoogle()

      if (error) {
        logger.error('❌ Google sign in error:', error)
        if (error.message?.includes('provider') || error.message?.includes('not enabled')) {
          throw new Error('Google Sign-In לא מוגדר. אנא הגדר את Google OAuth ב-Supabase Dashboard > Authentication > Providers')
        }
        throw error
      }

      if (data?.url) {
        logger.log('✅ Redirecting to Google:', data.url)
        window.location.href = data.url
      } else {
        logger.log('⚠️ No redirect URL received')
        setTimeout(() => setLoading(false), 2000)
      }
    } catch (error) {
      logger.error('Google sign in error:', error)
      setError(error.message || 'שגיאה בהתחברות עם Google. ודא ש-Google OAuth מוגדר ב-Supabase.')
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { error } = await signInWithApple()
      if (error) throw error
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        logger.log('🔵 Attempting email login:', email)
        const { data, error } = await signInWithEmail(email, password)

        if (error) {
          logger.error('❌ Login error:', error)
          if (error.message?.includes('Invalid login credentials')) {
            throw new Error('אימייל או סיסמה שגויים')
          } else if (error.message?.includes('Email not confirmed')) {
            throw new Error('יש לאשר את האימייל לפני התחברות. בדוק את תיבת הדואר שלך.')
          }
          throw error
        }

        if (data?.user) {
          logger.log('✅ Login successful, user:', data.user.email)
          setSuccess('התחברת בהצלחה!')
          setTimeout(() => {
            logger.log('✅ Navigating to:', from)
            navigate(from, { replace: true })
          }, 300)
        } else {
          logger.log('⚠️ Login successful but no user data')
          setTimeout(() => navigate(from, { replace: true }), 500)
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error('הסיסמאות לא תואמות')
        }
        if (!agreeTerms) {
          throw new Error('יש לאשר את תנאי השימוש ומדיניות הפרטיות')
        }

        logger.log('🔵 Attempting email signup:', email)
        const { error } = await signUpWithEmail(email, password)

        if (error) {
          logger.error('❌ Signup error:', error)
          throw error
        }

        logger.log('✅ Signup successful')
        setSuccess('נשלח אליך אימייל לאימות החשבון!')
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      logger.error('❌ Auth error:', error)
      setError(error.message || 'שגיאה בהתחברות. בדוק את האימייל והסיסמה.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl bg-canvas border border-black/10 px-4 py-3 text-[15px] text-ink ' +
    'placeholder:text-muted/70 outline-none transition-colors focus:border-petrol focus:ring-2 focus:ring-petrol/20'

  const trustItems = [
    { Icon: LineLock, label: 'מאובטח לחלוטין' },
    { Icon: LineBadgeCheck, label: 'ביקורות מאומתות' },
    { Icon: LineHeart, label: 'חינם לחלוטין' },
  ]

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <main id="main-content" className="flex-1 grid place-items-center px-5 py-14 lg:py-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card border border-black/5 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-petrol text-white shadow-lift">
                <LineBadgeCheck width="30" height="30" />
              </span>
              <h1 className="mt-5 font-heading font-black text-3xl text-ink">
                {mode === 'login' ? 'ברוכים השבים' : 'הצטרפו לדירגון'}
              </h1>
              <p className="mt-2 text-muted">
                {mode === 'login'
                  ? 'התחברו כדי לכתוב ולקרוא ביקורות'
                  : 'צרו חשבון והתחילו לדרג דירות'}
              </p>
            </div>

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-petrol-50 border border-petrol/15 flex items-start gap-2.5">
                <LineCheck className="text-petrol shrink-0 mt-0.5" width="18" height="18" />
                <p className="text-petrol text-sm font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
                <LineAlert className="text-red-600 shrink-0 mt-0.5" width="18" height="18" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Social Login */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-black/10 bg-white font-semibold text-ink hover:border-petrol/40 hover:bg-canvas disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>המשך עם Google</span>
              </button>

              <button
                onClick={handleAppleSignIn}
                disabled={loading}
                className="btn w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-ink text-white font-semibold hover:bg-black disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>המשך עם Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-muted font-medium">או</span>
              </div>
            </div>

            {/* Email / Password */}
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">{t('form.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  dir="ltr"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">{t('form.password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  dir="ltr"
                  className={inputClass}
                />
                {mode === 'signup' && (
                  <p className="text-xs text-muted mt-2 flex items-center gap-1">
                    <LineAlert width="13" height="13" /> לפחות 6 תווים
                  </p>
                )}
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">אימות סיסמה</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    dir="ltr"
                    className={inputClass}
                  />
                </div>
              )}

              {mode === 'signup' && (
                <label className="flex items-start gap-2.5 cursor-pointer" dir="rtl">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-petrol rounded border-black/20"
                    required
                  />
                  <span className="text-sm text-muted">
                    אני מסכים/ה ל<Link to="/terms" target="_blank" className="text-petrol hover:underline font-semibold">תנאי השימוש</Link> ול<Link to="/privacy" target="_blank" className="text-petrol hover:underline font-semibold">מדיניות הפרטיות</Link>
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber text-white px-6 py-3.5 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    טוען…
                  </>
                ) : (
                  <>
                    <LineUser width="18" height="18" />
                    {mode === 'login' ? t('auth.login') : t('auth.signup')}
                  </>
                )}
              </button>
            </form>

            {/* Toggle mode */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted">
                {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
              </span>{' '}
              <button
                type="button"
                onClick={() => {
                  const newMode = mode === 'login' ? 'signup' : 'login'
                  setMode(newMode)
                  setError('')
                  setSuccess('')
                  setEmail('')
                  setPassword('')
                  setConfirmPassword('')
                  setAgreeTerms(false)
                }}
                className="text-petrol hover:text-petrol-700 hover:underline font-bold cursor-pointer"
              >
                {mode === 'login' ? 'הירשמו עכשיו' : t('auth.login')}
              </button>
            </div>
          </div>

          {/* Trust chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            {trustItems.map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-black/5 shadow-sm px-4 py-2 font-semibold text-ink"
              >
                <Icon className="text-petrol" width="16" height="16" /> {label}
              </span>
            ))}
          </div>

          <p className="text-center text-sm text-muted mt-5">
            ההתחברות נדרשת רק כדי למנוע ספאם ולשמור על אמינות הביקורות.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
