import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Job Seekers - Find Your Next Opportunity | Kazicloud',
  description: 'Discover thousands of verified job opportunities. Get matched with roles that fit your skills, apply instantly, and land your dream job faster.',
}

export default function JobSeekersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
