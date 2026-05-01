import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Kazicloud collects, uses, and protects your personal information across our East Africa job platform. We comply with Kenya Data Protection Act 2019 and applicable data laws in Uganda, Rwanda and Tanzania.',
  alternates: {
    canonical: '/privacy',
  },
  robots: {
    index: true,
    follow: false,
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
