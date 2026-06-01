import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import OrganizationSchema from '@/components/seo/OrganizationSchema'
import { ConvexClientProvider } from '@/providers/ConvexClientProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-cal',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://kazicloud.com'),
  title: {
    default: 'Kazicloud – Jobs in Kenya, Uganda, Rwanda & Tanzania',
    template: '%s | Kazicloud',
  },
  description:
    "East Africa's #1 job platform. Browse thousands of verified jobs in Kenya, Uganda, Rwanda and Tanzania. Find opportunities in Nairobi, Kampala, Kigali, Dar es Salaam and more.",
  keywords: [
    // Primary geo-intent keywords (high volume, high intent)
    'jobs in Kenya',
    'jobs in Nairobi',
    'jobs Kenya 2026',
    'job vacancies Kenya',
    'employment Kenya',
    'jobs in Uganda',
    'jobs Kampala',
    'Uganda jobs 2026',
    'jobs in Rwanda',
    'jobs Kigali',
    'Rwanda employment',
    'jobs in Tanzania',
    'Dar es Salaam jobs',
    'Tanzania jobs 2026',
    // Regional & platform keywords
    'East Africa jobs',
    'East Africa job board',
    'East Africa careers',
    'job board Kenya',
    'online jobs Kenya',
    'remote jobs Kenya',
    // Category keywords
    'tech jobs Nairobi',
    'finance jobs Kenya',
    'marketing jobs Kenya',
    'graduate jobs Kenya',
    'entry level jobs Kenya',
    'NGO jobs Kenya',
    'government jobs Kenya',
    // Employer keywords
    'hire in Kenya',
    'recruitment Kenya',
    'post job Kenya',
    'top employers Kenya',
  ],
  authors: [{ name: 'Kazicloud', url: 'https://kazicloud.com' }],
  creator: 'Kazicloud',
  publisher: 'Kazicloud',
  applicationName: 'Kazicloud',
  category: 'Jobs & Employment',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // hreflang: signals to Google which country+language variants exist
  // Mirrors what LinkedIn, Indeed, and Glassdoor do for regional targeting
  alternates: {
    languages: {
      'en-KE': 'https://kazicloud.com',
      'en-UG': 'https://kazicloud.com',
      'en-RW': 'https://kazicloud.com',
      'en-TZ': 'https://kazicloud.com',
      'x-default': 'https://kazicloud.com',
    },
  },
  openGraph: {
    type: 'website',
    // en_KE locale tells Facebook/Google OG scrapers this is East Africa content
    locale: 'en_KE',
    alternateLocale: ['en_UG', 'en_RW', 'en_TZ'],
    url: 'https://kazicloud.com',
    siteName: 'Kazicloud',
    title: 'Kazicloud – Jobs in Kenya, Uganda, Rwanda & Tanzania',
    description:
      "East Africa's #1 job platform. Find verified jobs in Kenya, Uganda, Rwanda and Tanzania.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kazicloud – Jobs in Kenya, Uganda, Rwanda & Tanzania',
    description:
      "East Africa's #1 job platform. Find verified jobs in Kenya, Uganda, Rwanda and Tanzania.",
    creator: '@kazicloud',
    site: '@kazicloud',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Replace with actual tokens from Google Search Console & Bing Webmaster Tools
    google: 'your-google-search-console-verification-code',
  },
  // Geo meta tags — used by some search engines and local directories
  // Glassdoor, BrighterMonday, Fuzu do NOT do this — competitive advantage
  other: {
    'geo.region': 'KE',
    'geo.placename': 'Nairobi, Kenya',
    'geo.position': '-1.286389;36.817223',
    ICBM: '-1.286389, 36.817223',
    'DC.language': 'en',
    'DC.coverage': 'Kenya, Uganda, Rwanda, Tanzania, East Africa',
    'DC.subject': 'Jobs, Employment, Careers, Recruitment, East Africa',
    'DC.publisher': 'Kazicloud',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Preconnect to Google Fonts CDN — reduces render-blocking latency */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to Convex — reduces first API call latency */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_CONVEX_URL ?? ''} />
      </head>
      <body>
        {/* Site-wide Organization + WebSite + SearchAction JSON-LD (Google Sitelinks Searchbox) */}
        <OrganizationSchema />
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  )
}
