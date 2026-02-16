import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import { getTopRatedProperties } from '../lib/database'
import { supabase } from '../lib/supabase'
import RatingStars from '../components/RatingStars'

export default function HomePage() {
  const [topProperties, setTopProperties] = useState([])
  const [stats, setStats] = useState({
    totalReviews: 0,
    totalProperties: 0,
    neighborhoods: 12
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Get top rated properties
      const { data: properties } = await getTopRatedProperties(3)
      setTopProperties(properties || [])

      // Get stats
      const { count: reviewsCount, error: reviewsError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
      
      const { count: propertiesCount, error: propertiesError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
      
      if (reviewsError) console.error('Error loading reviews:', reviewsError)
      if (propertiesError) console.error('Error loading properties:', propertiesError)

      setStats({
        totalReviews: reviewsCount || 0,
        totalProperties: propertiesCount || 0,
        neighborhoods: 12
      })

    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPositiveTags = (property) => {
    const tags = []
    if (property.deposit_returned_count > 0) tags.push('פיקדון הוחזר')
    if (property.maintenance_timely_count > 0) tags.push('תיקונים מהירים')
    if (property.contract_respected_count > 0) tags.push('עמידה בחוזה')
    return tags.slice(0, 2)
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
            ✨ פלטפורמה מאומתת לביקורות דירות
          </div>
          <h2 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            שוקל להשכיר דירה?<br/>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              בוא תשמע קצת ביקורת עליה
            </span>
          </h2>
          <p className="text-2xl text-gray-600 mb-4 font-medium">
            דירגונים אמיתיים משוכרים ישראלים
          </p>
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xl">🆓</span>
              </div>
              <span className="text-lg font-bold text-gray-900">חינם לחלוטין</span>
            </div>
            <span className="text-gray-300 text-2xl">•</span>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <span className="text-lg font-bold text-gray-900">כל ביקורת מאומתת</span>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-24">
          <SearchBar />
        </div>

        {/* Stats */}
        <div className="mb-24 grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.totalReviews.toLocaleString('he-IL')}
            </div>
            <div className="text-gray-600 font-medium text-lg">ביקורות מאומתות</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.totalProperties.toLocaleString('he-IL')}
            </div>
            <div className="text-gray-600 font-medium text-lg">דירות מדורגות</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {stats.neighborhoods}
            </div>
            <div className="text-gray-600 font-medium text-lg">שכונות בכיסוי</div>
          </div>
        </div>

        {/* Top Rated Properties */}
        <div className="max-w-6xl mx-auto mb-32">
          <h3 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            ⭐ הדירות המדורגות ביותר
          </h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-spin">⏳</div>
              <div className="text-gray-600">טוען דירות...</div>
            </div>
          ) : topProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topProperties.map((property) => (
                <Link 
                  key={property.id} 
                  to={`/property/${property.id}`} 
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-100 cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-2xl text-gray-900 mb-1">
                        {property.street} {property.building_number}
                      </h4>
                      <p className="text-gray-600 font-medium">
                        קומה {property.floor}, דירה {property.apartment} | {property.city}
                      </p>
                    </div>
                    {property.overall_rating > 0 && (
                      <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl">
                        <span className="text-yellow-500 text-xl">⭐</span>
                        <span className="font-bold text-gray-900 text-xl">
                          {property.overall_rating?.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  {property.overall_rating > 0 && (
                    <div className="mb-4">
                      <RatingStars rating={property.overall_rating} size="md" />
                    </div>
                  )}
                  <p className="text-gray-600 mb-4 font-medium">
                    {property.total_reviews || 0} דירגונים
                  </p>
                  <div className="flex gap-2 text-sm flex-wrap">
                    {getPositiveTags(property).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-2 bg-green-50 text-green-700 rounded-xl font-medium"
                      >
                        ✅ {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🐉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                עדיין אין דירות מדורגות
              </h3>
              <p className="text-gray-600 mb-6">
                היה הראשון לכתוב דירגון ולעזור לשוכרים אחרים!
              </p>
              <Link
                to="/write-review"
                className="inline-block px-8 py-4 bg-primary text-white rounded-xl text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
              >
                🐉 כתוב דירגון ראשון
              </Link>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="max-w-6xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-extrabold text-gray-900 mb-4">
              איך זה עובד?
            </h3>
            <p className="text-xl text-gray-600 font-medium">
              3 שלבים פשוטים לקבלת מידע אמיתי על הדירה שלך
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🔍</span>
              </div>
              <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                שלב 1
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                חפש את הדירה
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                הזן את כתובת הדירה שאתה שוקל לשכור ומצא את כל הביקורות של שוכרים קודמים
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <span className="text-5xl">📖</span>
              </div>
              <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-4">
                שלב 2
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                קרא ביקורות
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                למד על איכות התחזוקה, תקשורת עם בעל הבית, החזרת פיקדון ועוד
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-2xl">
                <span className="text-5xl">✅</span>
              </div>
              <div className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                שלב 3
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                קבל החלטה מושכלת
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                השתמש במידע האמיתי כדי לבחור את הדירה הנכונה עבורך
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-16 max-w-5xl mx-auto shadow-2xl mb-32">
          <h3 className="text-4xl font-extrabold text-white mb-6">
            🐉 מוכן להתחיל?
          </h3>
          <p className="text-xl text-blue-100 mb-8 font-medium">
            הצטרף לאלפי שוכרים שכבר משתמשים בדירגון למצוא דירות טובות יותר
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/search"
              className="px-12 py-5 bg-white text-blue-600 rounded-2xl text-xl font-extrabold hover:bg-gray-50 transition-all shadow-2xl transform hover:scale-105"
            >
              חפש דירה
            </Link>
            <Link
              to="/write-review"
              className="px-12 py-5 bg-green-600 text-white rounded-2xl text-xl font-extrabold hover:bg-green-700 transition-all shadow-2xl transform hover:scale-105"
            >
              כתוב ביקורת
            </Link>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-32 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">🐉</span>
                <span className="text-3xl font-extrabold">דירגון</span>
              </div>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                הפלטפורמה המהימנה ביותר לדירוג דירות בישראל. אנחנו עוזרים לאלפי שוכרים למצוא את הדירה המושלמת עם מידע אמיתי ואמין.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6">קישורים מהירים</h4>
              <ul className="space-y-3">
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">איך זה עובד</a></li>
                <li><Link to="/write-review" className="text-gray-400 hover:text-white transition-colors">כתוב ביקורת</Link></li>
                <li><Link to="/search" className="text-gray-400 hover:text-white transition-colors">חפש דירות</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xl font-bold mb-6">משפטי</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">תנאי שימוש</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">מדיניות פרטיות</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <div className="text-gray-500 font-medium">
              © 2026 דירגון. כל הזכויות שמורות.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
