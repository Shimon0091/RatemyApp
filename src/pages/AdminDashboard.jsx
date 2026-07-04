import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getPendingReviews, moderateReview, getReports, isUserAdmin } from '../lib/database'
import { supabase } from '../lib/supabase'
import RatingStars from '../components/RatingStars'
import { getAdminEmails } from '../config/admin'
import { logger } from '../utils/logger'
import { Badge } from '../components/ui/Badge'
import {
  LineDoc, LineAlert, LineBuilding, LineCheck, LineX, LinePin,
  LineClock, LineShekel, LineUser,
} from '../components/icons/line'
import Icon from '../components/icons'

const TAG_LABELS = {
  depositReturned: 'פיקדון הוחזר',
  contractRespected: 'עמידה בחוזה',
  maintenanceTimely: 'תיקונים בזמן',
  responsive: 'תקשורת מהירה',
  clean: 'נקייה',
  quiet: 'שקט',
}

const REVIEW_STATUS_META = {
  pending: { label: 'ממתינה לאישור', variant: 'warning' },
  approved: { label: 'מאושרת', variant: 'success' },
  rejected: { label: 'הוסרה', variant: 'danger' },
  flagged: { label: 'מושהית', variant: 'warning' },
}

// Presentational: renders the full body of a review from a raw DB row.
// Reused by the pending-reviews tab and the reports tab so a moderator can
// see and act on the actual reported content.
function ReviewDetails({ review, showStatus = false }) {
  const { t } = useTranslation()
  if (!review) {
    return (
      <div className="p-4 bg-canvas rounded-xl border border-black/5 text-sm text-muted">
        הביקורת אינה זמינה עוד (ייתכן שנמחקה).
      </div>
    )
  }

  const statusMeta = REVIEW_STATUS_META[review.status]

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-black/5">
        <div className="flex items-start gap-3 min-w-0">
          <LinePin className="text-petrol shrink-0 mt-1" width="18" height="18" />
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-lg text-ink">
              {review.properties?.street} {review.properties?.building_number}
            </h3>
            <p className="text-sm text-muted">
              קומה {review.properties?.floor}, דירה {review.properties?.apartment} | {review.properties?.city}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted">
              <LineClock width="12" height="12" />
              נשלח ב: {new Date(review.created_at).toLocaleDateString('he-IL')}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <RatingStars rating={review.overall_rating} size="lg" />
          {showStatus && statusMeta && (
            <Badge variant={statusMeta.variant} className="text-xs">{statusMeta.label}</Badge>
          )}
        </div>
      </div>

      {/* Category ratings */}
      {(review.maintenance_rating || review.communication_rating || review.value_rating) && (
        <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-black/5">
          {review.maintenance_rating && (
            <div>
              <div className="text-xs text-muted mb-1">{t('rating.maintenance')}</div>
              <RatingStars rating={review.maintenance_rating} size="sm" showNumber={false} />
            </div>
          )}
          {review.communication_rating && (
            <div>
              <div className="text-xs text-muted mb-1">{t('rating.communication')}</div>
              <RatingStars rating={review.communication_rating} size="sm" showNumber={false} />
            </div>
          )}
          {review.value_rating && (
            <div>
              <div className="text-xs text-muted mb-1">{t('rating.value')}</div>
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
            return (
              <Badge key={key} variant={value ? 'success' : 'danger'} className="flex items-center gap-1">
                {value ? <LineCheck width="12" height="12" /> : <LineX width="12" height="12" />}
                {TAG_LABELS[key] || key}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Review text */}
      <div className="mb-4 p-4 bg-canvas rounded-xl border border-black/5">
        <p className="text-ink/90 leading-relaxed whitespace-pre-wrap">{review.review_text}</p>
      </div>

      {/* Rental period */}
      {(review.rental_start || review.rental_end) && (
        <div className="text-sm text-muted mb-2 flex items-center gap-2">
          <LineClock className="text-petrol" width="16" height="16" />
          <strong className="text-ink font-semibold">תקופת שכירות:</strong>
          {review.rental_start && new Date(review.rental_start + '-01').toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
          {' - '}
          {review.rental_end && new Date(review.rental_end + '-01').toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
        </div>
      )}

      {/* Monthly rent */}
      {review.monthly_rent && (
        <div className="text-sm text-muted mb-2 flex items-center gap-2">
          <LineShekel className="text-petrol" width="16" height="16" />
          <strong className="text-ink font-semibold">שכר דירה:</strong> ₪{review.monthly_rent.toLocaleString()}/חודש
        </div>
      )}

      {/* Author */}
      <div className="text-sm text-muted flex items-center gap-2">
        <LineUser className="text-petrol" width="16" height="16" />
        <strong className="text-ink font-semibold">נכתב על ידי:</strong> {review.user_profiles?.display_name || 'משתמש אנונימי'}
      </div>
    </>
  )
}

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

      const adminEmails = getAdminEmails()

      const userEmailUpper = user.email?.toUpperCase()
      const isEmailAdmin = adminEmails.some(email => email.toUpperCase() === userEmailUpper)

      if (isEmailAdmin) {
        logger.log('✅ AdminDashboard: User is admin by email')
        await loadData()
        return
      }

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
      const { data: pending, error: pendingError } = await getPendingReviews()
      if (pendingError) throw pendingError
      setPendingReviews(pending || [])

      const { data: reportsData, error: reportsError } = await getReports('pending')
      if (!reportsError) {
        setReports(reportsData || [])
      }

      const [
        { count: totalReviews },
        { count: pendingReviewsCount },
        { count: approvedReviews },
        { count: rejectedReviews },
        { count: totalProperties },
        { count: totalUsers },
        { count: reportsCount }
      ] = await Promise.all([
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('review_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        totalReviews: totalReviews || 0,
        pendingReviews: pendingReviewsCount || 0,
        approvedReviews: approvedReviews || 0,
        rejectedReviews: rejectedReviews || 0,
        totalProperties: totalProperties || 0,
        totalUsers: totalUsers || 0,
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
      await loadData()
    } catch (err) {
      alert('שגיאה: ' + err.message)
    }
  }

  // Take moderation action on the reported review itself.
  // reviewStatus: 'rejected' (permanent removal) or 'flagged' (temporary suspension).
  // A moderation note is mandatory and is persisted via moderateReview -> moderation_notes.
  const handleModerateReported = async (report, reviewStatus) => {
    const reviewId = report.reviews?.id
    if (!reviewId) {
      alert('לא ניתן לפעול: הביקורת אינה זמינה עוד.')
      return
    }

    const actionText = reviewStatus === 'rejected' ? 'להסיר' : 'להשהות'
    const note = window.prompt(
      `נא לציין סיבה ל${actionText === 'להסיר' ? 'הסרת' : 'השהיית'} הביקורת (חובה, יישמר ביומן המודרציה):`,
      ''
    )
    if (note === null) return // cancelled
    if (!note.trim()) {
      alert('חובה לציין סיבה לפעולה.')
      return
    }

    try {
      const { error: modError } = await moderateReview(reviewId, reviewStatus, note.trim())
      if (modError) throw modError

      // Mark the report as handled (allowed statuses: pending | reviewed | dismissed).
      const { error: reportError } = await supabase
        .from('review_reports')
        .update({ status: 'reviewed' })
        .eq('id', report.id)
      if (reportError) throw reportError

      await loadData()
    } catch (err) {
      alert('שגיאה: ' + err.message)
    }
  }

  // Dismiss the report without changing the reported review.
  const handleDismissReport = async (report) => {
    if (!confirm('האם אתה בטוח שברצונך לדחות את הדיווח? הביקורת תישאר ללא שינוי.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('review_reports')
        .update({ status: 'dismissed' })
        .eq('id', report.id)

      if (error) throw error
      await loadData()
    } catch (err) {
      alert('שגיאה: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="bg-canvas text-ink font-body min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid place-items-center px-5 py-24 text-center">
          <div>
            <span className="mx-auto block w-10 h-10 rounded-full border-4 border-petrol/20 border-t-petrol animate-spin" />
            <p className="mt-4 text-muted">טוען נתוני אדמין...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const statCards = [
    {
      Icon: LineDoc,
      value: stats.totalReviews,
      label: t('stats.reviews'),
      sub: `${stats.approvedReviews} ${t('review.approved')} · ${stats.rejectedReviews} ${t('review.rejected')}`,
      accent: 'text-petrol',
    },
    {
      Icon: LineAlert,
      value: stats.pendingReviews,
      label: 'ממתינות לאישור',
      badge: <Badge variant="warning" className="text-xs">דורש טיפול מיידי</Badge>,
      accent: 'text-amber-600',
    },
    {
      Icon: LineBuilding,
      value: stats.totalProperties,
      label: 'דירות במערכת',
      sub: `${stats.totalUsers} משתמשים רשומים`,
      accent: 'text-petrol',
    },
  ]

  const tabs = [
    { id: 'pending', Icon: LineAlert, label: `${t('admin.pendingReviews')} (${stats.pendingReviews})` },
    { id: 'reports', Icon: (p) => <Icon.Flag {...p} />, label: `${t('admin.reports')} (${stats.pendingReports})` },
    { id: 'approved', Icon: LineCheck, label: `מאושרות (${stats.approvedReviews})` },
    { id: 'stats', Icon: LineDoc, label: 'סטטיסטיקות' },
  ]

  const EmptyState = ({ title, text }) => (
    <div className="bg-white rounded-2xl shadow-card border border-black/5 p-12 text-center">
      <span className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-petrol-50 text-petrol mb-5">
        <LineCheck width="30" height="30" />
      </span>
      <h3 className="font-heading font-bold text-2xl text-ink mb-2">{title}</h3>
      <p className="text-muted">{text}</p>
    </div>
  )

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="bg-petrol text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 lg:py-14">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/10 shadow-lift shrink-0">
              <Icon.Settings className="w-7 h-7" />
            </span>
            <div>
              <h1 className="font-heading font-black text-3xl lg:text-4xl">{t('admin.dashboard')}</h1>
              <p className="mt-1 text-white/80">ניהול ביקורות ומעקב אחר סטטיסטיקות</p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="flex-1">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 -mt-8 lg:-mt-10 pb-20">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5">
              <LineAlert className="text-red-600 shrink-0 mt-0.5" width="20" height="20" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {statCards.map(({ Icon, value, label, sub, badge, accent }) => (
              <div key={label} className="bg-white rounded-2xl shadow-card border border-black/5 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm text-muted">{label}</div>
                  <Icon className={accent} width="20" height="20" />
                </div>
                <div className={`font-heading font-black text-4xl mb-2 ${accent === 'text-amber-600' ? 'text-amber-600' : 'text-ink'}`}>
                  {value}
                </div>
                {sub && <div className="text-xs text-muted">{sub}</div>}
                {badge}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-8 bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden">
            <div className="flex border-b border-black/5 overflow-x-auto">
              {tabs.map(({ id, Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
                    activeTab === id
                      ? 'border-petrol text-petrol bg-petrol-50'
                      : 'border-transparent text-muted hover:text-ink hover:bg-canvas'
                  }`}
                >
                  <Icon width="16" height="16" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pending Reviews */}
          {activeTab === 'pending' && (
            <div className="mt-6">
              {pendingReviews.length === 0 ? (
                <EmptyState title="אין ביקורות ממתינות!" text="כל הביקורות טופלו. עבודה מצוינת!" />
              ) : (
                <div className="space-y-5">
                  {pendingReviews.map(review => (
                    <article key={review.id} className="bg-white rounded-2xl shadow-card border border-black/5 p-6">
                      <ReviewDetails review={review} />

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 mt-4 border-t border-black/5">
                        <button
                          onClick={() => handleModerate(review.id, 'approved')}
                          className="btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-petrol text-white px-5 py-3 font-bold hover:bg-petrol-700"
                        >
                          <LineCheck width="18" height="18" /> {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => handleModerate(review.id, 'rejected')}
                          className="btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-5 py-3 font-bold hover:bg-red-700"
                        >
                          <LineX width="18" height="18" /> {t('admin.reject')}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <div className="mt-6">
              {reports.length === 0 ? (
                <EmptyState title={t('admin.noData')} text="אין דיווחים ממתינים לטיפול" />
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <article key={report.id} className="bg-white rounded-2xl shadow-card border border-black/5 p-6">
                      {/* Report meta */}
                      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-black/5">
                        <Icon.Flag className="text-red-500 shrink-0 mt-1" width="18" height="18" />
                        <div className="min-w-0">
                          <Badge variant="danger" className="mb-2">{report.reason}</Badge>
                          {report.details && <p className="text-ink/90">{report.details}</p>}
                          <p className="text-xs text-muted mt-2">
                            דווח ב: {new Date(report.created_at).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                      </div>

                      {/* The reported review itself */}
                      <div className="mb-2 rounded-xl border border-black/5 bg-canvas/40 p-4">
                        <div className="text-xs font-semibold text-muted mb-3">הביקורת שדווחה:</div>
                        <ReviewDetails review={report.reviews} showStatus />
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-black/5">
                        <button
                          onClick={() => handleModerateReported(report, 'rejected')}
                          disabled={!report.reviews}
                          className="btn inline-flex items-center gap-1.5 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <LineX width="15" height="15" /> הסר ביקורת
                        </button>
                        <button
                          onClick={() => handleModerateReported(report, 'flagged')}
                          disabled={!report.reviews}
                          className="btn inline-flex items-center gap-1.5 rounded-lg bg-amber-500 text-white px-4 py-2 text-sm font-bold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <LineClock width="15" height="15" /> השהה
                        </button>
                        <button
                          onClick={() => handleDismissReport(report)}
                          className="btn inline-flex items-center gap-1.5 rounded-lg border border-black/10 text-ink px-4 py-2 text-sm font-semibold hover:bg-canvas"
                        >
                          דחה דיווח
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Approved */}
          {activeTab === 'approved' && (
            <div className="mt-6">
              <EmptyState title={`${stats.approvedReviews} ביקורות מאושרות`} text="הביקורות המאושרות מופיעות באתר" />
            </div>
          )}

          {/* Stats */}
          {activeTab === 'stats' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-petrol-50 text-petrol">
                    <LineDoc width="20" height="20" />
                  </span>
                  <h3 className="font-heading font-bold text-xl text-ink">סטטיסטיקות ביקורות</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted">סה"כ ביקורות</span>
                    <span className="font-heading font-bold text-ink">{stats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted">ממתינות</span>
                    <Badge variant="warning">{stats.pendingReviews}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted">מאושרות</span>
                    <Badge variant="success">{stats.approvedReviews}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted">נדחו</span>
                    <Badge variant="danger">{stats.rejectedReviews}</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-petrol-50 text-petrol">
                    <LineBuilding width="20" height="20" />
                  </span>
                  <h3 className="font-heading font-bold text-xl text-ink">סטטיסטיקות כלליות</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted">דירות במערכת</span>
                    <span className="font-heading font-bold text-ink">{stats.totalProperties}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted">משתמשים רשומים</span>
                    <span className="font-heading font-bold text-ink">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted">דיווחים ממתינים</span>
                    <Badge variant="warning">{stats.pendingReports}</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
