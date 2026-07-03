import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Pagination from '../components/Pagination'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { searchProperties, getNeighborhoods } from '../lib/database'
import {
  LinePin, LineStarSolid, LineSearch, LineFilter, LineBuilding,
  LineArrowLeft, LineEdit, LineAlert, LineX, LineCheck,
} from '../components/icons/line'

// Timeout wrapper for async operations
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    )
  ])
}

export default function SearchResultsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [queryInput, setQueryInput] = useState(query)

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [minRating, setMinRating] = useState(null)
  const [neighborhood, setNeighborhood] = useState(null)
  const [minReviews, setMinReviews] = useState(null)
  const [sortBy, setSortBy] = useState('overall_rating')
  const [neighborhoods, setNeighborhoods] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { setQueryInput(query) }, [query])

  // Load neighborhoods on mount
  useEffect(() => {
    let cancelled = false
    getNeighborhoods()
      .then(({ data }) => {
        if (!cancelled) setNeighborhoods(data || [])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Load search results when query or filters change
  useEffect(() => {
    let cancelled = false

    const doSearch = async () => {
      setLoading(true)
      setError('')

      try {
        const result = await withTimeout(
          searchProperties(query || '', {
            minRating,
            neighborhood,
            minReviews,
            sortBy,
            ascending: false,
            page: currentPage,
            pageSize: 12
          }),
          15000
        )

        if (cancelled) return

        if (result.error) {
          console.error('Search error:', result.error)
        }

        setProperties(result.data || [])
        setTotalCount(result.count ?? 0)
        setTotalPages(result.totalPages || 0)
      } catch (err) {
        if (cancelled) return
        console.error('Search failed:', err)
        setError(
          err.message === 'TIMEOUT'
            ? 'החיפוש לוקח יותר מדי זמן. נסו שוב.'
            : t('error.generic')
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    doSearch()
    return () => { cancelled = true }
  }, [query, minRating, neighborhood, minReviews, sortBy, currentPage, t])

  // Re-scan reveal targets whenever the result set changes.
  useScrollReveal([loading, properties.length, showFilters])

  const retrySearch = useCallback(() => {
    setError('')
    setLoading(true)
    withTimeout(
      searchProperties(query || '', {
        minRating, neighborhood, minReviews, sortBy,
        ascending: false, page: currentPage, pageSize: 12
      }),
      15000
    )
      .then(result => {
        setProperties(result.data || [])
        setTotalCount(result.count ?? 0)
        setTotalPages(result.totalPages || 0)
      })
      .catch(() => setError(t('error.generic')))
      .finally(() => setLoading(false))
  }, [query, minRating, neighborhood, minReviews, sortBy, currentPage, t])

  const handleSubmitSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    const next = queryInput.trim()
    setSearchParams(next ? { q: next } : {})
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearFilters = () => {
    setMinRating(null)
    setNeighborhood(null)
    setMinReviews(null)
    setSortBy('overall_rating')
    setCurrentPage(1)
  }

  const hasActiveFilters = minRating || neighborhood || minReviews || sortBy !== 'overall_rating'
  const activeFilterCount = [minRating, neighborhood, minReviews].filter(Boolean).length

  const getPositiveTags = (property) => {
    const tags = []
    if (property.deposit_returned_count > 0) tags.push(t('tags.depositReturned'))
    if (property.maintenance_timely_count > 0) tags.push(t('tags.maintenanceTimely'))
    if (property.contract_respected_count > 0) tags.push(t('tags.contractRespected'))
    return tags.slice(0, 2)
  }

  const selectClass =
    'w-full rounded-xl bg-canvas border border-black/10 px-4 py-2.5 text-[15px] text-ink ' +
    'outline-none transition-colors focus:border-petrol focus:ring-2 focus:ring-petrol/20 cursor-pointer'

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <main id="main-content" className="flex-1">
        {/* ============ SEARCH HEADER BAND ============ */}
        <section className="bg-petrol text-white">
          <div className="max-w-6xl mx-auto px-5 lg:px-8 pt-12 pb-10 lg:pt-14 lg:pb-12">
            <h1 className="font-heading font-black text-3xl lg:text-4xl leading-tight">
              {query ? t('search.results') : 'כל הדירות'}
            </h1>
            <p className="mt-2.5 text-white/80 text-base lg:text-lg">
              {query ? (
                <>
                  {t('search.found')}{' '}
                  <span className="font-bold text-white">{loading ? '…' : totalCount.toLocaleString('he-IL')}</span>{' '}
                  {t('search.propertiesFor')}{' '}
                  <span className="font-bold text-amber">"{query}"</span>
                </>
              ) : (
                <>{loading ? '…' : totalCount.toLocaleString('he-IL')} דירות מדורגות — חפשו כתובת או עיינו ברשימה</>
              )}
            </p>

            {/* search bar */}
            <form
              onSubmit={handleSubmitSearch}
              className="mt-6 max-w-2xl bg-white rounded-2xl shadow-bar p-2 flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 flex items-center gap-2 px-4 rounded-xl bg-canvas">
                <LinePin className="text-muted shrink-0" width="20" height="20" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  aria-label="חיפוש כתובת"
                  placeholder="הכנס כתובת — לדוגמה: רוטשילד 45, תל אביב"
                  className="w-full bg-transparent py-3 text-[15px] text-ink placeholder:text-muted/80 outline-none"
                  dir="rtl"
                />
              </div>
              <button
                type="submit"
                className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber text-white px-6 py-3 font-bold shadow-[0_10px_24px_-8px_rgba(224,152,46,0.8)] hover:bg-amber-600"
              >
                <LineSearch width="18" height="18" />
                {t('search.searchProperties')}
              </button>
            </form>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
          {/* Filters toggle */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <p className="text-muted text-sm hidden sm:block">
              {!loading && `${totalCount.toLocaleString('he-IL')} תוצאות`}
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn inline-flex items-center gap-2 rounded-full bg-white border border-black/5 shadow-sm px-5 py-2.5 font-semibold text-ink hover:shadow-card"
            >
              <LineFilter width="18" height="18" className="text-petrol" />
              {t('filters.title')}
              {activeFilterCount > 0 && (
                <span className="grid place-items-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-amber text-white text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-8 bg-white rounded-2xl shadow-card border border-black/5 p-6 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">{t('filters.minRating')}</label>
                  <select
                    value={minRating || ''}
                    onChange={(e) => { setMinRating(e.target.value ? Number(e.target.value) : null); setCurrentPage(1) }}
                    className={selectClass}
                  >
                    <option value="">{t('filters.anyReviews')}</option>
                    <option value="4">4+ ★</option>
                    <option value="3">3+ ★</option>
                    <option value="2">2+ ★</option>
                    <option value="1">1+ ★</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">{t('filters.neighborhood')}</label>
                  <select
                    value={neighborhood || ''}
                    onChange={(e) => { setNeighborhood(e.target.value || null); setCurrentPage(1) }}
                    className={selectClass}
                  >
                    <option value="">{t('filters.allNeighborhoods')}</option>
                    {neighborhoods.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">{t('filters.minReviews')}</label>
                  <select
                    value={minReviews || ''}
                    onChange={(e) => { setMinReviews(e.target.value ? Number(e.target.value) : null); setCurrentPage(1) }}
                    className={selectClass}
                  >
                    <option value="">{t('filters.anyReviews')}</option>
                    <option value="10">10+</option>
                    <option value="5">5+</option>
                    <option value="3">3+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">{t('filters.sortBy')}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
                    className={selectClass}
                  >
                    <option value="overall_rating">{t('property.sortHighRating')}</option>
                    <option value="total_reviews">{t('property.sortHelpful')}</option>
                    <option value="created_at">{t('property.sortNewest')}</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-5 pt-5 border-t border-black/5">
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-petrol transition-colors"
                  >
                    <LineX width="16" height="16" />
                    {t('filters.clear')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden animate-pulse">
                  <div className="h-44 bg-[#EFEDE8]" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-2/3 bg-canvas rounded" />
                    <div className="h-4 w-1/2 bg-canvas rounded" />
                    <div className="h-9 w-full bg-canvas rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-white rounded-2xl shadow-card border border-red-100 p-8 text-center max-w-lg mx-auto">
              <span className="grid place-items-center w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600">
                <LineAlert width="26" height="26" />
              </span>
              <p className="mt-4 text-ink font-semibold">{error}</p>
              <button
                onClick={retrySearch}
                className="btn mt-5 inline-flex items-center gap-2 rounded-xl bg-petrol text-white px-6 py-3 font-bold hover:bg-petrol-700"
              >
                נסו שוב
              </button>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <>
              {properties.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property, i) => (
                      <Link
                        key={property.id}
                        to={`/property/${property.id}`}
                        className="reveal lift group bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden flex flex-col"
                      >
                        {/* uniform gray placeholder — no photo field in DB yet */}
                        <div className="relative h-44 grid place-items-center bg-[#EFEDE8]">
                          <div className="text-center text-muted">
                            <LineBuilding className="mx-auto" width="32" height="32" />
                            <span className="block mt-1.5 text-sm font-medium">אין תמונה</span>
                          </div>
                          {property.overall_rating > 0 && (
                            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur text-amber-600 px-2.5 py-1 text-sm font-bold shadow-sm">
                              <LineStarSolid className="text-amber" width="14" height="14" />
                              {property.overall_rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-start gap-2">
                            <LinePin className="text-petrol shrink-0 mt-1" width="18" height="18" />
                            <h3 className="font-heading font-bold text-lg text-ink leading-snug group-hover:text-petrol transition-colors">
                              {property.street} {property.building_number}
                            </h3>
                          </div>
                          <p className="text-muted text-sm mt-1.5">
                            {property.neighborhood ? `${property.neighborhood} · ` : ''}{property.city}
                          </p>
                          <p className="text-muted text-sm mt-1">
                            {property.floor ? `קומה ${property.floor} · ` : ''}
                            <span className="font-semibold text-ink">{property.total_reviews || 0}</span> {t('search.reviews')}
                          </p>

                          {getPositiveTags(property).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {getPositiveTags(property).map((tag) => (
                                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-petrol-50 text-petrol text-xs font-semibold px-3 py-1">
                                  <LineCheck width="12" height="12" /> {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <span className="mt-5 pt-4 border-t border-black/5 inline-flex items-center justify-between text-petrol font-semibold text-sm">
                            קרא ביקורות
                            <LineArrowLeft width="16" height="16" className="transition-transform group-hover:-translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : query ? (
                <div className="bg-white rounded-2xl shadow-card border border-black/5 p-10 md:p-14 text-center max-w-xl mx-auto">
                  <span className="grid place-items-center w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600">
                    <LineEdit width="30" height="30" />
                  </span>
                  <h3 className="mt-6 font-heading font-extrabold text-2xl text-ink">
                    עדיין אין ביקורות על כתובת זו
                  </h3>
                  <p className="mt-3 text-muted leading-relaxed">
                    לא נמצאו ביקורות עבור "{query}".<br />
                    גרתם בכתובת הזו? היו הראשונים לשתף את החוויה שלכם.
                  </p>
                  <button
                    onClick={() => navigate('/write-review')}
                    className="btn mt-6 inline-flex items-center gap-2 rounded-xl bg-amber text-white px-7 py-3.5 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
                  >
                    <LineEdit width="18" height="18" />
                    כתבו ביקורת ראשונה
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-card border border-black/5 p-10 md:p-14 text-center max-w-xl mx-auto">
                  <span className="grid place-items-center w-16 h-16 mx-auto rounded-2xl bg-petrol-50 text-petrol">
                    <LineSearch width="30" height="30" />
                  </span>
                  <h3 className="mt-6 font-heading font-extrabold text-2xl text-ink">
                    {t('search.searchProperties')}
                  </h3>
                  <p className="mt-3 text-muted leading-relaxed">
                    {t('search.useSearchBar')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
