import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import RatingStars from '../components/RatingStars'
import ReviewCard from '../components/ReviewCard'
import { getProperty, getPropertyReviews } from '../lib/database'
import { logger } from '../utils/logger'
import Icon from '../components/icons'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

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
  }, [id, sortBy])

  const loadPropertyData = async () => {
    setLoading(true)
    setError('')

    try {
      // Get property details
      const { data: propertyData, error: propertyError } = await getProperty(id)
      if (propertyError) throw propertyError
      
      if (!propertyData) {
        setError('הדירה לא נמצאה')
        setLoading(false)
        return
      }

      setProperty(propertyData)

      // Get reviews for this property
      const sortOptions = {
        'created_at': { sortBy: 'created_at', ascending: false },
        'helpful': { sortBy: 'helpful_count', ascending: false },
        'rating_high': { sortBy: 'overall_rating', ascending: false },
        'rating_low': { sortBy: 'overall_rating', ascending: true }
      }

      const { data: reviewsData, error: reviewsError } = await getPropertyReviews(
        id,
        sortOptions[sortBy]
      )
      
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

  if (loading) {
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

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Icon.XCircle className="w-24 h-24 mx-auto mb-4 text-red-500" />
          <div className="text-2xl font-bold text-gray-900 mb-2">{t('common.error')}</div>
          <div className="text-gray-600">{error || t('property.notFound')}</div>
          <Button onClick={() => navigate('/')} className="mt-6">
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">
            {t('nav.home')}
          </Link>
          <Icon.ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">
            {property.street} {property.building_number}
          </span>
        </div>

        {/* Property Header */}
        <Card className="mb-8 shadow-medium">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <Icon.MapPin className="w-8 h-8 text-primary-500 mt-1" />
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {property.street} {property.building_number}
                    </h1>
                    <p className="text-lg text-gray-600 flex items-center gap-2">
                      <Icon.Building className="w-5 h-5" />
                      {t('property.floor')} {property.floor}, {t('property.apartment')} {property.apartment} | {property.city}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/write-review')}
                size="lg"
                className="flex items-center gap-2 shadow-soft hover:shadow-medium"
              >
                <Icon.Dragon />
                {t('nav.writeReview')}
              </Button>
            </div>
          
            {/* Overall Rating */}
            {property.total_reviews > 0 ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-100 p-4 rounded-2xl">
                      <Icon.Star className="w-8 h-8 text-primary-600 fill-current" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">{t('rating.overall')}</div>
                      <RatingStars rating={property.overall_rating || 0} size="xl" />
                    </div>
                  </div>
                  <div className="text-gray-600">
                    {t('property.basedOn')} <span className="font-bold text-gray-900">{property.total_reviews}</span> {t('property.reviews')}
                  </div>
                </div>

                {/* Category Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {property.maintenance_rating > 0 && (
                    <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon.Wrench className="w-5 h-5 text-primary-600" />
                        <div className="text-sm font-medium text-gray-700">{t('rating.maintenance')}</div>
                      </div>
                      <RatingStars rating={property.maintenance_rating} size="lg" />
                    </div>
                  )}
                  {property.communication_rating > 0 && (
                    <div className="bg-gradient-to-br from-secondary-50 to-white p-6 rounded-xl border border-secondary-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon.MessageCircle className="w-5 h-5 text-secondary-600" />
                        <div className="text-sm font-medium text-gray-700">{t('rating.communication')}</div>
                      </div>
                      <RatingStars rating={property.communication_rating} size="lg" />
                    </div>
                  )}
                  {property.value_rating > 0 && (
                    <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon.DollarSign className="w-5 h-5 text-accent-600" />
                        <div className="text-sm font-medium text-gray-700">{t('rating.value')}</div>
                      </div>
                      <RatingStars rating={property.value_rating} size="lg" />
                    </div>
                  )}
                </div>
              
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                  <div className="text-center p-4 rounded-xl bg-accent-50/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon.DollarSign className="w-6 h-6 text-accent-600" />
                      <div className="text-3xl font-bold text-accent-600">
                        {percentage(property.deposit_returned_count, property.total_reviews)}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {t('property.depositReturned')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ({property.deposit_returned_count}/{property.total_reviews})
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-accent-50/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon.FileCheck className="w-6 h-6 text-accent-600" />
                      <div className="text-3xl font-bold text-accent-600">
                        {percentage(property.contract_respected_count, property.total_reviews)}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {t('property.contractRespected')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ({property.contract_respected_count}/{property.total_reviews})
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-accent-50/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon.Clock className="w-6 h-6 text-accent-600" />
                      <div className="text-3xl font-bold text-accent-600">
                        {percentage(property.maintenance_timely_count, property.total_reviews)}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {t('property.timelyRepairs')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ({property.maintenance_timely_count}/{property.total_reviews})
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon.Dragon className="text-primary-600" style={{ width: '48px', height: '48px' }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('property.noReviewsYet')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {t('property.beFirst')}
                </p>
                <Button
                  onClick={() => navigate('/write-review')}
                  size="lg"
                  className="shadow-medium hover:shadow-strong"
                >
                  <Icon.Dragon />
                  {t('property.writeFirstReview')}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
        
        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div>
            <Card className="mb-6 shadow-soft">
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon.MessageCircle className="w-6 h-6 text-primary-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      {t('property.reviewsTitle')} ({reviews.length})
                    </h2>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <Icon.Filter className="w-5 h-5 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700
                               focus:border-primary-500 focus:outline-none transition-colors
                               bg-white cursor-pointer hover:border-gray-400"
                    >
                      <option value="created_at">{t('property.sortNewest')}</option>
                      <option value="helpful">{t('property.sortHelpful')}</option>
                      <option value="rating_high">{t('property.sortHighRating')}</option>
                      <option value="rating_low">{t('property.sortLowRating')}</option>
                    </select>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
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
                      .filter(([_, value]) => value !== null)
                      .map(([key, value]) => ({
                        text: {
                          depositReturned: t('tags.depositReturned'),
                          contractRespected: t('tags.contractRespected'),
                          maintenanceTimely: t('tags.maintenanceTimely'),
                          responsive: t('tags.responsive'),
                          clean: t('tags.clean'),
                          quiet: t('tags.quiet')
                        }[key],
                        positive: value
                      })) : []
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* CTA */}
        <Card className="mt-12 shadow-medium bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-2 border-primary-100">
          <CardBody className="p-8 md:p-12 text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon.Edit className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {t('property.livedHere')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-lg">
              {t('property.shareExperience')}
            </p>
            <Button
              onClick={() => navigate('/write-review')}
              size="lg"
              className="shadow-medium hover:shadow-strong"
            >
              <Icon.Dragon />
              {t('property.writeReviewCta')}
            </Button>
          </CardBody>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
