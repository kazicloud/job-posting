import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms and conditions governing use of the Kazicloud job platform. By using Kazicloud, you agree to these terms. Platform governed by the laws of Kenya.',
  alternates: {
    canonical: '/terms',
  },
  robots: {
    index: true,
    follow: false,
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
