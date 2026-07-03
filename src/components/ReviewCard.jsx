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
    <Card hover className="shadow-card">
      <CardBody className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-petrol-50 rounded-full flex items-center justify-center">
              <Icon.User className="w-6 h-6 text-petrol" />
            </div>
            <div>
              <div className="font-semibold text-ink">{t('reviewCard.anonymousRenter')}</div>
              <div className="flex items-center gap-1 text-sm text-muted">
                <Icon.Calendar className="w-3 h-3" />
                {formatDate(review.date)}
              </div>
            </div>
          </div>

          <RatingStars rating={review.overall_rating} size="md" />
        </div>

        {/* Category Ratings */}
        {(review.maintenance_rating || review.communication_rating || review.value_rating) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 pb-4 border-b border-black/5">
            {review.maintenance_rating && (
              <div className="bg-canvas p-3 rounded-xl">
                <div className="flex items-center gap-1 text-xs text-muted mb-1 font-medium">
                  <Icon.Wrench className="w-3 h-3 text-petrol" />
                  {t('rating.maintenance')}
                </div>
                <RatingStars rating={review.maintenance_rating} size="sm" showNumber={false} />
              </div>
            )}
            {review.communication_rating && (
              <div className="bg-canvas p-3 rounded-xl">
                <div className="flex items-center gap-1 text-xs text-muted mb-1 font-medium">
                  <Icon.MessageCircle className="w-3 h-3 text-petrol" />
                  {t('rating.communication')}
                </div>
                <RatingStars rating={review.communication_rating} size="sm" showNumber={false} />
              </div>
            )}
            {review.value_rating && (
              <div className="bg-canvas p-3 rounded-xl">
                <div className="flex items-center gap-1 text-xs text-muted mb-1 font-medium">
                  <Icon.DollarSign className="w-3 h-3 text-petrol" />
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
          <p className="text-ink/90 leading-relaxed whitespace-pre-wrap">{review.text}</p>
        </div>

        {/* Rental Period */}
        {review.rental_period && (
          <div className="flex items-center gap-2 text-sm text-muted mb-4 bg-canvas px-3 py-2 rounded-xl">
            <Icon.Calendar className="w-4 h-4 text-petrol" />
            <span className="font-medium">{t('reviewCard.rentalPeriod')}:</span>
            <span>{review.rental_period}</span>
          </div>
        )}

        {/* Helpful Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-black/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-muted font-medium">{t('reviewCard.wasHelpful')}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(true)}
                disabled={voting}
                className={`btn flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  helpful === 'yes'
                    ? 'bg-petrol-50 text-petrol border border-petrol/15'
                    : 'bg-canvas text-muted hover:text-petrol'
                } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon.ThumbsUp />
                {t('reviewCard.yes')} ({helpfulCount})
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={voting}
                className={`btn flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  helpful === 'no'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-canvas text-muted hover:text-red-600'
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
              className="flex items-center gap-1 text-sm text-muted/70 hover:text-red-600 transition-colors"
              title={t('reviewCard.reportTitle')}
            >
              <Icon.Flag className="w-4 h-4" />
              {t('reviewCard.report')}
            </button>
          )}
          {reported && (
            <span className="flex items-center gap-1 text-sm text-muted/70">
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
                className="w-full px-4 py-2 border border-black/10 rounded-xl bg-canvas focus:border-petrol focus:ring-2 focus:ring-petrol/20 focus:outline-none transition-colors"
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
                className="w-full px-4 py-2 border border-black/10 rounded-xl bg-canvas focus:border-petrol focus:ring-2 focus:ring-petrol/20 focus:outline-none resize-none transition-colors"
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
