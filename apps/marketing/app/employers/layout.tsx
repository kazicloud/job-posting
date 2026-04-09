import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Employers - Hire Top Talent Faster | KaziCloud',
  description: 'Access 50,000+ pre-screened candidates. Post jobs, get matched with qualified talent, and hire 50% faster with KaziCloud.',
}

export default function EmployersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
