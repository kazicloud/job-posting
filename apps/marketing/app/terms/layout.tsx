import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | KaziCloud',
  description: 'Terms and conditions for using the KaziCloud platform.',
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
