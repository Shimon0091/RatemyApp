import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'דירגון'
const BASE_URL = 'https://www.diragon.co.il'
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`

/**
 * Per-page <head> manager: unique title, meta description, canonical URL,
 * Open Graph / Twitter tags, and optional JSON-LD structured data.
 *
 * Canonical defaults to the current route path; pass `canonicalPath` to
 * override (e.g. to strip query params on the search page).
 *
 * @param {object} props
 * @param {string} props.title            Full page title (already includes brand if desired).
 * @param {string} [props.description]    Meta description.
 * @param {string} [props.canonicalPath]  Path override for the canonical URL (defaults to current path).
 * @param {boolean} [props.noindex]       When true, emits robots noindex (for private/utility pages).
 * @param {string} [props.ogImage]        Absolute OG image URL (defaults to site OG image).
 * @param {object|object[]} [props.jsonLd] One or more schema.org JSON-LD objects.
 */
export default function Seo({
  title,
  description,
  canonicalPath,
  noindex = false,
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
}) {
  const location = useLocation()
  const path = canonicalPath ?? location.pathname
  const canonical = `${BASE_URL}${path === '/' ? '' : path}`

  const jsonLdBlocks = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean)
    : []

  return (
    <Helmet prioritizeSeoTags>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="he_IL" />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {jsonLdBlocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  )
}

export { BASE_URL, SITE_NAME }
