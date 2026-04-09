import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

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
  title: {
    default: 'KaziCloud - Connect Talent with Opportunity',
    template: '%s | KaziCloud',
  },
  description: 'The modern job platform connecting talented professionals with forward-thinking companies. Find your next opportunity or hire top talent.',
  keywords: ['jobs', 'careers', 'hiring', 'recruitment', 'talent', 'employment', 'job board'],
  authors: [{ name: 'KaziCloud' }],
  creator: 'KaziCloud',
  publisher: 'KaziCloud',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kazicloud.com',
    siteName: 'KaziCloud',
    title: 'KaziCloud - Connect Talent with Opportunity',
    description: 'The modern job platform connecting talented professionals with forward-thinking companies.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KaziCloud',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KaziCloud - Connect Talent with Opportunity',
    description: 'The modern job platform connecting talented professionals with forward-thinking companies.',
    images: ['/og-image.png'],
    creator: '@kazicloud',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
