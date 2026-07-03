import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getUserReviews, deleteReview } from '../lib/database'
import RatingStars from '../components/RatingStars'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { logger } from '../utils/logger'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import {
  LineDoc, LineCheck, LineClock, LineX, LinePin, LineEdit,
  LineUser, LineArrowLeft, LineAlert, LineBadgeCheck,
} from '../components/icons/line'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '')

  useScrollReveal([loading, reviews.length])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login', { state: { from: '/profile' } })
      } else {
        loadUserData()
      }
    }
  }, [user, authLoading, navigate])

  const loadUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await getUserReviews(user.id)

      if (error) throw error

      const reviewsData = data || []
      setReviews(reviewsData)

      setStats({
        totalReviews: reviewsData.length,
        approvedReviews: reviewsData.filter(r => r.status === 'approved').length,
        pendingReviews: reviewsData.filter(r => r.status === 'pending').length
      })
    } catch (err) {
      logger.error('Error loading user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (review) => {
    setReviewToDelete(review)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return

    setDeleting(true)
    try {
      const { error } = await deleteReview(reviewToDelete.id)

      if (error) throw error

      logger.log('✅ Review deleted successfully')
      setSuccessMessage(t('profile.deleteSuccess'))
      setDeleteModalOpen(false)
      setReviewToDelete(null)

      await loadUserData()
    } catch (err) {
      logger.error('Error deleting review:', err)
      alert(t('error.generic'))
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="bg-canvas text-ink font-body min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid place-items-center px-5 py-24 text-center">
          <div>
            <span className="mx-auto block w-10 h-10 rounded-full border-4 border-petrol/20 border-t-petrol animate-spin" />
            <p className="mt-4 text-muted">{t('profile.loadingProfile')}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0]

  const statCards = [
    { Icon: LineDoc, value: stats.totalReviews, label: t('profile.totalReviews') },
    { Icon: LineCheck, value: stats.approvedReviews, label: t('profile.approvedReviews') },
    { Icon: LineClock, value: stats.pendingReviews, label: t('profile.pendingReviews') },
  ]

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      {/* Profile hero */}
      <section className="bg-petrol text-white">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/10 grid place-items-center text-3xl font-heading font-black shadow-lift overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-20 h-20 object-cover" />
                ) : (
                  <span>{user.email?.[0].toUpperCase()}</span>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 grid place-items-center w-7 h-7 rounded-full bg-amber-cta text-white shadow">
                <LineBadgeCheck width="16" height="16" />
              </span>
            </div>
            <div>
              <h1 className="font-heading font-black text-3xl lg:text-4xl">{displayName}</h1>
              <p className="mt-1.5 text-white/80 flex items-center gap-2" dir="ltr">
                <LineUser width="16" height="16" /> {user.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="flex-1">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 -mt-8 lg:-mt-10 pb-20">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {statCards.map(({ Icon, value, label }) => (
              <div key={label} className="bg-white rounded-2xl shadow-card border border-black/5 p-5 text-center">
                <span className="mx-auto grid place-items-center w-10 h-10 rounded-xl bg-petrol-50 text-petrol mb-3">
                  <Icon width="20" height="20" />
                </span>
                <div className="font-heading font-black text-3xl text-ink">{value}</div>
                <div className="text-xs sm:text-sm text-muted mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mt-6 p-4 rounded-xl bg-petrol-50 border border-petrol/15 flex items-center gap-3">
              <LineCheck className="text-petrol shrink-0" width="20" height="20" />
              <p className="text-petrol font-medium flex-1">{successMessage}</p>
              <button onClick={() => setSuccessMessage('')} className="text-petrol/60 hover:text-petrol" aria-label="סגור">
                <LineX width="18" height="18" />
              </button>
            </div>
          )}

          {/* Reviews header */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-heading font-bold text-2xl text-ink flex items-center gap-2.5">
              <LineDoc className="text-petrol" width="24" height="24" />
              {t('profile.myReviews')} ({reviews.length})
            </h2>
            <button
              onClick={() => navigate('/write-review')}
              className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-5 py-2.5 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
            >
              <LineEdit width="18" height="18" /> {t('profile.writeNew')}
            </button>
          </div>

          {/* Reviews list */}
          {reviews.length > 0 ? (
            <div className="mt-6 space-y-5">
              {reviews.map((review) => {
                const property = review.properties
                const address = property
                  ? `${property.street} ${property.building_number}, ${t('property.floor')} ${property.floor}, ${t('property.apartment')} ${property.apartment}, ${property.city}`
                  : t('profile.propertyNotAvailable')

                return (
                  <article
                    key={review.id}
                    className="reveal lift bg-white rounded-2xl shadow-card border border-black/5 p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={property ? `/property/${property.id}` : '#'}
                          className="flex items-start gap-2 group mb-3"
                        >
                          <LinePin className="text-petrol mt-1 shrink-0" width="18" height="18" />
                          <span className="font-heading font-bold text-lg text-ink group-hover:text-petrol transition-colors">
                            {address}
                          </span>
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                          <RatingStars rating={review.overall_rating} size="md" />
                          <div className="flex items-center gap-1.5 text-sm text-muted">
                            <LineClock width="14" height="14" />
                            <span>{new Date(review.created_at).toLocaleDateString('he-IL')}</span>
                          </div>
                        </div>
                        {review.review_text && (
                          <p className="text-ink/80 leading-relaxed line-clamp-3">{review.review_text}</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {review.status === 'approved' && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <LineCheck width="13" height="13" /> {t('review.approved')}
                          </Badge>
                        )}
                        {review.status === 'pending' && (
                          <Badge variant="warning" className="flex items-center gap-1">
                            <LineClock width="13" height="13" /> {t('review.pending')}
                          </Badge>
                        )}
                        {review.status === 'rejected' && (
                          <Badge variant="danger" className="flex items-center gap-1">
                            <LineX width="13" height="13" /> {t('review.rejected')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-4 border-t border-black/5">
                      {property ? (
                        <Link
                          to={`/property/${property.id}`}
                          className="inline-flex items-center gap-1 text-petrol hover:text-petrol-700 text-sm font-semibold transition-colors"
                        >
                          {t('profile.viewProperty')}
                          <LineArrowLeft width="16" height="16" />
                        </Link>
                      ) : <span />}

                      <div className="flex items-center gap-2">
                        {review.status !== 'rejected' && (
                          <button
                            onClick={() => navigate(`/edit-review/${review.id}`)}
                            className="btn inline-flex items-center gap-1.5 rounded-lg border border-petrol/25 text-petrol px-3.5 py-2 text-sm font-semibold hover:bg-petrol-50"
                          >
                            <LineEdit width="15" height="15" /> {t('review.edit')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(review)}
                          className="btn inline-flex items-center gap-1.5 rounded-lg border border-red-200 text-red-600 px-3.5 py-2 text-sm font-semibold hover:bg-red-50"
                        >
                          <LineX width="15" height="15" /> {t('review.delete')}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="mt-6 bg-white rounded-2xl shadow-card border border-black/5 p-12 text-center">
              <span className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-petrol-50 text-petrol mb-5">
                <LineDoc width="30" height="30" />
              </span>
              <h3 className="font-heading font-bold text-2xl text-ink mb-2">{t('profile.noReviewsYet')}</h3>
              <p className="text-muted max-w-md mx-auto mb-6">{t('profile.startWriting')}</p>
              <button
                onClick={() => navigate('/write-review')}
                className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-6 py-3 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
              >
                <LineEdit width="18" height="18" /> {t('profile.writeFirstReview')}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-red-100 text-red-600">
              <LineAlert width="24" height="24" />
            </span>
            <h3 className="font-heading font-bold text-xl text-ink">{t('profile.deleteModal.title')}</h3>
          </div>

          <p className="text-muted mb-5">{t('profile.deleteModal.description')}</p>

          {reviewToDelete && (
            <div className="bg-canvas rounded-xl p-4 mb-5 border border-black/5">
              <p className="text-sm text-ink font-semibold mb-1">
                {reviewToDelete.properties?.street} {reviewToDelete.properties?.building_number}
              </p>
              <p className="text-sm text-muted line-clamp-2">{reviewToDelete.review_text}</p>
            </div>
          )}

          <p className="text-sm text-red-600 mb-6 font-medium">{t('profile.deleteModal.warning')}</p>

          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
              className="btn flex-1 rounded-xl border border-black/10 text-ink px-5 py-3 font-semibold hover:bg-canvas disabled:opacity-50"
            >
              {t('form.cancel')}
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-5 py-3 font-bold hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <LineX width="18" height="18" /> {t('profile.deleteModal.confirm')}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  )
}
