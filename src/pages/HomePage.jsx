import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import { getTopRatedProperties } from '../lib/database'
import { supabase } from '../lib/supabase'
import RatingStars from '../components/RatingStars'
import { logger } from '../utils/logger'
import Icon from '../components/icons'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

export default function HomePage() {
  const { t } = useTranslation()
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

      if (reviewsError) logger.error('Error loading reviews:', reviewsError)
      if (propertiesError) logger.error('Error loading properties:', propertiesError)

      setStats({
        totalReviews: reviewsCount || 0,
        totalProperties: propertiesCount || 0,
        neighborhoods: 12
      })

    } catch (err) {
      logger.error('Error loading data:', err)
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
    <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 min-h-screen">
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8 animate-fade-in">
          <Badge variant="primary" className="mb-4 text-base">
            <Icon.Dragon className="w-4 h-4 inline ml-2" />
            {t('app.description')}
          </Badge>
          <h2 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            {t('hero.title')}<br/>
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {t('hero.subtitle')}
            </span>
          </h2>
          <p className="text-2xl text-gray-600 mb-4 font-medium">
            {t('hero.description')}
          </p>
          <div className="flex items-center justify-center gap-8 mt-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                <Icon.Check className="text-accent-600" />
              </div>
              <span className="text-lg font-bold text-gray-900">חינם לחלוטין</span>
            </div>
            <span className="text-gray-300 text-2xl">•</span>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Icon.Dragon className="text-primary-600" />
              </div>
              <span className="text-lg font-bold text-gray-900">כל ביקורת מאומתת</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-16 animate-slide-up">
          <SearchBar />
        </div>

        {/* Two Paths */}
        <div className="max-w-6xl mx-auto mb-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card hover className="p-10 transform transition-all hover:scale-105">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-medium">
              <Icon.Eye className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              רוצה לקרוא ביקורות?
            </h3>
            <p className="text-gray-600 mb-8 text-center leading-relaxed text-lg">
              מתלבט לגבי דירה? קרא ביקורות של שוכרים קודמים וקבל החלטה מושכלת
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon.Check className="w-4 h-4 text-accent-600" />
                </div>
                <span className="text-gray-700 text-lg">ביקורות מאומתות בלבד</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon.Check className="w-4 h-4 text-accent-600" />
                </div>
                <span className="text-gray-700 text-lg">נתונים אמיתיים מהשטח</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon.Check className="w-4 h-4 text-accent-600" />
                </div>
                <span className="text-gray-700 text-lg">חינם לחלוטין</span>
              </li>
            </ul>
            <Link
              to="/search"
              className="block w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all shadow-medium hover:shadow-strong text-lg transform hover:scale-105 text-center"
            >
              {t('hero.ctaSearch')}
            </Link>
          </Card>

          <Card hover className="p-10 transform transition-all hover:scale-105">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-medium">
              <Icon.Edit className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              רוצה לכתוב ביקורת?
            </h3>
            <p className="text-gray-600 mb-8 text-center leading-relaxed text-lg">
              גרת בדירה? עזור לשוכרים הבאים ושתף את החוויה שלך
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon.Check className="w-4 h-4 text-accent-600" />
                </div>
                <span className="text-gray-700 text-lg">אנונימי לחלוטין</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon.Check className="w-4 h-4 text-accent-600" />
                </div>
                <span className="text-gray-700 text-lg">5 דקות בלבד</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon.Check className="w-4 h-4 text-accent-600" />
                </div>
                <span className="text-gray-700 text-lg">עזור לאחרים להחליט</span>
              </li>
            </ul>
            <Link
              to="/write-review"
              className="block w-full px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-bold hover:from-accent-700 hover:to-accent-800 transition-all shadow-medium hover:shadow-strong text-lg transform hover:scale-105 text-center"
            >
              {t('hero.ctaWrite')}
            </Link>
          </Card>
        </div>

        {/* Stats — only show when there's real data */}
        {!loading && (stats.totalReviews > 0 || stats.totalProperties > 0) && (
          <div className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="text-center p-6 hover:shadow-medium transition-shadow">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                {stats.totalReviews.toLocaleString('he-IL')}
              </div>
              <div className="text-gray-600 font-medium text-lg">{t('stats.reviews')}</div>
            </Card>
            <Card className="text-center p-6 hover:shadow-medium transition-shadow">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                {stats.totalProperties.toLocaleString('he-IL')}
              </div>
              <div className="text-gray-600 font-medium text-lg">{t('stats.properties')}</div>
            </Card>
          </div>
        )}

        {/* Top Rated Properties */}
        {topProperties.length > 0 && (
          <div className="max-w-6xl mx-auto mb-32">
            <h3 className="text-4xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
              <Icon.Star className="text-yellow-500" />
              הדירות המדורגות ביותר
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topProperties.map((property) => (
                <Link
                  key={property.id}
                  to={`/property/${property.id}`}
                >
                  <Card hover className="p-8 cursor-pointer transform transition-all hover:scale-105">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-2">
                        <Icon.Building className="text-gray-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-2xl text-gray-900 mb-1">
                            {property.street} {property.building_number}
                          </h4>
                          <p className="text-gray-600 font-medium text-sm">
                            קומה {property.floor}, דירה {property.apartment} | {property.city}
                          </p>
                        </div>
                      </div>
                      {property.overall_rating > 0 && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Icon.Star className="w-4 h-4 fill-current" />
                          <span className="font-bold">
                            {property.overall_rating?.toFixed(1)}
                          </span>
                        </Badge>
                      )}
                    </div>
                    {property.overall_rating > 0 && (
                      <div className="mb-4">
                        <RatingStars rating={property.overall_rating} size="md" />
                      </div>
                    )}
                    <p className="text-gray-600 mb-4 font-medium flex items-center gap-2">
                      <Icon.Message className="w-4 h-4" />
                      {property.total_reviews || 0} {t('property.reviews')}
                    </p>
                    <div className="flex gap-2 text-sm flex-wrap">
                      {getPositiveTags(property).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="success"
                          className="flex items-center gap-1"
                        >
                          <Icon.Check className="w-3 h-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

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
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-medium">
                <Icon.Search className="w-12 h-12 text-white" />
              </div>
              <Badge variant="primary" className="mb-4">שלב 1</Badge>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                חפש את הדירה
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                הזן את כתובת הדירה שאתה שוקל לשכור ומצא את כל הביקורות של שוכרים קודמים
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-medium">
                <Icon.FileText className="w-12 h-12 text-white" />
              </div>
              <Badge variant="secondary" className="mb-4">שלב 2</Badge>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                קרא ביקורות
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                למד על איכות התחזוקה, תקשורת עם בעל הבית, החזרת פיקדון ועוד
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-medium">
                <Icon.Check className="w-12 h-12 text-white" />
              </div>
              <Badge variant="success" className="mb-4">שלב 3</Badge>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                קבל החלטה מושכלת
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                השתמש במידע האמיתי כדי לבחור את הדירה הנכונה עבורך
              </p>
            </div>
          </div>
        </div>

        {/* Why Diragon */}
        <div id="about" className="max-w-6xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-extrabold text-gray-900 mb-4">
              למה דירגון?
            </h3>
            <p className="text-xl text-gray-600 font-medium">
              פלטפורמה לדירוג דירות שנבנית על ידי שוכרים, בשביל שוכרים
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card hover className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-6">
                <Icon.Dragon className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                ביקורות מאומתות בלבד
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                כל ביקורת עוברת אימות ידני על ידי הצוות שלנו. אנחנו דואגים שכל המידע אמיתי ואמין.
              </p>
            </Card>

            <Card hover className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-accent-100 flex items-center justify-center mb-6">
                <Icon.Lock className="w-8 h-8 text-accent-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                אנונימיות מלאה
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                הביקורות שלך נשארות אנונימיות. אתה יכול לשתף את החוויה האמיתית שלך בלי חשש.
              </p>
            </Card>

            <Card hover className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mb-6">
                <Icon.TrendingUp className="w-8 h-8 text-secondary-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                נתונים מפורטים
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                קבל מידע מדויק על כל היבט - תחזוקה, תקשורת, החזרת פיקדון, עמידה בחוזה ועוד.
              </p>
            </Card>

            <Card hover className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                <Icon.Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                חינם לחלוטין
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                אין עלויות נסתרות. הפלטפורמה שלנו חינמית לגמרי למשתמשים - תמיד.
              </p>
            </Card>
          </div>
        </div>

        {/* Trust & Safety */}
        <div className="max-w-6xl mx-auto mb-32">
          <Card className="bg-gradient-to-r from-primary-600 to-secondary-600 p-16 text-white shadow-strong">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Icon.Lock className="w-10 h-10" />
                <h3 className="text-4xl font-extrabold">
                  בטיחות ואבטחה
                </h3>
              </div>
              <p className="text-xl text-blue-100 font-medium">
                אנחנו לוקחים את האבטחה והפרטיות שלך ברצינות
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Icon.Dragon className="w-16 h-16 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">הצפנה מלאה</h4>
                <p className="text-blue-100">כל הנתונים מוצפנים ומאובטחים</p>
              </div>
              <div>
                <Icon.User className="w-16 h-16 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">אנונימיות מובטחת</h4>
                <p className="text-blue-100">הזהות שלך נשארת פרטית תמיד</p>
              </div>
              <div>
                <Icon.Check className="w-16 h-16 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">מודרציה ידנית</h4>
                <p className="text-blue-100">כל ביקורת נבדקת על ידי הצוות שלנו</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <Card className="text-center bg-gradient-to-r from-primary-600 to-secondary-600 p-16 max-w-5xl mx-auto shadow-strong mb-32">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Icon.Dragon className="w-12 h-12 text-white" />
            <h3 className="text-4xl font-extrabold text-white">
              מוכן להתחיל?
            </h3>
          </div>
          <p className="text-xl text-blue-100 mb-8 font-medium">
            הצטרף לקהילת השוכרים שבונים יחד מאגר ביקורות אמיתי על דירות בישראל
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/search"
              className="px-12 py-5 bg-white text-primary-600 rounded-2xl text-xl font-extrabold hover:bg-gray-50 transition-all shadow-medium transform hover:scale-105 inline-flex items-center gap-2"
            >
              <Icon.Search />
              חפש דירה
            </Link>
            <Link
              to="/write-review"
              className="px-12 py-5 bg-accent-600 text-white rounded-2xl text-xl font-extrabold hover:bg-accent-700 transition-all shadow-medium transform hover:scale-105 inline-flex items-center gap-2"
            >
              <Icon.Edit />
              כתוב ביקורת
            </Link>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-32 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <Icon.Dragon className="w-12 h-12" />
                <span className="text-3xl font-extrabold">{t('app.name')}</span>
              </div>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                {t('app.description')} - ביקורות אמיתיות על דירות להשכרה מהשוכרים עצמם.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-4">קישורים</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/search" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Icon.Search className="w-4 h-4" />
                    חיפוש דירות
                  </Link>
                </li>
                <li>
                  <Link to="/write-review" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Icon.Edit className="w-4 h-4" />
                    כתוב ביקורת
                  </Link>
                </li>
                <li>
                  <a href="#about" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Icon.FileText className="w-4 h-4" />
                    אודות
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-bold mb-4">צור קשר</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Icon.Message className="w-4 h-4" />
                  shimon@frame-5.com
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {t('app.name')}. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
