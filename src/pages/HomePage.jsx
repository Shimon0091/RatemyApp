import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Seo, { BASE_URL, SITE_NAME } from '../components/Seo'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { getTopRatedProperties } from '../lib/database'
import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=80'

// ── small inline icons (match mockup F line-art exactly) ──
const IconPin = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
)
const IconStarSolid = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z" /></svg>
)
const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5" /></svg>
)
const IconArrowLeft = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
)
const IconSearch = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
)
const IconEdit = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
)
const IconBook = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 7c3-2 6-2 10 0 4-2 7-2 10 0v13c-3-2-6-2-10 0-4-2-7-2-10 0Z" /><path d="M12 7v13" /></svg>
)
const IconDoc = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 3v5h5" /><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="m8.5 14 1.8 1.8 3.7-3.7" /></svg>
)
const IconBadgeCheck = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 11.5V21l5-2.5L17 21v-9.5" /><path d="M12 14a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" /></svg>
)
const IconBuilding = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /><path d="M9 10h.01M15 10h.01" /></svg>
)

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [topProperties, setTopProperties] = useState([])
  const [stats, setStats] = useState({ totalReviews: 0, totalProperties: 0 })
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  // Re-scan reveal targets once async data has rendered.
  useScrollReveal([loading, topProperties.length])

  const loadData = async () => {
    try {
      const { data: properties } = await getTopRatedProperties(6)
      setTopProperties(properties || [])

      const { count: reviewsCount, error: reviewsError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

      const { count: propertiesCount, error: propertiesError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })

      if (reviewsError) logger.error('Error loading reviews:', reviewsError)
      if (propertiesError) logger.error('Error loading properties:', propertiesError)

      // Real DB counts power the top-rated cards / "more properties" link.
      setStats({
        totalReviews: reviewsCount || 0,
        totalProperties: propertiesCount || 0,
      })
    } catch (err) {
      logger.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPositiveTags = (property) => {
    const tags = []
    if (property.deposit_returned_count > 0) tags.push('פיקדון הוחזר')
    if (property.maintenance_timely_count > 0) tags.push('תיקונים מהירים')
    if (property.contract_respected_count > 0) tags.push('עמידה בחוזה')
    return tags.slice(0, 2)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    else navigate('/search')
  }

  const remaining = Math.max(0, stats.totalProperties - topProperties.length)
  const chips = topProperties.slice(0, 3)
  const chipPos = [
    { top: '22%', left: '7%', dur: '6.5s', delay: '.2s' },
    { top: '46%', left: '13%', dur: '7.5s', delay: '1.1s' },
    { top: '30%', left: '30%', dur: '8s', delay: '.6s' },
  ]

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      alternateName: 'Diragon',
      url: BASE_URL,
      logo: `${BASE_URL}/og-image.png`,
      description: 'הפלטפורמה הראשונה בישראל לדירוג דירות ובעלי בתים.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: BASE_URL,
      inLanguage: 'he-IL',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ]

  return (
    <div className="bg-canvas text-ink font-body min-h-screen overflow-x-hidden">
      <Seo
        title="דירגון - דירוג דירות וביקורות על בעלי בתים בישראל"
        description="הפלטפורמה הראשונה בישראל לדירוג דירות ובעלי בתים. בדקו ביקורות אמיתיות של שוכרים לפני שאתם חותמים על חוזה שכירות."
        canonicalPath="/"
        jsonLd={homeJsonLd}
      />
      <Header />

      <main id="main-content">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={HERO_IMAGE}
              alt="דירה מודרנית ומוארת בישראל"
              className="kenburns w-full h-full object-cover"
              width="1600"
              height="900"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/45 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>

          {/* floating rating chips — real top-rated properties */}
          {chips.length > 0 && (
            <div className="hidden md:block pointer-events-none absolute inset-0 z-10">
              {chips.map((p, i) => (
                <div
                  key={p.id}
                  className="float-chip absolute bg-white rounded-2xl shadow-lift px-4 py-2.5 flex items-center gap-2.5"
                  style={{ top: chipPos[i].top, left: chipPos[i].left, '--dur': chipPos[i].dur, '--delay': chipPos[i].delay }}
                >
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-petrol-50 text-petrol">
                    <IconPin width="16" height="16" />
                  </span>
                  <span className="text-sm">
                    <span className="font-heading font-bold text-ink">{p.street} {p.building_number}</span>{' '}
                    <span className="text-amber font-bold">★ {(p.overall_rating || 0).toFixed(1)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="relative z-20 max-w-7xl mx-auto px-5 lg:px-8 pt-24 pb-40 lg:pt-32 lg:pb-52">
            <div className="max-w-full sm:max-w-2xl mr-0 text-right reveal">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur text-white/95 border border-white/25 px-4 py-1.5 text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-amber" /> {t('hero.badgeModerated')}
              </span>
              <h1 className="text-white font-heading font-black leading-[1.08] text-[2rem] sm:text-5xl lg:text-[3.5rem] break-words">
                דירגון: המקום שלך למצוא<br className="hidden sm:block" /> ולדרג דירות להשכרה.
              </h1>
              <p className="mt-5 text-lg lg:text-xl text-white/85 leading-relaxed max-w-xl mr-0">
                קהילת השוכרים של ישראל משתפת ביקורות אמיתיות — כדי שתמצאו את הבית הבא בביטחון.
              </p>
            </div>

            {/* search bar */}
            <form
              onSubmit={handleSearch}
              className="reveal mt-9 max-w-3xl bg-white rounded-2xl shadow-bar p-2.5 flex flex-col sm:flex-row gap-2.5"
            >
              <div className="flex-1 flex items-center gap-2 px-4 rounded-xl bg-canvas">
                <IconPin className="text-muted shrink-0" width="20" height="20" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="חיפוש כתובת"
                  placeholder="הכנס כתובת — לדוגמה: רוטשילד 45, תל אביב"
                  className="w-full bg-transparent py-3.5 text-[15px] placeholder:text-muted/80 outline-none"
                  dir="rtl"
                />
              </div>
              <button
                type="submit"
                className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-7 py-3.5 font-bold shadow-[0_10px_24px_-8px_rgba(224,152,46,0.8)] hover:bg-amber-600"
              >
                <IconSearch width="18" height="18" />
                חפש ביקורות
              </button>
            </form>
            <p className="reveal mt-4 text-white/80 text-sm">
              הפלטפורמה הראשונה בישראל לדירוג דירות ובעלי בתים. בדוק ביקורות לפני שאתה שוכר.
            </p>
          </div>
        </section>

        {/* ============ OVERLAPPING CTA CARDS ============ */}
        <section className="relative z-30 max-w-6xl mx-auto px-5 lg:px-8 -mt-24 lg:-mt-28">
          <div className="grid md:grid-cols-2 gap-5">
            {/* write review */}
            <div className="reveal lift bg-white rounded-2xl shadow-card p-7 border border-black/5">
              <div className="flex items-start gap-4">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <IconEdit width="22" height="22" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-xl text-ink">רוצה לכתוב ביקורת?</h3>
                  <p className="text-muted mt-1.5 leading-relaxed">שתף את החוויה שלך מהדירה ומבעל הבית — עוזר לשוכרים הבאים.</p>
                </div>
              </div>
              <Link
                to="/write-review"
                className="btn mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-cta text-white px-6 py-3 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
              >
                {t('hero.ctaWrite')}
                <IconArrowLeft width="18" height="18" />
              </Link>
            </div>

            {/* read reviews */}
            <div className="reveal lift bg-white rounded-2xl shadow-card p-7 border border-black/5">
              <div className="flex items-start gap-4">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-petrol-50 text-petrol shrink-0">
                  <IconBook width="22" height="22" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-xl text-ink">רוצה לקרוא ביקורות?</h3>
                  <p className="text-muted mt-1.5 leading-relaxed">מצא ביקורות אמיתיות על דירות ובעלי בתים לפני החתימה על החוזה.</p>
                </div>
              </div>
              <Link
                to="/search"
                className="btn mt-5 inline-flex items-center gap-2 rounded-xl bg-petrol text-white px-6 py-3 font-bold shadow-[0_10px_24px_-10px_rgba(14,90,84,0.7)] hover:bg-petrol-700"
              >
                {t('hero.ctaSearch')}
                <IconArrowLeft width="18" height="18" />
              </Link>
            </div>
          </div>

          {/* trust chips */}
          <div className="reveal mt-6 flex flex-wrap justify-center gap-3 text-sm">
            {[t('trust.chipAnonymous'), t('trust.chipModerated'), t('trust.chipFree')].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-black/5 shadow-sm px-4 py-2 font-semibold text-ink"
              >
                <IconCheck className="text-petrol" width="16" height="16" /> {label}
              </span>
            ))}
          </div>
        </section>

        {/* ============ COLD-START — honest, recruiting band ============ */}
        <section className="mt-20 lg:mt-24">
          <div className="max-w-5xl mx-auto px-5 lg:px-8">
            <div className="reveal relative overflow-hidden rounded-2xl bg-petrol text-white shadow-lift px-6 py-12 sm:px-12 sm:py-14 text-center">
              <span aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5" />
              <div className="relative">
                <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl leading-tight max-w-2xl mx-auto">
                  {t('coldStart.headline')}
                </h2>
                <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                  {t('coldStart.subline')}
                </p>
                <Link
                  to="/write-review"
                  className="btn mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-cta text-white px-7 py-3.5 font-bold shadow-[0_10px_24px_-8px_rgba(224,152,46,0.8)] hover:bg-amber-600"
                >
                  {t('coldStart.cta')}
                  <IconArrowLeft width="18" height="18" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how-it-works" className="py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-5 lg:px-8">
            <div className="reveal text-center max-w-2xl mx-auto">
              <h2 className="font-heading font-extrabold text-3xl lg:text-4xl text-ink">איך זה עובד?</h2>
              <p className="mt-3 text-muted text-lg">שלושה צעדים פשוטים להחלטה בטוחה</p>
            </div>

            <div className="mt-14 grid md:grid-cols-3 gap-6">
              {[
                { n: 1, Icon: IconPin, title: 'חפש את הדירה', body: 'הקלד כתובת או שם שכונה ומצא את הדירה שמעניינת אותך תוך שניות.' },
                { n: 2, Icon: IconDoc, title: 'קרא ביקורות אמיתיות', body: 'ביקורות משוכרים אמיתיים, בעילום שם — כל אחת עוברת בדיקת מנהל לפני שהיא עולה.' },
                { n: 3, Icon: IconBadgeCheck, title: 'קבל החלטה מושכלת', body: 'חתום על חוזה בביטחון — בלי הפתעות ובלי חרטות.' },
              ].map((step) => (
                <div key={step.n} className="reveal text-center px-6">
                  <div className="relative mx-auto w-16 h-16">
                    <span className="grid place-items-center w-16 h-16 rounded-2xl bg-petrol-50 text-petrol">
                      <step.Icon width="28" height="28" />
                    </span>
                    <span className="absolute -top-2 -left-2 grid place-items-center w-7 h-7 rounded-full bg-amber-cta text-white text-xs font-bold">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="mt-5 font-heading font-bold text-xl text-ink">{step.title}</h3>
                  <p className="mt-2 text-muted leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TOP RATED PROPERTIES ============ */}
        {topProperties.length > 0 && (
          <section id="top" className="py-20 lg:py-28 bg-sand">
            <div className="max-w-6xl mx-auto px-5 lg:px-8">
              <div className="reveal text-center max-w-2xl mx-auto">
                <h2 className="font-heading font-extrabold text-3xl lg:text-4xl text-ink">הדירות המדורגות ביותר</h2>
                <p className="mt-3 text-muted text-lg">דירות אמיתיות מדורגות על ידי שוכרים שגרו בהן</p>
              </div>

              <div className="mt-14 grid md:grid-cols-3 gap-6">
                {topProperties.map((property, i) => (
                  <article
                    key={property.id}
                    className="reveal lift bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden"
                  >
                    {/* uniform gray placeholder — no photo field in DB yet */}
                    <div className="relative h-48 grid place-items-center bg-[#EFEDE8]">
                      <div className="text-center text-muted">
                        <IconBuilding className="mx-auto" width="34" height="34" />
                        <span className="block mt-2 text-sm font-medium">אין תמונה</span>
                      </div>
                      {i === 0 && (
                        <span className="absolute top-3 right-3 rounded-full bg-petrol text-white text-xs font-bold px-3 py-1 shadow">
                          מדורגת #1
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-heading font-bold text-lg text-ink">
                          {property.street} {property.building_number}
                        </h3>
                        {property.overall_rating > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 text-amber-600 px-2.5 py-1 text-sm font-bold shrink-0">
                            <IconStarSolid width="14" height="14" />
                            {property.overall_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-muted text-sm mt-1">
                        {property.neighborhood || property.street} · {property.city}
                      </p>
                      <p className="text-muted text-sm mt-1">
                        קומה {property.floor} · {property.total_reviews || 0} {t('property.reviews')}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {getPositiveTags(property).map((tag) => (
                          <span key={tag} className="rounded-full bg-canvas text-ink text-xs font-medium px-3 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        to={`/property/${property.id}`}
                        className="btn mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-petrol/25 text-petrol font-semibold py-2.5 hover:bg-petrol-50"
                      >
                        קרא עוד
                        <IconArrowLeft width="16" height="16" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {remaining > 0 && (
                <div className="reveal mt-10 text-center">
                  <Link
                    to="/search"
                    className="btn inline-flex items-center gap-2 rounded-full bg-white border border-black/5 shadow-sm px-6 py-3 font-semibold text-petrol hover:shadow-card"
                  >
                    עוד {remaining.toLocaleString('he-IL')} דירות מדורגות
                    <IconArrowLeft width="16" height="16" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
