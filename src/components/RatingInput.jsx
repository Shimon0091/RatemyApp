import { useState } from 'react'

export default function RatingInput({ label, value, onChange, size = 'lg' }) {
  const [hoveredStar, setHoveredStar] = useState(0)
  
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  const handleClick = (rating) => {
    onChange(rating)
  }

  const handleMouseEnter = (rating) => {
    setHoveredStar(rating)
  }

  const handleMouseLeave = () => {
    setHoveredStar(0)
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className={`flex gap-1 ${sizes[size]}`}>
          {[1, 2, 3, 4, 5].map((rating) => {
            const isActive = rating <= (hoveredStar || value)
            return (
              <button
                key={rating}
                type="button"
                onClick={() => handleClick(rating)}
                onMouseEnter={() => handleMouseEnter(rating)}
                onMouseLeave={handleMouseLeave}
                className={`transition-all hover:scale-110 cursor-pointer ${
                  isActive ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            )
          })}
        </div>
        {value > 0 && (
          <span className="text-lg font-bold text-gray-700">
            {value}.0
          </span>
        )}
      </div>
    </div>
  )
}
