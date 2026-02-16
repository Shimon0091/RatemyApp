import RatingStars from './RatingStars'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { voteReviewHelpfulness, reportReview } from '../lib/database'
import { logger } from '../utils/logger'
import Icon from './icons'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Card, CardBody } from './ui/Card'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'

export default function ReviewCard({ review }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [helpful, setHelpful] = useState(null) // null, 'yes', or 'no'
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0)
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.not_helpful_count || 0)
  const [voting, setVoting] = useState(false)

  // Report state
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reporting, setReporting] = useState(false)
  const [reported, setReported] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('he-IL', { year: 'numeric', month: 'long' }).format(date)
  }

  const handleVote = async (isHelpful) => {
    if (!user) {
      alert('יש להתחבר כדי להצביע')
      return
    }

    if (voting) return

    setVoting(true)

    try {
      const { error } = await voteReviewHelpfulness(review.id, user.id, isHelpful)
      
      if (error) {
        throw error
      }

      // Update local state
      if (helpful === null) {
        // New vote
        if (isHelpful) {
          setHelpfulCount(prev => prev + 1)
        } else {
          setNotHelpfulCount(prev => prev + 1)
        }
      } else {
        // Change vote
        if (helpful === 'yes') {
          setHelpfulCount(prev => prev - 1)
        } else {
          setNotHelpfulCount(prev => prev - 1)
        }
        
        if (isHelpful) {
          setHelpfulCount(prev => prev + 1)
        } else {
          setNotHelpfulCount(prev => prev + 1)
        }
      }

      setHelpful(isHelpful ? 'yes' : 'no')

    } catch (err) {
      logger.error('Error voting:', err)
      alert('שגיאה בהצבעה')
    } finally {
      setVoting(false)
    }
  }

  const handleReport = async () => {
    if (!user) {
      alert('יש להתחבר כדי לדווח על ביקורת')
      return
    }

    if (!reportReason) {
      alert('יש לבחור סיבת דיווח')
      return
    }

    setReporting(true)

    try {
      const { error } = await reportReview(review.id, user.id, reportReason, reportDetails)
      
      if (error) {
        throw error
      }

      setReported(true)
      setShowReportModal(false)
      alert('הדיווח נשלח בהצלחה. תודה!')
    } catch (err) {
      logger.error('Error reporting:', err)
      alert('שגיאה בשליחת הדיווח')
    } finally {
      setReporting(false)
    }
  }
  
  return (
    <Card className="shadow-soft hover:shadow-medium transition-all">
      <CardBody className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center shadow-soft">
              <Icon.User className="w-6 h-6 text-primary-700" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{t('reviewCard.anonymousRenter')}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Icon.Calendar className="w-3 h-3" />
                {formatDate(review.date)}
              </div>
            </div>
          </div>

          <RatingStars rating={review.overall_rating} size="md" />
        </div>
      
        {/* Category Ratings */}
        {(review.maintenance_rating || review.communication_rating || review.value_rating) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
            {review.maintenance_rating && (
              <div className="bg-primary-50/50 p-3 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-gray-700 mb-1 font-medium">
                  <Icon.Wrench className="w-3 h-3" />
                  {t('rating.maintenance')}
                </div>
                <RatingStars rating={review.maintenance_rating} size="sm" showNumber={false} />
              </div>
            )}
            {review.communication_rating && (
              <div className="bg-secondary-50/50 p-3 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-gray-700 mb-1 font-medium">
                  <Icon.MessageCircle className="w-3 h-3" />
                  {t('rating.communication')}
                </div>
                <RatingStars rating={review.communication_rating} size="sm" showNumber={false} />
              </div>
            )}
            {review.value_rating && (
              <div className="bg-accent-50/50 p-3 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-gray-700 mb-1 font-medium">
                  <Icon.DollarSign className="w-3 h-3" />
                  {t('rating.value')}
                </div>
                <RatingStars rating={review.value_rating} size="sm" showNumber={false} />
              </div>
            )}
          </div>
        )}
      
        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {review.tags.map((tag, index) => (
              <Badge
                key={index}
                variant={tag.positive ? 'success' : 'danger'}
                className="flex items-center gap-1"
              >
                {tag.positive ? <Icon.Check className="w-3 h-3" /> : <Icon.XCircle className="w-3 h-3" />}
                {tag.text}
              </Badge>
            ))}
          </div>
        )}
      
        {/* Review Text */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.text}</p>
        </div>

        {/* Rental Period */}
        {review.rental_period && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
            <Icon.Calendar className="w-4 h-4 text-primary-500" />
            <span className="font-medium">{t('reviewCard.rentalPeriod')}:</span>
            <span>{review.rental_period}</span>
          </div>
        )}
      
        {/* Helpful Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">{t('reviewCard.wasHelpful')}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(true)}
                disabled={voting}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  helpful === 'yes'
                    ? 'bg-accent-100 text-accent-700 shadow-soft'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon.ThumbsUp />
                {t('reviewCard.yes')} ({helpfulCount})
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={voting}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  helpful === 'no'
                    ? 'bg-red-100 text-red-700 shadow-soft'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon.ThumbsDown />
                {t('reviewCard.no')} ({notHelpfulCount})
              </button>
            </div>
          </div>

          {/* Report Button */}
          {!reported && (
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-600 transition-colors"
              title={t('reviewCard.reportTitle')}
            >
              <Icon.Flag className="w-4 h-4" />
              {t('reviewCard.report')}
            </button>
          )}
          {reported && (
            <span className="flex items-center gap-1 text-sm text-gray-400">
              <Icon.Check className="w-4 h-4" />
              {t('reviewCard.reported')}
            </span>
          )}
        </div>

        {/* Report Modal */}
        <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Icon.Flag className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('reviewCard.reportModal.title')}</h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              {t('reviewCard.reportModal.description')}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviewCard.reportModal.reason')} *
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
              >
                <option value="">{t('reviewCard.reportModal.selectReason')}</option>
                <option value="spam">{t('reviewCard.reportModal.spam')}</option>
                <option value="fake">{t('reviewCard.reportModal.fake')}</option>
                <option value="offensive">{t('reviewCard.reportModal.offensive')}</option>
                <option value="personal_info">{t('reviewCard.reportModal.personalInfo')}</option>
                <option value="wrong_property">{t('reviewCard.reportModal.wrongProperty')}</option>
                <option value="other">{t('reviewCard.reportModal.other')}</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviewCard.reportModal.details')} ({t('form.optional')})
              </label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none transition-colors"
                rows={3}
                placeholder={t('reviewCard.reportModal.detailsPlaceholder')}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowReportModal(false)}
                className="flex-1"
              >
                {t('form.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleReport}
                disabled={reporting || !reportReason}
                className="flex-1"
              >
                {reporting ? t('form.submitting') : t('reviewCard.reportModal.submit')}
              </Button>
            </div>
          </div>
        </Modal>
      </CardBody>
    </Card>
  )
}
