import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch | KaziCloud',
  description: 'Have questions? Need help? Get in touch with the KaziCloud team. We\'re here to help you succeed.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
