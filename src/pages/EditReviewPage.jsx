import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getReviewById, updateReview } from '../lib/database'
import { logger } from '../utils/logger'
import RatingInput from '../components/RatingInput'
import {
  LineEdit, LineAlert, LineCheck, LinePin,
} from '../components/icons/line'

function YesNo({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-canvas rounded-xl border border-black/5">
      <span className="text-ink font-medium">{label}</span>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`btn px-4 py-2 rounded-lg font-semibold text-sm ${
            value === true
              ? 'bg-petrol text-white shadow-lift'
              : 'bg-white text-ink border border-black/10 hover:border-petrol/40'
          }`}
        >
          כן
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`btn px-4 py-2 rounded-lg font-semibold text-sm ${
            value === false
              ? 'bg-red-500 text-white shadow-lift'
              : 'bg-white text-ink border border-black/10 hover:border-red-300'
          }`}
        >
          לא
        </button>
      </div>
    </div>
  )
}

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
  const [parkingAvailable, setParkingAvailable] = useState(null)
  const [niceNeighbors, setNiceNeighbors] = useState(null)
  const [nearbyAmenities, setNearbyAmenities] = useState(null)

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
      const { data: reviewToEdit, error: reviewError } = await getReviewById(id, user.id)

      if (reviewError) throw reviewError

      if (!reviewToEdit) {
        setError(t('editReview.notFound'))
        return
      }

      if (reviewToEdit.status === 'rejected') {
        setError(t('editReview.cannotEditRejected'))
        return
      }

      setReview(reviewToEdit)

      setReviewText(reviewToEdit.review_text || '')
      setOverallRating(reviewToEdit.overall_rating || 0)
      setMaintenanceRating(reviewToEdit.maintenance_rating || 0)
      setCommunicationRating(reviewToEdit.communication_rating || 0)
      setValueRating(reviewToEdit.value_rating || 0)

      if (reviewToEdit.tags) {
        setDepositReturned(reviewToEdit.tags.depositReturned ?? null)
        setContractRespected(reviewToEdit.tags.contractRespected ?? null)
        setMaintenanceTimely(reviewToEdit.tags.maintenanceTimely ?? null)
        setResponsive(reviewToEdit.tags.responsive ?? null)
        setParkingAvailable(reviewToEdit.tags.parkingAvailable ?? null)
        setNiceNeighbors(reviewToEdit.tags.niceNeighbors ?? null)
        setNearbyAmenities(reviewToEdit.tags.nearbyAmenities ?? null)
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
          responsive,
          parkingAvailable,
          niceNeighbors,
          nearbyAmenities
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

  const inputClass =
    'w-full rounded-xl bg-canvas border border-black/10 px-4 py-3 text-[15px] text-ink ' +
    'placeholder:text-muted/70 outline-none transition-colors focus:border-petrol focus:ring-2 focus:ring-petrol/20 resize-none'

  if (authLoading || loading) {
    return (
      <div className="bg-canvas text-ink font-body min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid place-items-center px-5 py-24 text-center">
          <div>
            <span className="mx-auto block w-10 h-10 rounded-full border-4 border-petrol/20 border-t-petrol animate-spin" />
            <p className="mt-4 text-muted">{t('common.loading')}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || !review) {
    return (
      <div className="bg-canvas text-ink font-body min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid place-items-center px-5 py-24">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-black/5 p-8 text-center">
            <span className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-red-100 text-red-600 mb-5">
              <LineAlert width="30" height="30" />
            </span>
            <h2 className="font-heading font-bold text-2xl text-ink mb-2">{t('common.error')}</h2>
            <p className="text-muted mb-6">{error}</p>
            <button
              onClick={() => navigate('/profile')}
              className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-petrol text-white px-6 py-3 font-bold hover:bg-petrol-700"
            >
              {t('common.backToHome')}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const property = review.properties

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="bg-petrol text-white">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/10 shadow-lift shrink-0">
              <LineEdit width="26" height="26" />
            </span>
            <div>
              <h1 className="font-heading font-black text-3xl lg:text-4xl">{t('editReview.title')}</h1>
              {property && (
                <p className="mt-1.5 text-white/80 flex items-center gap-2">
                  <LinePin width="16" height="16" />
                  {property.street} {property.building_number}, {property.city}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="flex-1">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 -mt-8 lg:-mt-10 pb-20 space-y-5">
          {/* Notice */}
          <div className="rounded-2xl bg-amber-100 border border-amber/20 p-5 flex items-start gap-3">
            <LineAlert className="text-amber-600 shrink-0 mt-0.5" width="20" height="20" />
            <div>
              <h3 className="font-heading font-bold text-ink mb-0.5">{t('editReview.notice.title')}</h3>
              <p className="text-sm text-ink/80">{t('editReview.notice.description')}</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
              <LineAlert className="text-red-600 shrink-0" width="20" height="20" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Review text */}
            <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6 lg:p-8">
              <label className="block font-heading font-bold text-lg text-ink mb-4">
                {t('writeReview.step2.reviewText')} *
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className={inputClass}
                rows={6}
                placeholder={t('writeReview.step2.reviewPlaceholder')}
                required
              />
            </div>

            {/* Ratings */}
            <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6 lg:p-8">
              <h3 className="font-heading font-bold text-lg text-ink mb-5">
                {t('writeReview.step2.ratings')} *
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">{t('rating.overall')} *</label>
                  <RatingInput value={overallRating} onChange={setOverallRating} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">{t('rating.maintenance')} *</label>
                  <RatingInput value={maintenanceRating} onChange={setMaintenanceRating} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">{t('rating.communication')} *</label>
                  <RatingInput value={communicationRating} onChange={setCommunicationRating} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">{t('rating.value')} *</label>
                  <RatingInput value={valueRating} onChange={setValueRating} />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6 lg:p-8">
              <h3 className="font-heading font-bold text-lg text-ink mb-5">
                {t('writeReview.step2.specificQuestions')}
              </h3>
              <div className="space-y-3">
                <YesNo label={t('writeReview.step2.depositReturned')} value={depositReturned} onChange={setDepositReturned} />
                <YesNo label={t('writeReview.step2.contractRespected')} value={contractRespected} onChange={setContractRespected} />
                <YesNo label={t('writeReview.step2.maintenanceTimely')} value={maintenanceTimely} onChange={setMaintenanceTimely} />
                <YesNo label={t('writeReview.step2.responsive')} value={responsive} onChange={setResponsive} />

                <div className="pt-3">
                  <h4 className="font-heading font-bold text-ink mb-3">על השכונה</h4>
                </div>

                <YesNo label={t('tags.parkingAvailable')} value={parkingAvailable} onChange={setParkingAvailable} />
                <YesNo label={t('tags.niceNeighbors')} value={niceNeighbors} onChange={setNiceNeighbors} />
                <YesNo label={t('tags.nearbyAmenities')} value={nearbyAmenities} onChange={setNearbyAmenities} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn flex-1 rounded-xl border border-black/10 text-ink px-5 py-3 font-semibold hover:bg-canvas"
              >
                {t('form.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-5 py-3 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600 disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    {t('form.submitting')}
                  </>
                ) : (
                  <>
                    <LineCheck width="18" height="18" /> {t('editReview.save')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
