import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { getUserReviews, updateReview } from '../lib/database'
import { logger } from '../utils/logger'
import Icon from '../components/icons'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import RatingInput from '../components/RatingInput'

export default function EditReviewPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [review, setReview] = useState(null)

  // Form state
  const [reviewText, setReviewText] = useState('')
  const [overallRating, setOverallRating] = useState(0)
  const [maintenanceRating, setMaintenanceRating] = useState(0)
  const [communicationRating, setCommunicationRating] = useState(0)
  const [valueRating, setValueRating] = useState(0)

  // Tags state
  const [depositReturned, setDepositReturned] = useState(null)
  const [contractRespected, setContractRespected] = useState(null)
  const [maintenanceTimely, setMaintenanceTimely] = useState(null)
  const [responsive, setResponsive] = useState(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login', { state: { from: `/edit-review/${id}` } })
      } else {
        loadReview()
      }
    }
  }, [user, authLoading, id, navigate])

  const loadReview = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: reviews, error: reviewsError } = await getUserReviews(user.id)

      if (reviewsError) throw reviewsError

      const reviewToEdit = reviews.find(r => r.id === id)

      if (!reviewToEdit) {
        setError(t('editReview.notFound'))
        return
      }

      // Check if review is editable (only pending and approved reviews can be edited)
      if (reviewToEdit.status === 'rejected') {
        setError(t('editReview.cannotEditRejected'))
        return
      }

      setReview(reviewToEdit)

      // Populate form with existing data
      setReviewText(reviewToEdit.review_text || '')
      setOverallRating(reviewToEdit.overall_rating || 0)
      setMaintenanceRating(reviewToEdit.maintenance_rating || 0)
      setCommunicationRating(reviewToEdit.communication_rating || 0)
      setValueRating(reviewToEdit.value_rating || 0)

      // Populate tags
      if (reviewToEdit.tags) {
        setDepositReturned(reviewToEdit.tags.depositReturned ?? null)
        setContractRespected(reviewToEdit.tags.contractRespected ?? null)
        setMaintenanceTimely(reviewToEdit.tags.maintenanceTimely ?? null)
        setResponsive(reviewToEdit.tags.responsive ?? null)
      }
    } catch (err) {
      logger.error('Error loading review:', err)
      setError(t('error.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Validation
      if (!reviewText.trim()) {
        setError(t('editReview.reviewTextRequired'))
        setSubmitting(false)
        return
      }

      if (!overallRating || !maintenanceRating || !communicationRating || !valueRating) {
        setError(t('editReview.allRatingsRequired'))
        setSubmitting(false)
        return
      }

      const updates = {
        review_text: reviewText,
        overall_rating: overallRating,
        maintenance_rating: maintenanceRating,
        communication_rating: communicationRating,
        value_rating: valueRating,
        tags: {
          depositReturned,
          contractRespected,
          maintenanceTimely,
          responsive
        },
        status: 'pending' // Reset to pending for re-approval
      }

      const { error: updateError } = await updateReview(id, updates)

      if (updateError) throw updateError

      logger.log('✅ Review updated successfully')
      navigate('/profile', { state: { message: t('editReview.success') } })
    } catch (err) {
      logger.error('Error updating review:', err)
      setError(err.message || t('error.generic'))
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <LoadingSpinner size="xl" />
          <div className="text-xl text-gray-600 mt-4">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (!user || !review) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-md mx-auto shadow-medium">
            <CardBody className="p-8">
              <Icon.Alert className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('common.error')}</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => navigate('/profile')}>
                {t('common.backToHome')}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  const property = review.properties

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-8 shadow-soft">
          <CardHeader className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Icon.Edit className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('editReview.title')}</h1>
                {property && (
                  <p className="text-gray-600 mt-1">
                    {property.street} {property.building_number}, {property.city}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Notice */}
        <Card className="mb-8 shadow-soft bg-yellow-50 border-2 border-yellow-200">
          <CardBody className="p-6">
            <div className="flex items-start gap-3">
              <Icon.Alert className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">{t('editReview.notice.title')}</h3>
                <p className="text-sm text-yellow-800">{t('editReview.notice.description')}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-8 shadow-soft bg-red-50 border-2 border-red-200">
            <CardBody className="p-6">
              <div className="flex items-center gap-3">
                <Icon.Alert className="w-6 h-6 text-red-600" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-8 shadow-medium">
            <CardBody className="p-8">
              {/* Review Text */}
              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  {t('writeReview.step2.reviewText')} *
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors resize-none"
                  rows={6}
                  placeholder={t('writeReview.step2.reviewPlaceholder')}
                  required
                />
              </div>

              {/* Ratings */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {t('writeReview.step2.ratings')} *
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('rating.overall')} *
                    </label>
                    <RatingInput value={overallRating} onChange={setOverallRating} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('rating.maintenance')} *
                    </label>
                    <RatingInput value={maintenanceRating} onChange={setMaintenanceRating} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('rating.communication')} *
                    </label>
                    <RatingInput value={communicationRating} onChange={setCommunicationRating} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('rating.value')} *
                    </label>
                    <RatingInput value={valueRating} onChange={setValueRating} />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {t('writeReview.step2.specificQuestions')}
                </h3>
                <div className="space-y-4">
                  {/* Deposit Returned */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{t('writeReview.step2.depositReturned')}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDepositReturned(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          depositReturned === true
                            ? 'bg-accent-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        {t('common.yes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDepositReturned(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          depositReturned === false
                            ? 'bg-red-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        {t('common.no')}
                      </button>
                    </div>
                  </div>

                  {/* Contract Respected */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{t('writeReview.step2.contractRespected')}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setContractRespected(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          contractRespected === true
                            ? 'bg-accent-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        {t('common.yes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setContractRespected(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          contractRespected === false
                            ? 'bg-red-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        {t('common.no')}
                      </button>
                    </div>
                  </div>

                  {/* Maintenance Timely */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{t('writeReview.step2.maintenanceTimely')}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMaintenanceTimely(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          maintenanceTimely === true
                            ? 'bg-accent-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        {t('common.yes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaintenanceTimely(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          maintenanceTimely === false
                            ? 'bg-red-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        {t('common.no')}
                      </button>
                    </div>
                  </div>

                  {/* Responsive */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{t('writeReview.step2.responsive')}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setResponsive(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          responsive === true
                            ? 'bg-accent-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        {t('common.yes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponsive(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          responsive === false
                            ? 'bg-red-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        {t('common.no')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="flex-1"
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  {t('form.submitting')}
                </>
              ) : (
                <>
                  <Icon.Check />
                  {t('editReview.save')}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
