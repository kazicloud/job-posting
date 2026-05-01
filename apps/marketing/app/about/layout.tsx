import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Kazicloud – East Africa’s Leading Job Platform',
  description:
    "Learn about Kazicloud's mission to connect talent with opportunity across Kenya, Uganda, Rwanda and Tanzania. Discover how we're transforming hiring and careers in East Africa.",
  keywords: [
    'about Kazicloud',
    'East Africa job platform',
    'Nairobi job board',
    'Kenya recruitment company',
    'job platform East Africa',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Kazicloud – East Africa’s Leading Job Platform',
    description:
      "Kazicloud's mission is to connect talent with opportunity across East Africa. Learn how we're transforming hiring in Kenya, Uganda, Rwanda and Tanzania.",
    url: 'https://kazicloud.com/about',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
