import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import RatingStars from '../components/RatingStars'
import Pagination from '../components/Pagination'
import { searchProperties, getNeighborhoods } from '../lib/database'
import { logger } from '../utils/logger'
import Icon from '../components/icons'
import { Button } from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export default function SearchResultsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

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

  // Load neighborhoods on mount
  useEffect(() => {
    loadNeighborhoods()
  }, [])

  // Load search results when query or filters change
  useEffect(() => {
    loadSearchResults()
  }, [query, minRating, neighborhood, minReviews, sortBy, currentPage])

  const loadNeighborhoods = async () => {
    try {
      const { data } = await getNeighborhoods()
      setNeighborhoods(data || [])
    } catch (err) {
      logger.error('Error loading neighborhoods:', err)
    }
  }

  const loadSearchResults = async () => {
    setLoading(true)
    setError('')

    try {
      // Add timeout so search never hangs forever
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 10000)
      )

      const searchPromise = searchProperties(query, {
        minRating,
        neighborhood,
        minReviews,
        sortBy,
        ascending: false,
        page: currentPage,
        pageSize: 12
      })

      const { data, error: searchError, count, totalPages: pages } = await Promise.race([
        searchPromise,
        timeoutPromise
      ])

      if (searchError) throw searchError

      setProperties(data || [])
      setTotalCount(count || 0)
      setTotalPages(pages || 0)
    } catch (err) {
      logger.error('Error searching:', err)
      setError(err.message === 'timeout' ? 'החיפוש לקח יותר מדי זמן. נסה שוב.' : t('error.generic'))
    } finally {
      setLoading(false)
    }
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

  const getPositiveTags = (property) => {
    const tags = []
    if (property.deposit_returned_count > 0) tags.push(t('tags.depositReturned'))
    if (property.maintenance_timely_count > 0) tags.push(t('tags.maintenanceTimely'))
    if (property.contract_respected_count > 0) tags.push(t('tags.contractRespected'))
    return tags.slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Card className="mb-8 shadow-soft">
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Icon.Search className="w-8 h-8 text-primary-600" />
                  <h1 className="text-3xl font-bold text-gray-900">
                    {t('search.results')}
                  </h1>
                </div>
                {query && (
                  <p className="text-gray-600 text-lg">
                    {t('search.found')} <span className="font-bold text-primary-600">{loading ? '...' : totalCount}</span> {t('search.propertiesFor')} <span className="font-semibold text-gray-900">"{query}"</span>
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Icon.Filter />
                {t('filters.title')}
                {hasActiveFilters && (
                  <Badge variant="primary" className="ml-2">
                    {[minRating, neighborhood, minReviews].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-8 shadow-medium">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.minRating')}
                  </label>
                  <select
                    value={minRating || ''}
                    onChange={(e) => {
                      setMinRating(e.target.value ? Number(e.target.value) : null)
                      setCurrentPage(1)
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  >
                    <option value="">{t('filters.anyReviews')}</option>
                    <option value="4">4+ ⭐</option>
                    <option value="3">3+ ⭐</option>
                    <option value="2">2+ ⭐</option>
                    <option value="1">1+ ⭐</option>
                  </select>
                </div>

                {/* Neighborhood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.neighborhood')}
                  </label>
                  <select
                    value={neighborhood || ''}
                    onChange={(e) => {
                      setNeighborhood(e.target.value || null)
                      setCurrentPage(1)
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  >
                    <option value="">{t('filters.allNeighborhoods')}</option>
                    {neighborhoods.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                {/* Min Reviews */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.minReviews')}
                  </label>
                  <select
                    value={minReviews || ''}
                    onChange={(e) => {
                      setMinReviews(e.target.value ? Number(e.target.value) : null)
                      setCurrentPage(1)
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  >
                    <option value="">{t('filters.anyReviews')}</option>
                    <option value="10">10+</option>
                    <option value="5">5+</option>
                    <option value="3">3+</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.sortBy')}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  >
                    <option value="overall_rating">{t('property.sortHighRating')}</option>
                    <option value="total_reviews">{t('property.sortHelpful')}</option>
                    <option value="created_at">{t('property.sortNewest')}</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button variant="ghost" onClick={handleClearFilters} className="flex items-center gap-2">
                    <Icon.XCircle />
                    {t('filters.clear')}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card className="shadow-soft">
            <CardBody className="text-center py-16">
              <LoadingSpinner size="xl" />
              <div className="text-xl text-gray-600 mt-4">{t('search.searching')}</div>
            </CardBody>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="shadow-soft bg-red-50 border-2 border-red-200 mb-8">
            <CardBody className="p-6 text-center">
              <Icon.Alert className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <div className="text-red-700 font-medium">{error}</div>
            </CardBody>
          </Card>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {properties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/property/${property.id}`}
                    className="block group"
                  >
                    <Card className="h-full shadow-soft hover:shadow-strong transition-all duration-300 border-2 border-transparent hover:border-primary-200 transform hover:-translate-y-1">
                      <CardBody className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 mb-2">
                              <Icon.MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                                {property.street} {property.building_number}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Icon.Building className="w-4 h-4" />
                              {t('property.floor')} {property.floor}, {t('property.apartment')} {property.apartment} | {property.city}
                            </p>
                          </div>
                          {property.overall_rating > 0 && (
                            <Badge variant="warning" className="flex items-center gap-1 px-2 py-1">
                              <Icon.Star className="w-4 h-4 fill-current" />
                              <span className="font-bold">
                                {property.overall_rating?.toFixed(1)}
                              </span>
                            </Badge>
                          )}
                        </div>

                        {property.overall_rating > 0 && (
                          <div className="mb-4">
                            <RatingStars rating={property.overall_rating} size="sm" />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm mb-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Icon.FileText className="w-4 h-4" />
                            <span className="font-medium">{property.total_reviews || 0}</span> {t('search.reviews')}
                          </div>
                          {property.neighborhood && (
                            <Badge variant="secondary">
                              {property.neighborhood}
                            </Badge>
                          )}
                        </div>

                        {getPositiveTags(property).length > 0 && (
                          <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100">
                            {getPositiveTags(property).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="success"
                                className="text-xs"
                              >
                                <Icon.Check className="w-3 h-3" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </Link>
                ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : query ? (
              <Card className="shadow-soft">
                <CardBody className="text-center py-16">
                  <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon.Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('search.noResults')}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {t('search.noResultsFor')} "{query}". {t('search.tryDifferent')}
                  </p>
                  <Button onClick={() => navigate('/write-review')} size="lg">
                    <Icon.Dragon />
                    {t('search.writeFirst')}
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <Card className="shadow-soft">
                <CardBody className="text-center py-16">
                  <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon.Search className="w-12 h-12 text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('search.searchProperties')}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {t('search.useSearchBar')}
                  </p>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
