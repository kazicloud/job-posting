import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Kazicloud',
  description: 'Terms and conditions for using the Kazicloud platform.',
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
