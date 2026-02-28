import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { isUserAdmin } from '../lib/database'
import { getAdminEmails } from '../config/admin'
import { logger } from '../utils/logger'
import Icon from './icons'

export default function Header() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }

      logger.log('🔍 Checking admin for user:', user.email)

      // Check by email (quick check) - case insensitive
      const adminEmails = getAdminEmails()

      const userEmailUpper = user.email?.toUpperCase()
      const isEmailAdmin = adminEmails.some(email => email.toUpperCase() === userEmailUpper)

      if (isEmailAdmin) {
        logger.log('✅ User is admin by email')
        setIsAdmin(true)
        return
      }

      // Check by database role
      try {
        const admin = await isUserAdmin(user.id)
        logger.log('📊 Admin check from DB:', admin)
        setIsAdmin(admin)
      } catch (err) {
        logger.error('Error checking admin status:', err)
        setIsAdmin(false)
      }
    }

    checkAdmin()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
    setShowUserMenu(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:shadow-strong"
      >
        {t('common.skipToMain')}
      </a>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Icon.Dragon className="text-primary-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('app.name')}</h1>
              <p className="text-sm text-gray-600">{t('app.tagline')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button className="text-gray-700 hover:text-primary-500 transition-colors font-medium">
              {t('nav.about')}
            </button>

            {user ? (
              <>
                <Link
                  to="/write-review"
                  className="text-gray-700 hover:text-primary-500 transition-colors font-medium"
                >
                  {t('nav.writeReview')}
                </Link>

                {/* Admin Link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                  >
                    <Icon.Settings className="w-4 h-4" />
                    {t('nav.admin')}
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-600 font-bold">
                          {user.email?.[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <Icon.ChevronDown className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-gray-200 py-2 z-10 animate-slide-down">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Icon.User />
                        {t('nav.profile')}
                      </Link>
                      <Link
                        to="/my-reviews"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Icon.FileText />
                        {t('nav.myReviews')}
                      </Link>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Icon.LogOut />
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-soft hover:shadow-medium"
              >
                {t('nav.login')}
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {showMobileMenu ? <Icon.Close /> : <Icon.Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 animate-slide-down">
            <nav className="flex flex-col gap-3">
              <button className="text-right px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                {t('nav.about')}
              </button>

              {user ? (
                <>
                  <Link
                    to="/write-review"
                    className="text-right px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t('nav.writeReview')}
                  </Link>

                  <Link
                    to="/profile"
                    className="text-right px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t('nav.profile')}
                  </Link>

                  <Link
                    to="/my-reviews"
                    className="text-right px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t('nav.myReviews')}
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-right px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t('nav.admin')}
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="text-right px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-center px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('nav.login')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  )
}
