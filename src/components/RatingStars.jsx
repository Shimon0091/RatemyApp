export default function RatingStars({ rating, size = 'md', showNumber = true }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  }
  
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${sizes[size]}`}>
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <span className="text-yellow-400">★</span>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </div>
      
      {showNumber && (
        <span className={`font-bold text-gray-900 ${sizes[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
