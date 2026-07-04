import { useState, useEffect, useRef, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { LinePin, LineSearch } from './icons/line'
import { logger } from '../utils/logger'

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || ''
const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

// Load Google Maps script once (shared across every SearchBar instance;
// also dedupes against any other page that injected the script).
let googleMapsLoadPromise = null
const loadGoogleMaps = () => {
  if (googleMapsLoadPromise) return googleMapsLoadPromise

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.places?.AutocompleteSuggestion) {
      resolve()
      return
    }
    // Script tag already exists (e.g. injected by another page) — wait for it
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const check = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteSuggestion) {
          clearInterval(check)
          resolve()
        }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&language=he&loading=async`
    script.async = true
    script.onload = () => {
      const check = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteSuggestion) {
          clearInterval(check)
          resolve()
        }
      }, 50)
    }
    script.onerror = (err) => {
      googleMapsLoadPromise = null
      reject(err)
    }
    document.head.appendChild(script)
  })

  return googleMapsLoadPromise
}

// Remove "ישראל" / "Israel" and clean up commas for better database matching
const cleanSearchQuery = (text) =>
  text
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && p !== 'ישראל' && p !== 'Israel')
    .join(', ')

// Warm-trust variants — classes copied 1:1 from the approved hero /
// search-band markup so swapping the plain inputs is pixel-identical.
const VARIANT_STYLES = {
  hero: {
    form: 'bg-white rounded-2xl shadow-bar p-2.5 flex flex-col sm:flex-row gap-2.5',
    field: 'flex-1 flex items-center gap-2 px-4 rounded-xl bg-canvas',
    input: 'w-full bg-transparent py-3.5 text-[15px] text-ink placeholder:text-muted/80 outline-none',
    button:
      'btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-7 py-3.5 font-bold shadow-[0_10px_24px_-8px_rgba(224,152,46,0.8)] hover:bg-amber-600',
  },
  compact: {
    form: 'bg-white rounded-2xl shadow-bar p-2 flex flex-col sm:flex-row gap-2',
    field: 'flex-1 flex items-center gap-2 px-4 rounded-xl bg-canvas',
    input: 'w-full bg-transparent py-3 text-[15px] text-ink placeholder:text-muted/80 outline-none',
    button:
      'btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-6 py-3 font-bold shadow-[0_10px_24px_-8px_rgba(224,152,46,0.8)] hover:bg-amber-600',
  },
}

/**
 * Shared address search bar with Google Places autocomplete.
 *
 * @param {object} props
 * @param {'hero'|'compact'} [props.variant] - visual variant (homepage hero / petrol refine band)
 * @param {string} [props.className] - extra classes for the outer wrapper (margins, max-width, reveal)
 * @param {string} [props.placeholder]
 * @param {string} [props.buttonLabel]
 * @param {string} [props.ariaLabel]
 * @param {string} [props.initialQuery] - external query to sync into the input (e.g. from URL params)
 * @param {(query: string) => void} [props.onSearch] - called with the trimmed query on submit or
 *   suggestion selection; when omitted, navigates to `/search?q=<query>` (or `/search` when empty).
 *
 * Degrades gracefully: without a Places key (or if the script fails to load)
 * it behaves as a plain search input — no notice, no console spam.
 */
export default function SearchBar({
  variant = 'hero',
  className = '',
  placeholder = 'הכנס כתובת — לדוגמה: רוטשילד 45, תל אביב',
  buttonLabel = 'חפש ביקורות',
  ariaLabel = 'חיפוש כתובת',
  initialQuery = '',
  onSearch,
}) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.hero
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [mapsReady, setMapsReady] = useState(false)
  const rootRef = useRef(null)
  const skipFetchRef = useRef(false)
  const searchQueryRef = useRef(searchQuery)
  const navigate = useNavigate()
  const listboxId = useId()

  searchQueryRef.current = searchQuery

  // Keep the input in sync when the outside query changes (URL navigation)
  useEffect(() => {
    if (searchQueryRef.current !== initialQuery) {
      skipFetchRef.current = true
      setSearchQuery(initialQuery)
    }
  }, [initialQuery])

  // Load Google Maps SDK (quiet no-op when the key is missing)
  useEffect(() => {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes('XXX')) return
    loadGoogleMaps()
      .then(() => setMapsReady(true))
      .catch((err) => logger.error('Failed to load Google Maps:', err))
  }, [])

  // Fetch suggestions via the AutocompleteSuggestion API (debounced)
  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false
      return
    }
    if (!searchQuery || searchQuery.length < MIN_QUERY_LENGTH || !mapsReady) {
      setSuggestions([])
      setActiveIndex(-1)
      return
    }

    let cancelled = false
    const timeoutId = setTimeout(async () => {
      try {
        const { suggestions: results } =
          await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: searchQuery,
            includedRegionCodes: ['il'],
            language: 'he',
          })

        if (cancelled) return
        setSuggestions(results || [])
        setActiveIndex(-1)
        setShowSuggestions(Boolean(results?.length))
      } catch (err) {
        logger.warn('Places autocomplete error:', err)
        if (!cancelled) {
          setSuggestions([])
          setActiveIndex(-1)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [searchQuery, mapsReady])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const commitSearch = (value) => {
    const trimmed = value.trim()
    setShowSuggestions(false)
    setActiveIndex(-1)
    if (onSearch) {
      onSearch(trimmed)
      return
    }
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    commitSearch(searchQuery)
  }

  const handleSelectPlace = (text) => {
    const cleaned = cleanSearchQuery(text)
    skipFetchRef.current = true
    setSearchQuery(cleaned)
    setSuggestions([])
    commitSearch(cleaned)
  }

  const isOpen = showSuggestions && suggestions.length > 0

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActiveIndex(-1)
      return
    }
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      const text = suggestions[activeIndex]?.placePrediction?.text?.text || ''
      if (text) handleSelectPlace(text)
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <LinePin className="text-muted shrink-0" width="20" height="20" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
            placeholder={placeholder}
            className={styles.input}
            dir="rtl"
          />
        </div>
        <button type="submit" className={styles.button}>
          <LineSearch width="18" height="18" />
          {buttonLabel}
        </button>
      </form>

      {/* Google Places suggestions — warm-trust dropdown */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="הצעות כתובת"
          className="absolute top-full right-0 left-0 z-50 mt-2 bg-white rounded-2xl shadow-lift border border-black/5 overflow-hidden"
        >
          {suggestions.map((suggestion, index) => {
            const prediction = suggestion.placePrediction
            const text = prediction?.text?.text || ''
            return (
              <button
                key={prediction?.placeId || index}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => handleSelectPlace(text)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full px-5 py-3.5 text-right flex items-center gap-3 border-b border-black/5 last:border-b-0 transition-colors ${
                  index === activeIndex ? 'bg-canvas' : ''
                }`}
                dir="rtl"
              >
                <LinePin className="text-petrol shrink-0" width="16" height="16" />
                <span className="text-ink text-[15px] font-medium truncate">{text}</span>
              </button>
            )
          })}
          <div className="px-4 py-1.5 bg-canvas text-[11px] text-muted text-center" dir="ltr">
            Powered by Google
          </div>
        </div>
      )}
    </div>
  )
}
