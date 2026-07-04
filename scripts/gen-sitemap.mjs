// Build-time sitemap generator for Diragon.
//
// Writes public/sitemap.xml listing the homepage + key static pages + every
// property that has at least one review. Property rows are fetched from
// Supabase using the public anon key (SELECT is allowed by RLS for anon).
//
// Robustness: this runs in `prebuild`. If the DB is unreachable or env vars are
// missing (e.g. an offline/CI build without secrets), it logs a warning and
// still writes a valid sitemap containing the static routes only, so the build
// never fails because of this script.
//
// Usage: node scripts/gen-sitemap.mjs

import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_URL = 'https://www.diragon.co.il'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const outFile = path.join(projectRoot, 'public', 'sitemap.xml')

// Static routes worth indexing (public, content-bearing pages only).
const STATIC_ROUTES = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/search', changefreq: 'daily', priority: '0.9' },
  { loc: '/about', changefreq: 'monthly', priority: '0.6' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact', changefreq: 'yearly', priority: '0.4' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
]

// Read env from process.env first (Vercel/CI), then fall back to a local .env
// file so the script also works from a plain `npm run build` on a dev machine.
function readEnv() {
  const env = { ...process.env }
  const dotenvPath = path.join(projectRoot, '.env')
  if (fs.existsSync(dotenvPath)) {
    for (const line of fs.readFileSync(dotenvPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const key = m[1]
      if (env[key]) continue // process.env wins
      env[key] = m[2].replace(/^['"](.*)['"]$/, '$1')
    }
  }
  return env
}

function xmlEscape(value) {
  return String(value).replace(/[<>&'"]/g, (ch) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[ch]))
}

function toUrlEntry({ loc, lastmod, changefreq, priority }) {
  const parts = [`    <loc>${xmlEscape(BASE_URL + loc)}</loc>`]
  if (lastmod) parts.push(`    <lastmod>${xmlEscape(lastmod)}</lastmod>`)
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`)
  if (priority) parts.push(`    <priority>${priority}</priority>`)
  return `  <url>\n${parts.join('\n')}\n  </url>`
}

async function fetchPropertyUrls(env) {
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY
  if (!url || !key || url === 'YOUR_SUPABASE_URL' || key === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('[gen-sitemap] Supabase env vars missing — writing static routes only.')
    return []
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await supabase
    .from('properties')
    .select('id, updated_at')
    .gt('total_reviews', 0)
    .order('updated_at', { ascending: false })

  if (error) {
    console.warn(`[gen-sitemap] Supabase query failed (${error.message}) — writing static routes only.`)
    return []
  }

  return (data || []).map((p) => ({
    loc: `/property/${p.id}`,
    lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
    changefreq: 'weekly',
    priority: '0.8',
  }))
}

async function main() {
  const env = readEnv()
  const today = new Date().toISOString().slice(0, 10)

  let propertyUrls = []
  try {
    propertyUrls = await fetchPropertyUrls(env)
  } catch (err) {
    console.warn(`[gen-sitemap] Unexpected error fetching properties (${err.message}) — writing static routes only.`)
  }

  const staticUrls = STATIC_ROUTES.map((r) => ({ ...r, lastmod: today }))
  const entries = [...staticUrls, ...propertyUrls].map(toUrlEntry).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, xml, 'utf8')
  console.log(`[gen-sitemap] Wrote ${staticUrls.length} static + ${propertyUrls.length} property URLs to public/sitemap.xml`)
}

main().catch((err) => {
  // Never fail the build because of the sitemap; log and exit clean.
  console.warn(`[gen-sitemap] Failed to generate sitemap: ${err.message}`)
  process.exit(0)
})
