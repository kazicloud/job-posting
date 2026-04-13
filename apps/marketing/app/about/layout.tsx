import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Our Mission to Transform Hiring | Kazicloud',
  description: 'Learn about Kazicloud\'s mission to connect talent with opportunity. Meet our team and discover how we\'re changing the way people find work.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
