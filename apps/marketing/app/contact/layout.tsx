import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch | Kazicloud',
  description: 'Have questions? Need help? Get in touch with the Kazicloud team. We\'re here to help you succeed.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
