import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post Jobs & Hire Top Talent in East Africa',
  description:
    'Reach 50,000+ verified professionals in Kenya, Uganda, Rwanda and Tanzania. Post jobs, get AI-matched candidates, and hire 50% faster. Trusted by leading East African employers.',
  keywords: [
    'post job Kenya',
    'hire in Kenya',
    'recruitment Kenya',
    'job board Kenya employers',
    'hire in Uganda',
    'hire in Rwanda',
    'hire in Tanzania',
    'East Africa recruitment platform',
    'employer job posting Kenya',
    'find talent Nairobi',
  ],
  alternates: {
    canonical: '/employers',
    languages: {
      'en-KE': 'https://kazicloud.com/employers',
      'en-UG': 'https://kazicloud.com/employers',
      'en-RW': 'https://kazicloud.com/employers',
      'en-TZ': 'https://kazicloud.com/employers',
      'x-default': 'https://kazicloud.com/employers',
    },
  },
  openGraph: {
    title: 'Post Jobs & Hire Top Talent in East Africa | Kazicloud',
    description:
      'Reach 50,000+ verified professionals in Kenya, Uganda, Rwanda and Tanzania. AI-matched candidates. Post your first job today.',
    url: 'https://kazicloud.com/employers',
    images: [{ url: '/og-employers.png', width: 1200, height: 630, alt: 'Hire top talent in East Africa – Kazicloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Post Jobs & Hire Top Talent in East Africa | Kazicloud',
    description:
      'Reach 50,000+ verified professionals in Kenya, Uganda, Rwanda and Tanzania. Post your first job today.',
  },
}

export default function EmployersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
