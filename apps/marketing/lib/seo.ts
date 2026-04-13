import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image = '/og-image.png',
  url = '',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
}: SEOProps): Metadata {
  const baseUrl = 'https://kazicloud.com'
  const fullUrl = `${baseUrl}${url}`
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      type,
      url: fullUrl,
      title,
      description,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

// Structured Data (JSON-LD) generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kazicloud',
    url: 'https://kazicloud.com',
    logo: 'https://kazicloud.com/logo.png',
    description: 'The modern job platform connecting talented professionals with forward-thinking companies.',
    sameAs: [
      'https://twitter.com/kazicloud',
      'https://linkedin.com/company/kazicloud',
      'https://github.com/kazicloud',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@kazicloud.com',
      contactType: 'Customer Service',
    },
  }
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kazicloud',
    url: 'https://kazicloud.com',
    description: 'The modern job platform connecting talented professionals with forward-thinking companies.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://kazicloud.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateJobPostingSchema(job: {
  title: string
  description: string
  company: string
  location: string
  salary?: { min: number; max: number; currency: string }
  employmentType: string
  datePosted: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
      },
    },
    ...(job.salary && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: job.salary.currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary.min,
          maxValue: job.salary.max,
          unitText: 'YEAR',
        },
      },
    }),
    employmentType: job.employmentType,
    datePosted: job.datePosted,
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://kazicloud.com${item.url}`,
    })),
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
