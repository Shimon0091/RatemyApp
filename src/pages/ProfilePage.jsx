import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { getUserReviews, deleteReview } from '../lib/database'
import RatingStars from '../components/RatingStars'
import { logger } from '../utils/logger'
import Icon from '../components/icons'
import { Button } from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Modal } from '../components/ui/Modal'

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

      // Reload reviews
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <LoadingSpinner size="xl" />
          <div className="text-xl text-gray-600 mt-4">{t('profile.loadingProfile')}</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 shadow-medium">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-3xl font-bold text-primary-700 shadow-soft">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span>{user.email?.[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center shadow-medium">
                  <Icon.Check className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Icon.User className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary-50 to-white">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon.FileText className="w-6 h-6 text-primary-600" />
                  <div className="text-3xl font-bold text-primary-600">
                    {stats.totalReviews}
                  </div>
                </div>
                <div className="text-sm text-gray-700 font-medium">{t('profile.totalReviews')}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-accent-50 to-white">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon.Check className="w-6 h-6 text-accent-600" />
                  <div className="text-3xl font-bold text-accent-600">
                    {stats.approvedReviews}
                  </div>
                </div>
                <div className="text-sm text-gray-700 font-medium">{t('profile.approvedReviews')}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-white">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon.Clock className="w-6 h-6 text-yellow-600" />
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats.pendingReviews}
                  </div>
                </div>
                <div className="text-sm text-gray-700 font-medium">{t('profile.pendingReviews')}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Success Message */}
        {successMessage && (
          <Card className="mb-6 shadow-soft bg-accent-50 border-2 border-accent-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Icon.Check className="w-6 h-6 text-accent-600" />
                <p className="text-accent-800 font-medium">{successMessage}</p>
                <button
                  onClick={() => setSuccessMessage('')}
                  className="ml-auto text-accent-600 hover:text-accent-800"
                >
                  <Icon.XCircle className="w-5 h-5" />
                </button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Reviews Section */}
        <div>
          <Card className="mb-6 shadow-soft">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Icon.FileText className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('profile.myReviews')} ({reviews.length})
                  </h2>
                </div>
                <Button onClick={() => navigate('/write-review')} className="flex items-center gap-2">
                  <Icon.Edit />
                  {t('profile.writeNew')}
                </Button>
              </div>
            </CardBody>
          </Card>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => {
                const property = review.properties
                const address = property
                  ? `${property.street} ${property.building_number}, ${t('property.floor')} ${property.floor}, ${t('property.apartment')} ${property.apartment}, ${property.city}`
                  : t('profile.propertyNotAvailable')

                return (
                  <Card
                    key={review.id}
                    className="shadow-soft hover:shadow-medium transition-all"
                  >
                    <CardBody className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <Link
                            to={property ? `/property/${property.id}` : '#'}
                            className="flex items-start gap-2 group mb-3"
                          >
                            <Icon.MapPin className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                            <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {address}
                            </span>
                          </Link>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                            <RatingStars rating={review.overall_rating} size="md" />
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Icon.Calendar className="w-4 h-4" />
                              <span>
                                {new Date(review.created_at).toLocaleDateString('he-IL')}
                              </span>
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="text-gray-700 mt-3 line-clamp-3">
                              {review.review_text}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {review.status === 'approved' && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <Icon.Check className="w-3 h-3" />
                              {t('review.approved')}
                            </Badge>
                          )}
                          {review.status === 'pending' && (
                            <Badge variant="warning" className="flex items-center gap-1">
                              <Icon.Clock className="w-3 h-3" />
                              {t('review.pending')}
                            </Badge>
                          )}
                          {review.status === 'rejected' && (
                            <Badge variant="danger" className="flex items-center gap-1">
                              <Icon.XCircle className="w-3 h-3" />
                              {t('review.rejected')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                        {property && (
                          <Link
                            to={`/property/${property.id}`}
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                          >
                            <span>{t('profile.viewProperty')}</span>
                            <Icon.ArrowRight className="w-4 h-4" />
                          </Link>
                        )}

                        {/* Edit/Delete Actions */}
                        <div className="flex items-center gap-2">
                          {review.status !== 'rejected' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/edit-review/${review.id}`)}
                              className="flex items-center gap-1"
                            >
                              <Icon.Edit className="w-4 h-4" />
                              {t('review.edit')}
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(review)}
                            className="flex items-center gap-1"
                          >
                            <Icon.Trash className="w-4 h-4" />
                            {t('review.delete')}
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="shadow-soft">
              <CardBody className="p-12 text-center">
                <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon.FileText className="w-12 h-12 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('profile.noReviewsYet')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {t('profile.startWriting')}
                </p>
                <Button onClick={() => navigate('/write-review')} size="lg">
                  <Icon.Dragon />
                  {t('profile.writeFirstReview')}
                </Button>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Icon.Alert className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('profile.deleteModal.title')}</h3>
            </div>

            <p className="text-gray-600 mb-6">
              {t('profile.deleteModal.description')}
            </p>

            {reviewToDelete && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 font-medium mb-2">
                  {reviewToDelete.properties?.street} {reviewToDelete.properties?.building_number}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {reviewToDelete.review_text}
                </p>
              </div>
            )}

            <p className="text-sm text-red-600 mb-6 font-medium">
              {t('profile.deleteModal.warning')}
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1"
                disabled={deleting}
              >
                {t('form.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1"
              >
                {deleting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Icon.Trash />
                    {t('profile.deleteModal.confirm')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}
