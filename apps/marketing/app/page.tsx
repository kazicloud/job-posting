import type { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import LogoBelt from '@/components/sections/LogoBelt'
import Features from '@/components/sections/Features'
import JobShowcase from '@/components/sections/JobShowcase'
import Process from '@/components/sections/Process'
import Proof from '@/components/sections/Proof'
import Final from '@/components/sections/Final'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ConvexClientProvider } from '@/providers/ConvexClientProvider'
import JsonLd from '@/components/seo/JsonLd'

// Homepage metadata overrides the root layout's default title for this page only
export const metadata: Metadata = {
  title: 'Kazicloud – #1 Job Board in Kenya, Uganda, Rwanda & Tanzania',
  description:
    "Find your next job in East Africa. Browse thousands of verified vacancies in Kenya, Uganda, Rwanda and Tanzania. New jobs added daily in Nairobi, Kampala, Kigali and Dar es Salaam. Free to apply.",
  alternates: {
    canonical: '/',
    languages: {
      'en-KE': 'https://kazicloud.com',
      'en-UG': 'https://kazicloud.com',
      'en-RW': 'https://kazicloud.com',
      'en-TZ': 'https://kazicloud.com',
      'x-default': 'https://kazicloud.com',
    },
  },
  openGraph: {
    title: 'Kazicloud – #1 Job Board in Kenya, Uganda, Rwanda & Tanzania',
    description:
      "Find your next job in East Africa. Thousands of verified vacancies updated daily. Free to apply.",
    url: 'https://kazicloud.com',
  },
}

// Homepage WebPage schema — tells Google this is the root page of an employment agency/job board
const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://kazicloud.com/#webpage',
  url: 'https://kazicloud.com',
  name: 'Kazicloud – #1 Job Board in Kenya, Uganda, Rwanda & Tanzania',
  description:
    "Find your next job in East Africa. Browse thousands of verified vacancies in Kenya, Uganda, Rwanda and Tanzania.",
  isPartOf: { '@id': 'https://kazicloud.com/#website' },
  about: { '@id': 'https://kazicloud.com/#organization' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://kazicloud.com/og-image.png',
    width: 1200,
    height: 630,
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://kazicloud.com',
      },
    ],
  },
  // EmploymentAgency is specifically recognised by Google for job-board sites
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', '.hero-description'],
  },
}

// FAQ schema for the homepage — drives FAQ rich snippets in SERPs
// Mirrors what Glassdoor and Fuzu implement on their main landing pages
const homepageFAQSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I find jobs in Kenya on Kazicloud?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Visit kazicloud.com/jobs, use the search bar to enter your job title or skills, then filter by location such as Nairobi, Mombasa, or Kisumu. All jobs are verified and updated daily.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Kazicloud free for job seekers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Browsing and applying to jobs on Kazicloud is completely free for job seekers. We also offer optional premium career services such as ATS CV writing and career coaching.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which countries does Kazicloud cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kazicloud covers Kenya, Uganda, Rwanda and Tanzania. You can find jobs in major cities including Nairobi, Kampala, Kigali and Dar es Salaam, as well as remote opportunities.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can employers post jobs on Kazicloud?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Employers can sign up at kazicloud.com, complete company verification, and post jobs immediately. AI matching surfaces your jobs to the most relevant candidates across East Africa.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of jobs are available on Kazicloud?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kazicloud lists jobs across all industries including technology, finance, marketing, healthcare, NGO, government, and more. Both full-time and remote positions are available across East Africa.',
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <JsonLd schema={webPageSchema} />
      <JsonLd schema={homepageFAQSchema} />
      <Header />
      <main>
        <Hero />
        <LogoBelt />
        <Features />
        <ConvexClientProvider>
          <JobShowcase />
        </ConvexClientProvider>
        <Process />
        <Proof />
        <Final />
      </main>
      <Footer />
    </>
  )
}
