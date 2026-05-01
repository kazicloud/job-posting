import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Kazicloud – Nairobi-Based East Africa Job Platform',
  description:
    'Get in touch with the Kazicloud team. Based in Nairobi, Kenya, we support job seekers and employers across East Africa. Reach us for job seeker support, employer enquiries, or partnerships.',
  keywords: [
    'contact Kazicloud',
    'Kazicloud Nairobi',
    'job platform Kenya contact',
    'East Africa recruitment support',
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Kazicloud – Nairobi-Based East Africa Job Platform',
    description:
      'Get in touch with the Kazicloud team for job seeker support, employer enquiries, or partnerships across East Africa.',
    url: 'https://kazicloud.com/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
