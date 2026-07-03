import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ReviewCard from '../components/ReviewCard'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { getProperty, getPropertyReviews } from '../lib/database'
import { logger } from '../utils/logger'
import {
  LinePin, LineBuilding, LineStarSolid, LineArrowLeft, LineChevronLeft,
  LineWrench, LineChat, LineShekel, LineClock, LineFileCheck, LineHeart,
  LineCar, LineStore, LineEdit, LineFilter, LineAlert,
} from '../components/icons/line'

// Amber star row (matches warm-trust palette).
function StarRow({ rating, size = 18, showNumber = true }) {
  const full = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <LineStarSolid
            key={n}
            width={size}
            height={size}
            className={n <= full ? 'text-amber' : 'text-black/15'}
          />
        ))}
      </span>
      {showNumber && (
        <span className="font-heading font-bold text-ink">{rating.toFixed(1)}</span>
      )}
    </span>
  )
}

export default function PropertyPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('created_at')

  useEffect(() => {
    loadPropertyData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sortBy])

  useScrollReveal([loading, reviews.length, property?.id])

  const loadPropertyData = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: propertyData, error: propertyError } = await getProperty(id)
      if (propertyError) throw propertyError

      if (!propertyData) {
        setError('הדירה לא נמצאה')
        setLoading(false)
        return
      }

      setProperty(propertyData)

      const sortOptions = {
        'created_at': { sortBy: 'created_at', ascending: false },
        'helpful': { sortBy: 'helpful_count', ascending: false },
        'rating_high': { sortBy: 'overall_rating', ascending: false },
        'rating_low': { sortBy: 'overall_rating', ascending: true }
      }

      const { data: reviewsData, error: reviewsError } = await getPropertyReviews(id, sortOptions[sortBy])
      if (reviewsError) throw reviewsError
      setReviews(reviewsData || [])
    } catch (err) {
      logger.error('Error loading property:', err)
      setError('שגיאה בטעינת הנתונים: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const percentage = (count, total) => {
    if (!total) return 0
    return Math.round((count / total) * 100)
  }

  const selectClass =
    'rounded-xl bg-canvas border border-black/10 px-4 py-2.5 text-[15px] text-ink ' +
    'outline-none transition-colors focus:border-petrol focus:ring-2 focus:ring-petrol/20 cursor-pointer'

  if (loading) {
    return (
      <div className="bg-canvas text-ink font-body min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid place-items-center py-24 text-center">
          <div>
            <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-petrol-50 text-petrol animate-pulse">
              <LineBuilding width="28" height="28" />
            </span>
            <div className="mt-4 text-muted">{t('common.loading')}</div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="bg-canvas text-ink font-body min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid place-items-center py-24 px-5 text-center">
          <div className="max-w-md">
            <span className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-red-50 text-red-600">
              <LineAlert width="30" height="30" />
            </span>
            <h1 className="mt-5 font-heading font-extrabold text-2xl text-ink">{t('common.error')}</h1>
            <p className="mt-2 text-muted">{error || t('property.notFound')}</p>
            <button
              onClick={() => navigate('/')}
              className="btn mt-6 inline-flex items-center gap-2 rounded-xl bg-petrol text-white px-6 py-3 font-bold hover:bg-petrol-700"
            >
              {t('common.backToHome')}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const percentStats = [
    { key: 'deposit_returned_count', Icon: LineShekel, label: t('property.depositReturned'), hint: 'שוכרים שקיבלו את הפיקדון בחזרה' },
    { key: 'contract_respected_count', Icon: LineFileCheck, label: t('property.contractRespected'), hint: 'עמידת בעל הדירה בתנאי החוזה' },
    { key: 'maintenance_timely_count', Icon: LineClock, label: t('property.timelyRepairs'), hint: 'תיקונים שבוצעו בזמן סביר' },
    { key: 'parking_available_count', Icon: LineCar, label: t('property.parkingAvailable'), hint: 'זמינות חניה באזור' },
    { key: 'nice_neighbors_count', Icon: LineHeart, label: t('property.niceNeighbors'), hint: 'שכנים נעימים' },
    { key: 'nearby_amenities_count', Icon: LineStore, label: t('property.nearbyAmenities'), hint: 'קרבה לחנויות ושירותים' },
  ]

  const categoryScores = [
    { value: property.maintenance_rating, Icon: LineWrench, label: t('rating.maintenance') },
    { value: property.communication_rating, Icon: LineChat, label: t('rating.communication') },
    { value: property.value_rating, Icon: LineShekel, label: t('rating.value') },
  ].filter((c) => c.value > 0)

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-5 lg:px-8 py-8 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-6" aria-label="breadcrumb">
          <Link to="/" className="hover:text-petrol transition-colors">{t('nav.home')}</Link>
          <LineChevronLeft width="14" height="14" />
          <Link to="/search" className="hover:text-petrol transition-colors">{t('footer.searchProperties')}</Link>
          <LineChevronLeft width="14" height="14" />
          <span className="text-ink font-semibold">{property.street} {property.building_number}</span>
        </nav>

        {/* ============ PROPERTY HEADER ============ */}
        <section className="reveal bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden">
          {/* Cover band with placeholder */}
          <div className="relative h-40 sm:h-48 grid place-items-center bg-[#EFEDE8]">
            <div className="text-center text-muted">
              <LineBuilding className="mx-auto" width="38" height="38" />
              <span className="block mt-2 text-sm font-medium">אין תמונה</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="flex items-start gap-3">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-petrol-50 text-petrol shrink-0">
                  <LinePin width="24" height="24" />
                </span>
                <div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-ink leading-tight">
                    {property.street} {property.building_number}
                  </h1>
                  <p className="mt-1.5 text-muted flex items-center gap-1.5">
                    {(property.floor || property.apartment) && (
                      <>
                        {property.floor && `${t('property.floor')} ${property.floor}`}
                        {property.floor && property.apartment && ', '}
                        {property.apartment && `${t('property.apartment')} ${property.apartment}`}
                        {' · '}
                      </>
                    )}
                    {property.city}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/write-review')}
                className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-6 py-3 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600 shrink-0"
              >
                <LineEdit width="18" height="18" />
                {t('nav.writeReview')}
              </button>
            </div>

            {property.total_reviews > 0 ? (
              <>
                {/* Overall rating strip */}
                <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl bg-petrol text-white p-6">
                  <div className="flex items-center gap-4">
                    <span className="font-heading font-black text-5xl leading-none text-amber">
                      {(property.overall_rating || 0).toFixed(1)}
                    </span>
                    <div>
                      <div className="text-white/70 text-sm mb-1">{t('rating.overall')}</div>
                      <span className="inline-flex" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <LineStarSolid
                            key={n}
                            width="20"
                            height="20"
                            className={n <= Math.round(property.overall_rating || 0) ? 'text-amber' : 'text-white/25'}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                  <div className="sm:mr-auto text-white/80 text-sm">
                    {t('property.basedOn')}{' '}
                    <span className="font-bold text-white">{property.total_reviews}</span>{' '}
                    {t('property.reviews')}
                  </div>
                </div>

                {/* Category scores */}
                {categoryScores.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {categoryScores.map((c) => (
                      <div key={c.label} className="rounded-2xl bg-canvas border border-black/5 p-5">
                        <div className="flex items-center gap-2 text-muted mb-3">
                          <span className="grid place-items-center w-8 h-8 rounded-lg bg-petrol-50 text-petrol">
                            <c.Icon width="18" height="18" />
                          </span>
                          <span className="text-sm font-semibold text-ink">{c.label}</span>
                        </div>
                        <StarRow rating={c.value} size={18} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Percentage stats */}
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {percentStats.map((s) => {
                    const count = property[s.key] || 0
                    const has = count > 0
                    return (
                      <div key={s.key} className="rounded-2xl bg-canvas border border-black/5 p-5 text-center">
                        <span className="mx-auto grid place-items-center w-10 h-10 rounded-xl bg-petrol-50 text-petrol">
                          <s.Icon width="20" height="20" />
                        </span>
                        <div className="mt-3 font-heading font-black text-3xl text-ink">
                          {has ? `${percentage(count, property.total_reviews)}%` : '—'}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-ink">{s.label}</div>
                        <div className="text-xs text-muted mt-0.5">
                          {has ? `${count}/${property.total_reviews} מדווחים` : 'לא דווח'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="mt-7 rounded-2xl bg-canvas border border-black/5 p-10 text-center">
                <span className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600">
                  <LineEdit width="30" height="30" />
                </span>
                <h3 className="mt-5 font-heading font-extrabold text-2xl text-ink">{t('property.noReviewsYet')}</h3>
                <p className="mt-2 text-muted max-w-md mx-auto">{t('property.beFirst')}</p>
                <button
                  onClick={() => navigate('/write-review')}
                  className="btn mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-cta text-white px-7 py-3.5 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
                >
                  <LineEdit width="18" height="18" />
                  {t('property.writeFirstReview')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ============ REVIEWS ============ */}
        {reviews.length > 0 ? (
          <section className="mt-8">
            <div className="reveal flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-petrol-50 text-petrol">
                  <LineChat width="20" height="20" />
                </span>
                <h2 className="font-heading font-extrabold text-2xl text-ink">
                  {t('property.reviewsTitle')}
                  <span className="text-muted font-bold"> ({reviews.length})</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <LineFilter width="18" height="18" className="text-muted" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
                  <option value="created_at">{t('property.sortNewest')}</option>
                  <option value="helpful">{t('property.sortHelpful')}</option>
                  <option value="rating_high">{t('property.sortHighRating')}</option>
                  <option value="rating_low">{t('property.sortLowRating')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="reveal">
                  <ReviewCard
                    review={{
                      id: review.id,
                      overall_rating: review.overall_rating,
                      maintenance_rating: review.maintenance_rating,
                      communication_rating: review.communication_rating,
                      value_rating: review.value_rating,
                      text: review.review_text,
                      date: review.created_at,
                      rental_period: `${review.rental_start || ''} - ${review.rental_end || ''}`,
                      helpful_count: review.helpful_count || 0,
                      not_helpful_count: review.not_helpful_count || 0,
                      tags: review.tags ? Object.entries(review.tags)
                        .filter(([, value]) => value !== null)
                        .map(([key, value]) => ({
                          text: {
                            depositReturned: t('tags.depositReturned'),
                            contractRespected: t('tags.contractRespected'),
                            maintenanceTimely: t('tags.maintenanceTimely'),
                            responsive: t('tags.responsive'),
                            clean: t('tags.clean'),
                            quiet: t('tags.quiet'),
                            parkingAvailable: t('tags.parkingAvailable'),
                            niceNeighbors: t('tags.niceNeighbors'),
                            nearbyAmenities: t('tags.nearbyAmenities')
                          }[key],
                          positive: value
                        })) : []
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : property.total_reviews > 0 ? (
          <section className="mt-8 reveal bg-white rounded-2xl shadow-card border border-black/5 p-10 text-center">
            <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-petrol-50 text-petrol">
              <LineChat width="26" height="26" />
            </span>
            <h3 className="mt-5 font-heading font-bold text-xl text-ink">אין עדיין ביקורות מפורטות</h3>
            <p className="mt-2 text-muted max-w-md mx-auto">
              הדירוגים מבוססים על נתונים קיימים, אבל אף אחד עדיין לא כתב ביקורת מפורטת. היו הראשונים!
            </p>
            <button
              onClick={() => navigate('/write-review')}
              className="btn mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-cta text-white px-7 py-3.5 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
            >
              <LineEdit width="18" height="18" />
              כתבו את הביקורת הראשונה
            </button>
          </section>
        ) : null}

        {/* ============ CTA ============ */}
        <section className="reveal mt-10 rounded-2xl bg-petrol text-white overflow-hidden shadow-lift">
          <div className="p-8 md:p-12 text-center">
            <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-white/10 text-white">
              <LineEdit width="26" height="26" />
            </span>
            <h3 className="mt-5 font-heading font-black text-2xl md:text-3xl">{t('property.livedHere')}</h3>
            <p className="mt-3 text-white/80 max-w-2xl mx-auto text-lg">{t('property.shareExperience')}</p>
            <button
              onClick={() => navigate('/write-review')}
              className="btn mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-cta text-white px-7 py-3.5 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
            >
              {t('property.writeReviewCta')}
              <LineArrowLeft width="18" height="18" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
