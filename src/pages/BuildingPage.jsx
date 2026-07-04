import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Seo, { BASE_URL } from '../components/Seo'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Pagination from '../components/Pagination'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { getBuildingByKey, getBuildingReviews, getProperty } from '../lib/database'
import { pathToBuildingKey, buildingKeyToPath } from '../lib/address'
import {
  coerceRating,
  meetsHeadlineGate,
  locationMetricStats,
  locationHighlights,
} from '../lib/buildingSummary'
import { logger } from '../utils/logger'
import {
  LinePin, LineBuilding, LineStarSolid, LineArrowLeft, LineChevronLeft,
  LineChat, LineEdit, LineAlert, LineCheck, LineBadgeCheck,
} from '../components/icons/line'

const REVIEWS_PAGE_SIZE = 20

// Positive review-tag keys → i18n labels (per apartment; landlord-dependent tags
// are allowed HERE because they stay attributed to the specific apartment).
const POSITIVE_TAG_KEYS = [
  'depositReturned', 'contractRespected', 'maintenanceTimely', 'responsive',
  'clean', 'quiet', 'parkingAvailable', 'niceNeighbors', 'nearbyAmenities',
]

function positiveTagLabels(tags, t) {
  if (!tags || typeof tags !== 'object') return []
  return POSITIVE_TAG_KEYS.filter((k) => tags[k] === true).map((k) => t(`tags.${k}`))
}

// "קומה 4 · דירה 12" with graceful fallbacks for partial data.
function apartmentLabel(floor, apartment, t) {
  if (floor && apartment) return t('building.floorApt', { floor, apartment })
  if (floor) return `${t('property.floor')} ${floor}`
  if (apartment) return `${t('property.apartment')} ${apartment}`
  return t('property.details')
}

function StarRow({ rating, size = 20, tone = 'amber' }) {
  const full = Math.round(rating)
  const empty = tone === 'onDark' ? 'text-white/25' : 'text-black/15'
  return (
    <span className="inline-flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <LineStarSolid key={n} width={size} height={size} className={n <= full ? 'text-amber' : empty} />
      ))}
    </span>
  )
}

export default function BuildingPage() {
  const { t, i18n } = useTranslation()
  const params = useParams()
  const navigate = useNavigate()

  const [building, setBuilding] = useState(null)
  const [apartments, setApartments] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewsCount, setReviewsCount] = useState(0)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  const propertyIdsRef = useRef([])
  const buildingKey = pathToBuildingKey(params)

  // Load building + apartments + first page of reviews when the address changes.
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      setNotFound(false)
      setReviewsPage(1)

      try {
        const { data, error: buildingError } = await getBuildingByKey(buildingKey)
        if (buildingError) throw buildingError
        if (cancelled) return

        if (!data) {
          setNotFound(true)
          setBuilding(null)
          return
        }

        setBuilding(data)
        const ids = Array.isArray(data.property_ids) ? data.property_ids : []
        propertyIdsRef.current = ids

        // Per-apartment rows (floor/apartment + per-apt aggregates) for the
        // "apartments in building" list. Small buildings → a handful of reads.
        const propResults = await Promise.all(ids.map((id) => getProperty(id)))
        if (cancelled) return
        const apts = propResults
          .map((r) => r.data)
          .filter(Boolean)
          .sort((a, b) => {
            const byReviews = (Number(b.total_reviews) || 0) - (Number(a.total_reviews) || 0)
            if (byReviews !== 0) return byReviews
            return (Number(a.floor) || 0) - (Number(b.floor) || 0)
          })
        setApartments(apts)

        const rev = await getBuildingReviews(ids, { page: 1, pageSize: REVIEWS_PAGE_SIZE })
        if (cancelled) return
        setReviews(rev.data || [])
        setReviewsCount(rev.count ?? 0)
        setReviewsTotalPages(rev.totalPages || 0)
      } catch (err) {
        if (cancelled) return
        logger.error('Error loading building:', err)
        setError(t('error.generic'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingKey])

  useScrollReveal([loading, apartments.length, reviews.length, building?.building_key])

  const handleReviewsPageChange = useCallback(async (page) => {
    setReviewsPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const rev = await getBuildingReviews(propertyIdsRef.current, { page, pageSize: REVIEWS_PAGE_SIZE })
    setReviews(rev.data || [])
    setReviewsTotalPages(rev.totalPages || 0)
  }, [])

  // Carry street+number+city into the review form (address prefilled). floor/
  // apartment are chosen there, so the correct apartment row is created/matched.
  const goWriteReview = () => {
    if (!building) { navigate('/write-review'); return }
    navigate('/write-review', {
      state: {
        street: building.street || '',
        buildingNumber: building.building_number || '',
        city: building.city || '',
      },
    })
  }

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

  if (notFound || error || !building) {
    return (
      <div className="bg-canvas text-ink font-body min-h-screen flex flex-col">
        <Seo title={`${t('building.notFound')} - דירגון`} noindex />
        <Header />
        <div className="flex-1 grid place-items-center py-24 px-5 text-center">
          <div className="max-w-md">
            <span className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-red-50 text-red-600">
              <LineAlert width="30" height="30" />
            </span>
            <h1 className="mt-5 font-heading font-extrabold text-2xl text-ink">
              {error ? t('common.error') : t('building.notFound')}
            </h1>
            <p className="mt-2 text-muted">{error || t('building.notFoundBody')}</p>
            <button
              onClick={() => navigate('/search')}
              className="btn mt-6 inline-flex items-center gap-2 rounded-xl bg-petrol text-white px-6 py-3 font-bold hover:bg-petrol-700"
            >
              {t('building.backToSearch')}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const overall = coerceRating(building.overall_rating)
  const totalReviews = Number(building.total_reviews) || 0
  // aptCount = registered units (accurate "N דירות רשומות" pill). reviewedAptCount =
  // units that actually have reviews — the honest denominator for the summary
  // sentence and SEO ("across M apartments"), and the k-anonymity gate input.
  const aptCount = Number(building.apartment_count) || 0
  const reviewedAptCount = Number(building.reviewed_apartment_count) || 0
  const showHeadline = meetsHeadlineGate(building)
  const locStats = locationMetricStats(building)
  const highlights = locationHighlights(building)

  const addressLine = `${building.street} ${building.building_number}`.trim()
  const localityLine = [building.neighborhood, building.city].filter(Boolean).join(' · ')
  const fullAddress = [addressLine, building.city].filter(Boolean).join(', ')

  // Deterministic bottom-line sentence — assembled mechanically from data, never AI.
  const highlightLabels = highlights.map((h) => t(h.labelKey))
  const labelsStr =
    highlightLabels.length === 2 ? `${highlightLabels[0]} ו${highlightLabels[1]}` : highlightLabels[0]
  const bottomLineText =
    (overall != null
      ? t('building.summary', { rating: overall.toFixed(1), reviews: totalReviews, apts: reviewedAptCount })
      : '') + (highlightLabels.length ? t('building.summaryHighlights', { labels: labelsStr }) : '')

  // SEO: emit aggregateRating ONLY above the publication gate (§5 caution — no
  // indexed aggregate for buildings below threshold).
  const seoTitle = showHeadline
    ? `${fullAddress} - ביקורות ודירוג בניין | דירגון`
    : `${fullAddress} - ביקורות שוכרים | דירגון`
  const seoDescription = showHeadline
    ? `דירוג ${overall.toFixed(1)} מתוך 5 על סמך ${totalReviews} ביקורות ב-${reviewedAptCount} דירות בכתובת ${fullAddress}. קראו חוות דעת אמיתיות של שוכרים בדירגון.`
    : `ביקורות שוכרים על הדירות בכתובת ${fullAddress}. קראו חוויות אמיתיות או שתפו את שלכם בדירגון.`

  const buildingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: fullAddress,
    url: `${BASE_URL}${buildingKeyToPath(building.building_key)}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: addressLine,
      addressLocality: building.city || undefined,
      addressCountry: 'IL',
    },
  }
  if (showHeadline) {
    buildingJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(overall.toFixed(1)),
      reviewCount: totalReviews,
      bestRating: 5,
      worstRating: 1,
    }
  }

  const dateFmt = (iso) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'he-IL', {
        month: 'long', year: 'numeric',
      })
    } catch { return '' }
  }

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={buildingKeyToPath(building.building_key)}
        jsonLd={buildingJsonLd}
      />
      <Header />

      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-5 lg:px-8 py-8 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-6" aria-label="breadcrumb">
          <Link to="/" className="hover:text-petrol transition-colors">{t('nav.home')}</Link>
          <LineChevronLeft width="14" height="14" />
          <Link to="/search" className="hover:text-petrol transition-colors">{t('footer.searchProperties')}</Link>
          <LineChevronLeft width="14" height="14" />
          <span className="text-ink font-semibold">{addressLine}</span>
        </nav>

        {/* ============ BUILDING HEADER ============ */}
        <section className="reveal bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden">
          {/* Cover band — uniform gray placeholder (no photo field yet) */}
          <div className="relative h-40 sm:h-48 grid place-items-center bg-[#EFEDE8]">
            <div className="text-center text-muted">
              <LineBuilding className="mx-auto" width="38" height="38" />
              <span className="block mt-2 text-sm font-medium">אין תמונה</span>
            </div>
            {overall != null ? (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur text-amber-600 px-2.5 py-1 text-sm font-bold shadow-sm">
                <LineStarSolid className="text-amber" width="14" height="14" />
                {overall.toFixed(1)}
              </span>
            ) : totalReviews > 0 ? (
              // Reviews exist but below the k-anonymity gate (overall gated to NULL
              // in the VIEW): show the review count, never mislabel as "new building".
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur text-petrol px-2.5 py-1 text-xs font-bold shadow-sm">
                <LineChat width="13" height="13" />
                {totalReviews.toLocaleString('he-IL')} {t('search.reviews')}
              </span>
            ) : (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-600 px-2.5 py-1 text-xs font-bold shadow-sm">
                {t('building.newBuilding')}
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="flex items-start gap-3">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-petrol-50 text-petrol shrink-0">
                  <LineBuilding width="24" height="24" />
                </span>
                <div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-ink leading-tight">
                    {addressLine}
                  </h1>
                  {localityLine && (
                    <p className="mt-1.5 text-muted flex items-center gap-1.5">
                      <LinePin width="16" height="16" className="text-petrol shrink-0" />
                      {localityLine}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted">{t('building.aptsRatedHere', { apts: aptCount })}</p>
                </div>
              </div>

              <button
                onClick={goWriteReview}
                className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-6 py-3 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600 shrink-0"
              >
                <LineEdit width="18" height="18" />
                {t('building.writeReview')}
              </button>
            </div>

            {/* ===== "בשורה תחתונה" — gated by publication rule + metric separation ===== */}
            {showHeadline ? (
              <div className="mt-7 rounded-2xl bg-petrol text-white overflow-hidden shadow-lift">
                {/* top strip: aggregate score + LOCATION-metric bars only */}
                <div className="p-6 sm:p-7 flex flex-col lg:flex-row gap-6 lg:gap-8">
                  <div className="flex items-center gap-4 lg:border-l lg:border-white/15 lg:pl-8 shrink-0">
                    <span className="font-heading font-black text-6xl leading-none text-amber">
                      {overall.toFixed(1)}
                    </span>
                    <div>
                      <div className="text-white/70 text-sm mb-1">{t('building.buildingScore')}</div>
                      <StarRow rating={overall} tone="onDark" />
                      <div className="text-white/80 text-sm mt-1.5">
                        {t('property.basedOn')}{' '}
                        <span className="font-bold text-white">{totalReviews.toLocaleString('he-IL')}</span>{' '}
                        {t('search.reviews')} ·{' '}
                        <span className="font-bold text-white">{aptCount.toLocaleString('he-IL')}</span>{' '}
                        {t('search.aptsRegistered')}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 content-center">
                    {locStats.map((s) => (
                      <div key={s.key}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-white/80">{t(s.labelKey)}</span>
                          <span className="font-heading font-bold">{s.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                          <span className="block h-full rounded-full bg-amber" style={{ width: `${s.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* deterministic sentence band + "property, not a person" disclaimer */}
                <div className="bg-white/[0.07] border-t border-white/10 px-6 sm:px-7 py-5">
                  <div className="flex items-start gap-3">
                    <span className="grid place-items-center w-8 h-8 rounded-lg bg-amber/20 text-amber shrink-0 mt-0.5">
                      <LineBadgeCheck width="18" height="18" />
                    </span>
                    <div>
                      <div className="font-heading font-bold text-white text-[15px] mb-1">{t('building.bottomLine')}</div>
                      <p className="text-white/85 leading-relaxed text-[15px]">{bottomLineText}</p>
                    </div>
                  </div>

                  {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {highlights.map((h) => (
                        <span key={h.key} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white text-xs font-semibold px-3 py-1.5">
                          <LineCheck className="text-amber" width="13" height="13" /> {t(h.labelKey)} · {h.pct}%
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 text-white/55 text-xs leading-relaxed">{t('building.disclaimer')}</p>
                </div>
              </div>
            ) : totalReviews > 0 ? (
              // Below the gate: reviews exist but not enough for a unified number.
              <div className="mt-7 rounded-2xl bg-canvas border border-black/5 p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                    <LineAlert width="20" height="20" />
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-ink">{t('building.belowThresholdTitle')}</h3>
                    <p className="mt-1.5 text-muted leading-relaxed text-[15px]">{t('building.belowThresholdBody')}</p>
                    <p className="mt-3 text-muted text-xs leading-relaxed">{t('building.disclaimer')}</p>
                  </div>
                </div>
              </div>
            ) : (
              // New building — no reviews at all. No fabricated 0.0 anywhere.
              <div className="mt-7 rounded-2xl bg-canvas border border-black/5 p-10 text-center">
                <span className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600">
                  <LineEdit width="30" height="30" />
                </span>
                <h3 className="mt-5 font-heading font-extrabold text-2xl text-ink">{t('building.newBuildingTitle')}</h3>
                <p className="mt-2 text-muted max-w-md mx-auto">{t('building.newBuildingBody')}</p>
                <button
                  onClick={goWriteReview}
                  className="btn mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-cta text-white px-7 py-3.5 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
                >
                  <LineEdit width="18" height="18" />
                  {t('property.writeFirstReview')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ============ APARTMENTS IN THE BUILDING ============ */}
        {apartments.length > 0 && (
          <section className="mt-8">
            <div className="reveal flex items-center gap-3 mb-5">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-petrol-50 text-petrol">
                <LineBuilding width="20" height="20" />
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-ink">
                {t('building.apartmentsInBuilding')}
                <span className="text-muted font-bold"> ({apartments.length})</span>
              </h2>
            </div>

            <div className="space-y-3">
              {apartments.map((apt) => {
                const aptRating = coerceRating(apt.overall_rating)
                const aptReviews = Number(apt.total_reviews) || 0
                // Honest gate (mirrors PropertyPage's hasRatings): show a per-apt
                // score ONLY when reviews exist AND the score is > 0. An apartment
                // with 0 reviews keeps overall_rating = 0 (not NULL), so without the
                // reviews check coerceRating(0) === 0 would render a fabricated "0.0".
                const hasAptRating = aptReviews > 0 && aptRating != null && aptRating > 0
                const tags = [
                  apt.deposit_returned_count > 0 && t('tags.depositReturned'),
                  apt.maintenance_timely_count > 0 && t('tags.maintenanceTimely'),
                  apt.contract_respected_count > 0 && t('tags.contractRespected'),
                  apt.nice_neighbors_count > 0 && t('tags.niceNeighbors'),
                ].filter(Boolean).slice(0, 2)
                const meta = aptReviews > 0
                  ? [`${aptReviews.toLocaleString('he-IL')} ${t('search.reviews')}`, ...tags].join(' · ')
                  : t('property.noReviews')
                return (
                  <Link
                    key={apt.id}
                    to={`/property/${apt.id}`}
                    className="reveal lift group flex items-center gap-4 bg-white rounded-2xl shadow-card border border-black/5 p-5"
                  >
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-petrol-50 text-petrol shrink-0 font-heading font-bold">
                      {apt.floor || <LineBuilding width="20" height="20" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-ink group-hover:text-petrol transition-colors truncate">
                        {apartmentLabel(apt.floor, apt.apartment, t)}
                      </div>
                      <p className="text-muted text-sm mt-0.5 truncate">{meta}</p>
                    </div>
                    {hasAptRating && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 text-amber-600 px-2.5 py-1 text-sm font-bold shrink-0">
                        <LineStarSolid className="text-amber" width="14" height="14" />{aptRating.toFixed(1)}
                      </span>
                    )}
                    <LineChevronLeft className="text-muted group-hover:text-petrol transition-all shrink-0" width="18" height="18" />
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ============ BUILDING-WIDE REVIEWS FEED ============ */}
        {reviews.length > 0 && (
          <section className="mt-8">
            <div className="reveal flex items-center gap-3 mb-5">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-petrol-50 text-petrol">
                <LineChat width="20" height="20" />
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-ink">
                {t('building.allReviews')}
                <span className="text-muted font-bold"> ({reviewsCount.toLocaleString('he-IL')})</span>
              </h2>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => {
                const prop = review.properties || {}
                const rRating = coerceRating(review.overall_rating)
                const rTags = positiveTagLabels(review.tags, t)
                return (
                  <div key={review.id} className="reveal bg-white rounded-2xl shadow-card border border-black/5 p-6">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <span className="grid place-items-center w-10 h-10 rounded-full bg-petrol-50 text-petrol font-heading font-bold">א</span>
                        <div>
                          <div className="font-heading font-bold text-ink text-sm">{t('building.anonymousRenter')}</div>
                          <div className="text-muted text-xs">{dateFmt(review.created_at)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {prop.id ? (
                          <Link
                            to={`/property/${prop.id}`}
                            className="inline-flex items-center gap-1 rounded-full bg-canvas border border-black/5 text-muted hover:text-petrol transition-colors text-xs font-semibold px-2.5 py-1"
                          >
                            {apartmentLabel(prop.floor, prop.apartment, t)}
                          </Link>
                        ) : null}
                        {rRating != null && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 text-amber-600 px-2.5 py-1 text-sm font-bold">
                            <LineStarSolid className="text-amber" width="14" height="14" />{rRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="mt-4 text-ink leading-relaxed">{review.review_text}</p>
                    )}
                    {rTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {rTags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-petrol-50 text-petrol text-xs font-semibold px-3 py-1">
                            <LineCheck width="12" height="12" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {reviewsTotalPages > 1 && (
              <Pagination
                currentPage={reviewsPage}
                totalPages={reviewsTotalPages}
                onPageChange={handleReviewsPageChange}
              />
            )}
          </section>
        )}

        {/* ============ CTA ============ */}
        <section className="reveal mt-10 rounded-2xl bg-petrol text-white overflow-hidden shadow-lift">
          <div className="p-8 md:p-12 text-center">
            <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-white/10 text-white">
              <LineEdit width="26" height="26" />
            </span>
            <h3 className="mt-5 font-heading font-black text-2xl md:text-3xl">{t('property.livedHere')}</h3>
            <p className="mt-3 text-white/80 max-w-2xl mx-auto text-lg">{t('property.shareExperience')}</p>
            <button
              onClick={goWriteReview}
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
