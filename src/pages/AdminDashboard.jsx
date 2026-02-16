import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { getPendingReviews, moderateReview, getReports, isUserAdmin } from '../lib/database'
import { supabase } from '../lib/supabase'
import RatingStars from '../components/RatingStars'
import { getAdminEmails } from '../config/admin'
import { logger } from '../utils/logger'
import Icon from '../components/icons'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [pendingReviews, setPendingReviews] = useState([])
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    totalProperties: 0,
    totalUsers: 0,
    pendingReports: 0
  })
  const [activeTab, setActiveTab] = useState('pending') // pending, approved, reports, stats
  const [error, setError] = useState('')

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      logger.log('🔍 AdminDashboard: Checking admin for user:', user.email)

      // Check if user is admin by email or database role
      const adminEmails = getAdminEmails()

      // Check by email first (quick check) - case insensitive
      const userEmailUpper = user.email?.toUpperCase()
      const isEmailAdmin = adminEmails.some(email => email.toUpperCase() === userEmailUpper)

      if (isEmailAdmin) {
        logger.log('✅ AdminDashboard: User is admin by email')
        await loadData()
        return
      }

      // Check by database role
      try {
        const admin = await isUserAdmin(user.id)
        logger.log('📊 AdminDashboard: Admin check from DB:', admin)

        if (!admin) {
          logger.log('❌ AdminDashboard: User is not admin')
          alert('אין לך הרשאות אדמין!')
          navigate('/')
          return
        }

        logger.log('✅ AdminDashboard: User is admin by DB role')
        await loadData()
      } catch (err) {
        logger.error('Error checking admin:', err)
        // If check fails, allow if email is in list
        if (!isEmailAdmin) {
          alert('אין לך הרשאות אדמין!')
          navigate('/')
          return
        }
        await loadData()
      }
    }

    checkAdmin()
  }, [user, navigate])

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      // Get pending reviews
      const { data: pending, error: pendingError } = await getPendingReviews()
      if (pendingError) throw pendingError
      setPendingReviews(pending || [])

      // Get reports
      const { data: reportsData, error: reportsError } = await getReports('pending')
      if (!reportsError) {
        setReports(reportsData || [])
      }

      // Get stats
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('status')

      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id')

      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id')

      const { count: reportsCount } = await supabase
        .from('review_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      setStats({
        totalReviews: reviewsData?.length || 0,
        pendingReviews: reviewsData?.filter(r => r.status === 'pending').length || 0,
        approvedReviews: reviewsData?.filter(r => r.status === 'approved').length || 0,
        rejectedReviews: reviewsData?.filter(r => r.status === 'rejected').length || 0,
        totalProperties: propertiesData?.length || 0,
        totalUsers: usersData?.length || 0,
        pendingReports: reportsCount || 0
      })

    } catch (err) {
      setError('שגיאה בטעינת נתונים: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = async (reviewId, status) => {
    if (!confirm(`האם אתה בטוח שברצונך ${status === 'approved' ? 'לאשר' : 'לדחות'} את הביקורת?`)) {
      return
    }

    try {
      const { error } = await moderateReview(reviewId, status)
      if (error) throw error

      await loadData() // Reload data

    } catch (err) {
      alert('שגיאה: ' + err.message)
    }
  }

  const handleReportAction = async (reportId, action) => {
    const actionText = action === 'resolved' ? 'לסמן כטופל' : 'לדחות'
    if (!confirm(`האם אתה בטוח שברצונך ${actionText} את הדיווח?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('review_reports')
        .update({ status: action })
        .eq('id', reportId)

      if (error) throw error

      await loadData()

    } catch (err) {
      alert('שגיאה: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <LoadingSpinner size="xl" text="טוען נתוני אדמין..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Icon.Settings className="w-12 h-12 text-primary-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              {t('admin.dashboard')}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            ניהול ביקורות ומעקב אחר סטטיסטיקות
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <Icon.Alert className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-primary-500">
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm text-gray-600">{t('stats.reviews')}</div>
              <Icon.FileText className="w-5 h-5 text-primary-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalReviews}</div>
            <div className="text-xs text-gray-500">
              {stats.approvedReviews} {t('review.approved')} • {stats.rejectedReviews} {t('review.rejected')}
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-orange-500">
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm text-gray-600">ממתינות לאישור</div>
              <Icon.Alert className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-2">{stats.pendingReviews}</div>
            <Badge variant="warning" className="text-xs">
              דורש טיפול מיידי
            </Badge>
          </Card>

          <Card className="p-6 border-l-4 border-accent-500">
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm text-gray-600">דירות במערכת</div>
              <Icon.Building className="w-5 h-5 text-accent-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalProperties}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Icon.User className="w-3 h-3" />
              {stats.totalUsers} משתמשים רשומים
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="mb-6 overflow-hidden">
          <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon.Alert className="w-4 h-4" />
              {t('admin.pendingReviews')} ({stats.pendingReviews})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon.Flag className="w-4 h-4" />
              {t('admin.reports')} ({stats.pendingReports})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'approved'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon.Check className="w-4 h-4" />
              מאושרות ({stats.approvedReviews})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon.TrendingUp className="w-4 h-4" />
              סטטיסטיקות
            </button>
          </div>
        </Card>

        {/* Pending Reviews Tab */}
        {activeTab === 'pending' && (
          <div>
            {pendingReviews.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon.Check className="w-20 h-20 mx-auto mb-4 text-accent-500" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  אין ביקורות ממתינות!
                </h3>
                <p className="text-gray-600">
                  כל הביקורות טופלו. עבודה מצוינת!
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {pendingReviews.map(review => (
                  <Card key={review.id} className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-start gap-3">
                        <Icon.MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {review.properties.street} {review.properties.building_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            קומה {review.properties.floor}, דירה {review.properties.apartment} | {review.properties.city}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Icon.Calendar className="w-3 h-3" />
                            נשלח ב: {new Date(review.created_at).toLocaleDateString('he-IL')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RatingStars rating={review.overall_rating} size="lg" />
                      </div>
                    </div>

                    {/* Ratings */}
                    {(review.maintenance_rating || review.communication_rating || review.value_rating) && (
                      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                        {review.maintenance_rating && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1">{t('rating.maintenance')}</div>
                            <RatingStars rating={review.maintenance_rating} size="sm" showNumber={false} />
                          </div>
                        )}
                        {review.communication_rating && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1">{t('rating.communication')}</div>
                            <RatingStars rating={review.communication_rating} size="sm" showNumber={false} />
                          </div>
                        )}
                        {review.value_rating && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1">{t('rating.value')}</div>
                            <RatingStars rating={review.value_rating} size="sm" showNumber={false} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {review.tags && Object.values(review.tags).some(v => v !== null) && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(review.tags).map(([key, value]) => {
                          if (value === null) return null
                          const labels = {
                            depositReturned: 'פיקדון הוחזר',
                            contractRespected: 'עמידה בחוזה',
                            maintenanceTimely: 'תיקונים בזמן',
                            responsive: 'תקשורת מהירה',
                            clean: 'נקייה',
                            quiet: 'שקט'
                          }
                          return (
                            <Badge
                              key={key}
                              variant={value ? 'success' : 'danger'}
                              className="flex items-center gap-1"
                            >
                              {value ? <Icon.Check className="w-3 h-3" /> : <Icon.XMark className="w-3 h-3" />}
                              {labels[key]}
                            </Badge>
                          )
                        })}
                      </div>
                    )}

                    {/* Review Text */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 leading-relaxed">{review.review_text}</p>
                    </div>

                    {/* Rental Period */}
                    {(review.rental_start || review.rental_end) && (
                      <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <Icon.Calendar className="w-4 h-4" />
                        <strong>תקופת שכירות:</strong>
                        {review.rental_start && new Date(review.rental_start + '-01').toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
                        {' - '}
                        {review.rental_end && new Date(review.rental_end + '-01').toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
                      </div>
                    )}

                    {/* Monthly Rent */}
                    {review.monthly_rent && (
                      <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <Icon.Dollar className="w-4 h-4" />
                        <strong>שכר דירה:</strong> ₪{review.monthly_rent.toLocaleString()}/חודש
                      </div>
                    )}

                    {/* Author */}
                    <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                      <Icon.User className="w-4 h-4" />
                      <strong>נכתב על ידי:</strong> {review.user_profiles?.display_name || 'משתמש אנונימי'}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => handleModerate(review.id, 'approved')}
                        variant="accent"
                        className="flex-1"
                      >
                        <Icon.Check className="ml-2" />
                        {t('admin.approve')}
                      </Button>
                      <Button
                        onClick={() => handleModerate(review.id, 'rejected')}
                        variant="danger"
                        className="flex-1"
                      >
                        <Icon.XMark className="ml-2" />
                        {t('admin.reject')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            {reports.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon.Check className="w-20 h-20 mx-auto mb-4 text-accent-500" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('admin.noData')}
                </h3>
                <p className="text-gray-600">
                  אין דיווחים ממתינים לטיפול
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map(report => (
                  <Card key={report.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <Icon.Flag className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                        <div>
                          <Badge variant="danger" className="mb-2">
                            {report.reason}
                          </Badge>
                          <p className="text-gray-800">{report.details}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            דווח ב: {new Date(report.created_at).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => handleReportAction(report.id, 'resolved')}
                        variant="accent"
                        size="sm"
                      >
                        סמן כטופל
                      </Button>
                      <Button
                        onClick={() => handleReportAction(report.id, 'dismissed')}
                        variant="ghost"
                        size="sm"
                      >
                        דחה
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Approved Tab */}
        {activeTab === 'approved' && (
          <Card className="p-12 text-center">
            <Icon.Check className="w-20 h-20 mx-auto mb-4 text-accent-500" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {stats.approvedReviews} ביקורות מאושרות
            </h3>
            <p className="text-gray-600">
              הביקורות המאושרות מופיעות באתר
            </p>
          </Card>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon.FileText className="w-8 h-8 text-primary-500" />
                <h3 className="text-xl font-bold text-gray-900">סטטיסטיקות ביקורות</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">סה"כ ביקורות</span>
                  <span className="font-bold">{stats.totalReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ממתינות</span>
                  <Badge variant="warning">{stats.pendingReviews}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">מאושרות</span>
                  <Badge variant="success">{stats.approvedReviews}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">נדחו</span>
                  <Badge variant="danger">{stats.rejectedReviews}</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon.Building className="w-8 h-8 text-secondary-500" />
                <h3 className="text-xl font-bold text-gray-900">סטטיסטיקות כלליות</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">דירות במערכת</span>
                  <span className="font-bold">{stats.totalProperties}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">משתמשים רשומים</span>
                  <span className="font-bold">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">דיווחים ממתינים</span>
                  <Badge variant="warning">{stats.pendingReports}</Badge>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
