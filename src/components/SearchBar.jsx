import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    navigate(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative" style={{boxShadow: '0 10px 40px rgba(37, 99, 235, 0.15)'}}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש דירה לפי כתובת: רחוב, מספר בית, תל אביב..."
            className="w-full px-8 py-6 text-xl border-2 border-gray-200 rounded-2xl 
                     focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                     transition-all shadow-lg hover:border-primary/50 font-medium"
            dir="rtl"
          />
          <button
            type="submit"
            className="absolute left-4 top-1/2 -translate-y-1/2 
                     px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl 
                     hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg
                     shadow-lg hover:shadow-xl"
          >
            🔍 חפש
          </button>
        </div>
      </form>
      
      {/* Quick suggestions */}
      <div className="mt-4 flex gap-2 flex-wrap justify-center">
        <span className="text-sm text-gray-600">חיפושים פופולריים:</span>
        {['דיזנגוף', 'רוטשילד', 'פלורנטין', 'נווה צדק'].map((area) => (
          <button
            key={area}
            onClick={() => handleSuggestionClick(area)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full
                     hover:bg-gray-200 transition-colors"
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  )
}
