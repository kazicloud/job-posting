import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All bots — allow everything public, block server internals
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/_vercel/', '/admin/'],
      },
      {
        // Googlebot gets the most permissive ruleset — no crawl delay
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/_vercel/'],
      },
      {
        // Bing/MSN — 1s crawl delay to prevent server strain
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/_vercel/'],
      },
      {
        // Block SEO scrapers that add no value
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot'],
        disallow: '/',
      },
    ],
    // Sitemap index — Google, Bing, and others discover all URLs from here
    sitemap: 'https://kazicloud.com/sitemap.xml',
  }
}

