import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, authHelpers } from '../lib/supabase'
import { logger } from '../utils/logger'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ensure user profile exists in database
  async function ensureUserProfile(user) {
    if (!user) return
    
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (!existingProfile) {
        logger.log('📝 Creating user profile...')
        // Create profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'משתמש',
            avatar_url: user.user_metadata?.avatar_url || null
          })
        
        if (error) {
          logger.error('❌ Error creating user profile:', error)
        } else {
          logger.log('✅ User profile created')
        }
      }
    } catch (err) {
      // Profile might already exist, that's fine
      logger.log('ℹ️ User profile check:', err.message)
    }
  }

  useEffect(() => {
    // בדוק אם יש משתמש מחובר (כולל OAuth callback)
    checkUser()

    // האזן לשינויים באימות
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.log('🔐 Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          logger.log('✅ User signed in:', session.user.email)
          setUser(session.user)
          setLoading(false)
          
          // Ensure user profile exists (fallback if trigger doesn't work)
          await ensureUserProfile(session.user)
          
          // Clean URL hash after successful sign in (for OAuth)
          setTimeout(() => {
            if (window.location.hash) {
              logger.log('🧹 Cleaning URL hash')
              window.history.replaceState({}, document.title, window.location.pathname + (window.location.search || ''))
            }
          }, 1000)
        } else if (event === 'SIGNED_OUT') {
          logger.log('👋 User signed out')
          setUser(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          logger.log('🔄 Token refreshed')
          setUser(session?.user ?? null)
          setLoading(false)
        } else if (event === 'USER_UPDATED') {
          logger.log('👤 User updated')
          setUser(session?.user ?? null)
        } else {
          // Handle other events (like initial load)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      // Check for OAuth callback in URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const error = hashParams.get('error')
      
      if (error) {
        logger.error('❌ OAuth error in URL:', error)
        const errorDescription = hashParams.get('error_description')
        logger.error('Error description:', errorDescription)
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname)
        setLoading(false)
        return
      }
      
      // If we have hash fragments, Supabase needs to process them
      // getSession() automatically reads from URL hash and creates session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        logger.error('❌ Error getting session:', sessionError)
        // Fallback to getUser if getSession fails
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          logger.log('✅ User found via getUser:', user.email)
          setUser(user)
        }
      } else if (session?.user) {
        logger.log('✅ Session found:', session.user.email)
        setUser(session.user)
        
        // Ensure user profile exists
        await ensureUserProfile(session.user)
        
        // If we came from OAuth callback (has hash), clean the URL after a delay
        if (accessToken && window.location.hash) {
          logger.log('🧹 OAuth callback detected, will clean URL in 1 second')
          setTimeout(() => {
            if (window.location.hash) {
              window.history.replaceState({}, document.title, window.location.pathname + (window.location.search || ''))
              logger.log('✅ URL cleaned')
            }
          }, 1000)
        }
      } else {
        // No session, check for user anyway (might be logged in from previous session)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          logger.log('✅ User found (no active session):', user.email)
          setUser(user)
        } else {
          logger.log('ℹ️ No user found')
        }
      }
    } catch (error) {
      logger.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle: authHelpers.signInWithGoogle,
    signInWithApple: authHelpers.signInWithApple,
    signInWithEmail: authHelpers.signInWithEmail,
    signUpWithEmail: authHelpers.signUpWithEmail,
    signOut: async () => {
      await authHelpers.signOut()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
