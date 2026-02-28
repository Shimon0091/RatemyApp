import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)
  const autocompleteRef = useRef(null)
  const navigate = useNavigate()

  // Google Places Autocomplete
  useEffect(() => {
    const searchPlaces = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions([])
        return
      }
      if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes('XXX')) {
        setSuggestions([])
        return
      }

      setIsLoadingPlaces(true)

      try {
        const query = `${searchQuery}, ישראל`
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&components=country:il&language=he`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch places')
        }

        const data = await response.json()

        if (data.status === 'OK' && data.predictions) {
          setSuggestions(data.predictions)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
        }
      } catch (err) {
        console.error('Places API error:', err)
        setSuggestions([])
      } finally {
        setIsLoadingPlaces(false)
      }
    }

    const timeoutId = setTimeout(searchPlaces, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSelectPlace = (description) => {
    setSearchQuery(description)
    setShowSuggestions(false)
    setSuggestions([])
    navigate(`/search?q=${encodeURIComponent(description)}`)
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    navigate(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  return (
    <div className="w-full max-w-3xl mx-auto" ref={autocompleteRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative" style={{boxShadow: '0 10px 40px rgba(37, 99, 235, 0.15)'}}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
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

        {/* Google Places Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelectPlace(suggestion.description)}
                className="w-full px-6 py-4 text-right hover:bg-primary-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                dir="rtl"
              >
                <span className="text-gray-400 flex-shrink-0">📍</span>
                <span className="text-gray-800 font-medium">{suggestion.description}</span>
              </button>
            ))}
            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 text-center">
              Powered by Google
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoadingPlaces && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-center text-gray-500" dir="rtl">
            מחפש כתובות...
          </div>
        )}
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
