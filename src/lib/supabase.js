import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger'

// 🚨 שים לב: אלה placeholders!
// אתה תצטרך להחליף את הערכים האלה אחרי שתיצור חשבון Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// בדיקת חיבור
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  logger.error('❌ VITE_SUPABASE_URL לא מוגדר! בדוק את קובץ .env')
}
if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  logger.error('❌ VITE_SUPABASE_ANON_KEY לא מוגדר! בדוק את קובץ .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// בדיקת חיבור ראשונית
logger.log('🔍 בודק חיבור ל-Supabase...')
logger.log('📍 URL:', supabaseUrl)
logger.log('🔑 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'לא מוגדר')

supabase.from('properties').select('id').limit(1).then(({ data, error }) => {
  if (error) {
    logger.error('❌ שגיאה בחיבור ל-Supabase:')
    logger.error('   הודעת שגיאה:', error.message)
    logger.error('   קוד שגיאה:', error.code)
    logger.error('   פרטים:', error.details || error.hint || 'אין פרטים נוספים')
    logger.error('')
    logger.error('📋 פתרונות אפשריים:')
    logger.error('   1. ודא שהמפתחות ב-.env נכונים')
    logger.error('   2. הפעל מחדש את השרת (Ctrl+C ואז npm run dev)')
    logger.error('   3. ודא שה-database schema הוגדר (הרץ את database_schema.sql ב-Supabase SQL Editor)')
    logger.error('   4. בדוק שה-RLS policies מוגדרים נכון')
    logger.error('   5. בדוק שהטבלאות קיימות ב-Supabase Dashboard > Table Editor')
  } else {
    logger.log('✅ חיבור ל-Supabase הצליח!')
    logger.log('📊 Database מוכן לשימוש')
  }
}).catch(err => {
  logger.error('❌ שגיאה קריטית בחיבור:', err)
})

// פונקציות עזר לאימות
export const authHelpers = {
  // התחברות עם Google
  async signInWithGoogle() {
    logger.log('🔵 Starting Google OAuth sign in...')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      logger.error('❌ Google OAuth error:', error)
    } else {
      logger.log('✅ Google OAuth redirect initiated')
    }
    
    return { data, error }
  },

  // התחברות עם Apple
  async signInWithApple() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin
      }
    })
    return { data, error }
  },

  // התחברות עם אימייל/סיסמה
  async signInWithEmail(email, password) {
    logger.log('🔵 Attempting email/password sign in for:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      logger.error('❌ Email sign in error:', error.message)
    } else {
      logger.log('✅ Email sign in successful:', data.user?.email)
    }
    
    return { data, error }
  },

  // הרשמה עם אימייל/סיסמה
  async signUpWithEmail(email, password, metadata = {}) {
    logger.log('🔵 Attempting email signup for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin
      }
    })
    
    if (error) {
      logger.error('❌ Signup error:', error.message)
      
      // Better error messages
      if (error.message?.includes('Database error')) {
        // Try to create user profile manually if trigger failed
        logger.log('⚠️ Database error - trigger may have failed')
      }
    } else if (data?.user) {
      logger.log('✅ Signup successful:', data.user.email)
      
      // Try to create user profile manually (in case trigger doesn't exist or fails)
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            display_name: metadata.full_name || email.split('@')[0],
            avatar_url: null
          }, {
            onConflict: 'id'
          })
        
        if (profileError) {
          logger.warn('⚠️ Could not create user profile:', profileError.message)
        } else {
          logger.log('✅ User profile created')
        }
      } catch (profileErr) {
        logger.warn('⚠️ Profile creation error:', profileErr)
      }
    }
    
    return { data, error }
  },

  // התנתקות
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // קבלת משתמש נוכחי
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // האזנה לשינויים באימות
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
