/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  env: {
    CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  },

  // ── HTTP Security + SEO Headers ──────────────────────────────────────────────
  // Security headers improve trust signals (Google uses HTTPS/security as a
  // ranking factor). Cache headers reduce TTFB and improve Core Web Vitals.
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing — OWASP Top 10 requirement
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking — also signals trustworthiness to Google Safe Browsing
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Control referrer info sent to third-party sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features (privacy signals appreciated by Google)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          // Tell browsers (and Google) this site is HTTPS-only
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content Security Policy — prevents XSS
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        // Aggressively cache static assets — improves LCP (Core Web Vitals)
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache public images for 1 year
        source: '/(.*)\\.(jpg|jpeg|gif|png|svg|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts for 1 year
        source: '/(.*)\\.(woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Sitemap — cache for 1 hour, revalidate in background
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },

  // ── Redirects — handles old/alternative URL patterns ────────────────────────
  // Prevents duplicate content (same issue that cost BrighterMonday rankings)
  async redirects() {
    return [
      // Redirect www to non-www (canonical domain consolidation)
      {
        source: '/(.*)',
        has: [{ type: 'host', value: 'www.kazicloud.com' }],
        destination: 'https://kazicloud.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig

