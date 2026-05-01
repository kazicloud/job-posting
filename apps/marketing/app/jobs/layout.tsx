import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Jobs in Kenya, Uganda, Rwanda & Tanzania',
  description:
    'Browse thousands of verified job vacancies in Kenya, Uganda, Rwanda and Tanzania. Filter by location, industry, and job type. New jobs added daily in Nairobi, Kampala, Kigali and Dar es Salaam.',
  keywords: [
    'jobs in Kenya',
    'jobs in Nairobi',
    'jobs in Uganda',
    'jobs in Rwanda',
    'jobs in Tanzania',
    'job vacancies East Africa',
    'latest jobs Kenya',
    'job listings Nairobi',
    'tech jobs Kenya',
    'remote jobs East Africa',
  ],
  alternates: {
    canonical: '/jobs',
    languages: {
      'en-KE': 'https://kazicloud.com/jobs',
      'en-UG': 'https://kazicloud.com/jobs',
      'en-RW': 'https://kazicloud.com/jobs',
      'en-TZ': 'https://kazicloud.com/jobs',
      'x-default': 'https://kazicloud.com/jobs',
    },
  },
  openGraph: {
    title: 'Browse Jobs in East Africa | Kazicloud',
    description:
      'Thousands of verified jobs in Kenya, Uganda, Rwanda and Tanzania — updated daily. Search by location, salary, and industry.',
    url: 'https://kazicloud.com/jobs',
    images: [{ url: '/og-jobs.png', width: 1200, height: 630, alt: 'Job listings in East Africa – Kazicloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Jobs in East Africa | Kazicloud',
    description:
      'Thousands of verified jobs in Kenya, Uganda, Rwanda and Tanzania — updated daily.',
  },
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
