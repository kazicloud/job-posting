import type { Metadata } from 'next'

// job-seekers/page.tsx uses 'use client' so metadata lives here in the layout
export const metadata: Metadata = {
  title: 'Career Services & CV Help for Job Seekers in East Africa',
  description:
    'ATS-optimised CVs, professional CV revamps, career coaching, and job search support for professionals in Kenya, Uganda, Rwanda and Tanzania. Boost your chances of landing interviews.',
  keywords: [
    'CV writing Kenya',
    'ATS CV Nairobi',
    'career services Kenya',
    'career coaching Kenya',
    'CV revamp Kenya',
    'job search support East Africa',
    'professional CV Kenya',
    'job seeker help Uganda',
    'career development East Africa',
  ],
  alternates: {
    canonical: '/job-seekers',
    languages: {
      'en-KE': 'https://kazicloud.com/job-seekers',
      'en-UG': 'https://kazicloud.com/job-seekers',
      'en-RW': 'https://kazicloud.com/job-seekers',
      'en-TZ': 'https://kazicloud.com/job-seekers',
      'x-default': 'https://kazicloud.com/job-seekers',
    },
  },
  openGraph: {
    title: 'Career Services & CV Help for Job Seekers in East Africa | Kazicloud',
    description:
      'ATS-optimised CVs, career coaching, and job search support for professionals across East Africa. Stand out to top employers.',
    url: 'https://kazicloud.com/job-seekers',
    images: [{ url: '/og-job-seekers.png', width: 1200, height: 630, alt: 'Career services for job seekers – Kazicloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Services & CV Help for Job Seekers in East Africa | Kazicloud',
    description:
      'ATS-optimised CVs, career coaching, and job search support. Land your next job in East Africa.',
  },
}

export default function JobSeekersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
