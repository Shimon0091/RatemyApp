import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { logger } from '../utils/logger'
import Icon from '../components/icons'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export default function LoginPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { user, signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from || '/'

  // Redirect if already logged in
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
        // Check if Google provider is not configured
        if (error.message?.includes('provider') || error.message?.includes('not enabled')) {
          throw new Error('Google Sign-In לא מוגדר. אנא הגדר את Google OAuth ב-Supabase Dashboard > Authentication > Providers')
        }
        throw error
      }

      // If we get a URL, it means redirect will happen
      if (data?.url) {
        logger.log('✅ Redirecting to Google:', data.url)
        window.location.href = data.url
      } else {
        logger.log('⚠️ No redirect URL received')
        // Google auth should redirect automatically, but if not, wait a bit
        setTimeout(() => {
          setLoading(false)
        }, 2000)
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
      // Apple auth redirects automatically
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
          // Better error messages
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
          // Wait a bit for AuthContext to update, then navigate
          setTimeout(() => {
            logger.log('✅ Navigating to:', from)
            navigate(from, { replace: true })
          }, 300)
        } else {
          logger.log('⚠️ Login successful but no user data')
          // Still navigate, AuthContext will handle it
          setTimeout(() => {
            navigate(from, { replace: true })
          }, 500)
        }
      } else {
        logger.log('🔵 Attempting email signup:', email)
        const { error } = await signUpWithEmail(email, password)

        if (error) {
          logger.error('❌ Signup error:', error)
          throw error
        }

        logger.log('✅ Signup successful')
        setSuccess('נשלח אליך אימייל לאימות החשבון!')
        // Clear form
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Card */}
          <Card className="p-8 shadow-strong">
            {/* Header */}
            <div className="text-center mb-8">
              <Icon.Dragon className="w-20 h-20 mx-auto mb-4 text-primary-500" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? 'ברוך הבא חזרה!' : 'הצטרף לדירגון'}
              </h1>
              <p className="text-gray-600">
                {mode === 'login'
                  ? 'התחבר כדי לכתוב דירגונים'
                  : 'צור חשבון ותתחיל לדרג דירות'}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-accent-50 border border-accent-200 rounded-lg flex items-start gap-2">
                <Icon.Check className="text-accent-600 flex-shrink-0 mt-0.5" />
                <p className="text-accent-700 text-sm">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <Icon.Alert className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3
                         border-2 border-gray-300 rounded-xl hover:border-primary-500
                         hover:bg-gray-50 transition-all font-medium disabled:opacity-50
                         shadow-soft hover:shadow-medium"
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
                className="w-full flex items-center justify-center gap-3 px-6 py-3
                         bg-black text-white rounded-xl hover:bg-gray-800
                         transition-all font-medium disabled:opacity-50
                         shadow-soft hover:shadow-medium"
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
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">או</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <Input
                label={t('form.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                dir="ltr"
              />

              <div>
                <Input
                  label={t('form.password')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  dir="ltr"
                />
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Icon.Alert className="w-3 h-3" />
                    לפחות 6 תווים
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    טוען...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? (
                      <>
                        <Icon.User className="ml-2" />
                        {t('auth.login')}
                      </>
                    ) : (
                      <>
                        <Icon.User className="ml-2" />
                        {t('auth.signup')}
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">
                {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
              </span>
              {' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  const newMode = mode === 'login' ? 'signup' : 'login'
                  logger.log('Switching mode from', mode, 'to', newMode)
                  setMode(newMode)
                  setError('')
                  setSuccess('')
                  setEmail('')
                  setPassword('')
                }}
                className="text-primary-600 hover:text-primary-700 hover:underline font-semibold cursor-pointer"
              >
                {mode === 'login' ? 'הירשם עכשיו' : t('auth.login')}
              </button>
            </div>
          </Card>

          {/* Info */}
          <p className="text-center text-sm text-gray-500 mt-6">
            בהרשמה, אתה מסכים ל
            <a href="#" className="text-primary-600 hover:text-primary-700 hover:underline mx-1 font-medium">תנאי השימוש</a>
            ול
            <a href="#" className="text-primary-600 hover:text-primary-700 hover:underline mx-1 font-medium">מדיניות הפרטיות</a>
          </p>

          {/* Additional Info Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center hover:shadow-medium transition-shadow">
              <Icon.Lock className="w-8 h-8 mx-auto mb-2 text-primary-500" />
              <p className="text-sm text-gray-600 font-medium">מאובטח לחלוטין</p>
            </Card>
            <Card className="p-4 text-center hover:shadow-medium transition-shadow">
              <Icon.Dragon className="w-8 h-8 mx-auto mb-2 text-secondary-500" />
              <p className="text-sm text-gray-600 font-medium">ביקורות מאומתות</p>
            </Card>
            <Card className="p-4 text-center hover:shadow-medium transition-shadow">
              <Icon.Heart className="w-8 h-8 mx-auto mb-2 text-accent-500" />
              <p className="text-sm text-gray-600 font-medium">חינם לחלוטין</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
