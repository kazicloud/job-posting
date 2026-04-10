import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Jobs',
  description: 'Explore thousands of job opportunities across various industries and locations.',
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
