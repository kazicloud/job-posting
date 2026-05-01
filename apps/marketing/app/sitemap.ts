import { MetadataRoute } from 'next'

const BASE_URL = 'https://kazicloud.com'

// hreflang alternates applied to every URL — mirrors Indeed/LinkedIn regional targeting
const languageAlternates = (path: string) => ({
  'en-KE': `${BASE_URL}${path}`,
  'en-UG': `${BASE_URL}${path}`,
  'en-RW': `${BASE_URL}${path}`,
  'en-TZ': `${BASE_URL}${path}`,
  'x-default': `${BASE_URL}${path}`,
})

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // ── Core pages ──────────────────────────────────────────────────────────────
  const corePages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: { languages: languageAlternates('') },
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: now,
      changeFrequency: 'hourly', // jobs update constantly — signal freshness to Googlebot
      priority: 1.0,
      alternates: { languages: languageAlternates('/jobs') },
    },
    {
      url: `${BASE_URL}/employers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: languageAlternates('/employers') },
    },
    {
      url: `${BASE_URL}/job-seekers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: languageAlternates('/job-seekers') },
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: languageAlternates('/about') },
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: languageAlternates('/contact') },
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date('2026-03-30'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date('2026-03-30'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // ── Geo-targeted country landing pages ──────────────────────────────────────
  // These are the single biggest SEO lever — exactly what BrighterMonday/Fuzu
  // lack and what Indeed/LinkedIn dominate rankings with regionally.
  const countryPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/jobs/kenya`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
      alternates: { languages: languageAlternates('/jobs/kenya') },
    },
    {
      url: `${BASE_URL}/jobs/uganda`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
      alternates: { languages: languageAlternates('/jobs/uganda') },
    },
    {
      url: `${BASE_URL}/jobs/rwanda`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
      alternates: { languages: languageAlternates('/jobs/rwanda') },
    },
    {
      url: `${BASE_URL}/jobs/tanzania`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
      alternates: { languages: languageAlternates('/jobs/tanzania') },
    },
  ]

  // ── Geo-targeted city landing pages ─────────────────────────────────────────
  const cityPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/jobs/nairobi`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.92,
      alternates: { languages: languageAlternates('/jobs/nairobi') },
    },
    {
      url: `${BASE_URL}/jobs/mombasa`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
      alternates: { languages: languageAlternates('/jobs/mombasa') },
    },
    {
      url: `${BASE_URL}/jobs/kisumu`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: { languages: languageAlternates('/jobs/kisumu') },
    },
    {
      url: `${BASE_URL}/jobs/kampala`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: languageAlternates('/jobs/kampala') },
    },
    {
      url: `${BASE_URL}/jobs/kigali`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: languageAlternates('/jobs/kigali') },
    },
    {
      url: `${BASE_URL}/jobs/dar-es-salaam`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: languageAlternates('/jobs/dar-es-salaam') },
    },
    // Remote / work-from-home — high-intent search in all four countries
    {
      url: `${BASE_URL}/jobs/remote-kenya`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.88,
      alternates: { languages: languageAlternates('/jobs/remote-kenya') },
    },
    {
      url: `${BASE_URL}/jobs/remote-east-africa`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
      alternates: { languages: languageAlternates('/jobs/remote-east-africa') },
    },
  ]

  return [...corePages, ...countryPages, ...cityPages]
}

