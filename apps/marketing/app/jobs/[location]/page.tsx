import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ConvexClientProvider } from '@/providers/ConvexClientProvider'
import PublicJobsContent from '@/components/jobs/PublicJobsContent'
import JsonLd from '@/components/seo/JsonLd'

// ── Location data registry ────────────────────────────────────────────────────
// Each entry maps a URL slug to rich SEO content + structured data signals.
// This is the core pattern that Indeed, Glassdoor, and LinkedIn use to
// dominate geo-intent searches ("jobs in Nairobi", "jobs Uganda", etc.)

type LocationEntry = {
  slug: string
  title: string
  h1: string
  description: string
  metaDescription: string
  keywords: string[]
  country: string
  countryCode: string
  region?: string
  city?: string
  geoPosition: string
  placename: string
  relatedLocations: { label: string; slug: string }[]
  relatedCategories: { label: string; href: string }[]
  faqs: { question: string; answer: string }[]
  stats: { label: string; value: string }[]
}

const locations: Record<string, LocationEntry> = {
  kenya: {
    slug: 'kenya',
    title: 'Jobs in Kenya – Browse Thousands of Vacancies',
    h1: 'Jobs in Kenya',
    description:
      "Kenya's most complete job board. Thousands of verified vacancies from top employers across Nairobi, Mombasa, Kisumu and beyond. Search by salary, industry, and experience level.",
    metaDescription:
      "Browse thousands of verified job vacancies in Kenya. Jobs in Nairobi, Mombasa, Kisumu and remote. Updated daily. Apply free on Kazicloud – Kenya's #1 job board.",
    keywords: [
      'jobs in Kenya',
      'Kenya jobs 2026',
      'job vacancies Kenya',
      'employment Kenya',
      'jobs Nairobi',
      'remote jobs Kenya',
      'NGO jobs Kenya',
      'tech jobs Kenya',
      'finance jobs Kenya',
      'graduate jobs Kenya',
    ],
    country: 'Kenya',
    countryCode: 'KE',
    geoPosition: '-1.286389;36.817223',
    placename: 'Kenya',
    relatedLocations: [
      { label: 'Jobs in Nairobi', slug: 'nairobi' },
      { label: 'Jobs in Mombasa', slug: 'mombasa' },
      { label: 'Jobs in Kisumu', slug: 'kisumu' },
      { label: 'Remote Jobs (Kenya)', slug: 'remote-kenya' },
    ],
    relatedCategories: [
      { label: 'Tech Jobs in Kenya', href: '/jobs?category=technology&location=Kenya' },
      { label: 'Finance Jobs in Kenya', href: '/jobs?category=finance&location=Kenya' },
      { label: 'Marketing Jobs in Kenya', href: '/jobs?category=marketing&location=Kenya' },
      { label: 'NGO Jobs in Kenya', href: '/jobs?category=ngo&location=Kenya' },
      { label: 'Graduate Jobs in Kenya', href: '/jobs?category=entry-level&location=Kenya' },
    ],
    faqs: [
      {
        question: 'How do I find verified jobs in Kenya?',
        answer:
          'All jobs on Kazicloud are verified before going live. Use our search bar to enter your role or skills, then filter by Kenya or a specific county. New verified jobs are added every day.',
      },
      {
        question: 'What are the most in-demand jobs in Kenya right now?',
        answer:
          'The highest-demand roles in Kenya in 2026 include software developers, data analysts, sales managers, customer service officers, finance and accounting professionals, and digital marketers.',
      },
      {
        question: 'Are there remote jobs available in Kenya?',
        answer:
          'Yes. Kazicloud lists hundreds of remote and hybrid jobs specifically for Kenya-based professionals, including remote roles with international companies paying in USD.',
      },
      {
        question: 'Is it free to apply for jobs in Kenya on Kazicloud?',
        answer:
          'Absolutely. Creating an account and applying to any job on Kazicloud is 100% free for job seekers. We never charge candidates to apply.',
      },
    ],
    stats: [
      { label: 'Active Jobs', value: '5,000+' },
      { label: 'Verified Employers', value: '500+' },
      { label: 'Job Seekers', value: '50,000+' },
      { label: 'Successful Hires', value: '10,000+' },
    ],
  },

  nairobi: {
    slug: 'nairobi',
    title: 'Jobs in Nairobi – Nairobi\'s Top Job Board',
    h1: 'Jobs in Nairobi',
    description:
      "Find the best jobs in Nairobi on Kenya's leading job platform. Thousands of roles across tech, finance, marketing, NGOs, and more. Updated daily from top Nairobi employers.",
    metaDescription:
      "Browse thousands of verified jobs in Nairobi, Kenya. Search tech, finance, NGO and remote roles. Updated daily. Free to apply on Kazicloud – Nairobi's #1 job board.",
    keywords: [
      'jobs in Nairobi',
      'Nairobi jobs 2026',
      'job vacancies Nairobi',
      'Nairobi employment',
      'tech jobs Nairobi',
      'NGO jobs Nairobi',
      'finance jobs Nairobi',
      'CBD jobs Nairobi',
      'Westlands jobs',
      'Kilimani jobs',
    ],
    country: 'Kenya',
    countryCode: 'KE',
    region: 'Nairobi County',
    city: 'Nairobi',
    geoPosition: '-1.286389;36.817223',
    placename: 'Nairobi, Kenya',
    relatedLocations: [
      { label: 'All Kenya Jobs', slug: 'kenya' },
      { label: 'Jobs in Mombasa', slug: 'mombasa' },
      { label: 'Jobs in Kisumu', slug: 'kisumu' },
      { label: 'Remote Jobs Kenya', slug: 'remote-kenya' },
    ],
    relatedCategories: [
      { label: 'Tech Jobs Nairobi', href: '/jobs?category=technology&location=Nairobi' },
      { label: 'Finance Jobs Nairobi', href: '/jobs?category=finance&location=Nairobi' },
      { label: 'NGO Jobs Nairobi', href: '/jobs?category=ngo&location=Nairobi' },
      { label: 'Sales Jobs Nairobi', href: '/jobs?category=sales&location=Nairobi' },
    ],
    faqs: [
      {
        question: 'What industries are hiring in Nairobi right now?',
        answer:
          'Nairobi\'s fastest-hiring sectors in 2026 include fintech, SaaS/software, telecommunications, banking, international NGOs, media, and logistics.',
      },
      {
        question: 'Where are most jobs located in Nairobi?',
        answer:
          'Most corporate jobs in Nairobi are concentrated in the CBD, Westlands, Upper Hill, Kilimani, Karen, and along Thika Road. Tech companies cluster around Kilimani and Westlands.',
      },
      {
        question: 'What is the average salary in Nairobi?',
        answer:
          'Salaries in Nairobi vary widely. Entry-level professionals earn KES 30,000–60,000/month. Mid-level roles range from KES 80,000–200,000. Senior/C-suite can exceed KES 500,000.',
      },
    ],
    stats: [
      { label: 'Nairobi Jobs', value: '3,000+' },
      { label: 'Top Employers', value: '300+' },
      { label: 'New Jobs Daily', value: '50+' },
      { label: 'Industries', value: '25+' },
    ],
  },

  mombasa: {
    slug: 'mombasa',
    title: 'Jobs in Mombasa – Browse Mombasa Job Vacancies',
    h1: 'Jobs in Mombasa',
    description:
      "Find verified jobs in Mombasa, Kenya's second-largest city. Roles in port & logistics, tourism, hospitality, retail, and more. Apply free on Kazicloud.",
    metaDescription:
      "Browse verified jobs in Mombasa, Kenya. Roles in logistics, tourism, hospitality and more. Updated daily. Free to apply – Kazicloud.",
    keywords: [
      'jobs in Mombasa',
      'Mombasa jobs 2026',
      'job vacancies Mombasa',
      'Mombasa employment',
      'port jobs Mombasa',
      'tourism jobs Mombasa',
      'hospitality jobs Mombasa',
    ],
    country: 'Kenya',
    countryCode: 'KE',
    region: 'Mombasa County',
    city: 'Mombasa',
    geoPosition: '-4.043477;39.668206',
    placename: 'Mombasa, Kenya',
    relatedLocations: [
      { label: 'All Kenya Jobs', slug: 'kenya' },
      { label: 'Jobs in Nairobi', slug: 'nairobi' },
      { label: 'Jobs in Kisumu', slug: 'kisumu' },
    ],
    relatedCategories: [
      { label: 'Logistics Jobs Mombasa', href: '/jobs?category=logistics&location=Mombasa' },
      { label: 'Tourism Jobs Mombasa', href: '/jobs?category=tourism&location=Mombasa' },
      { label: 'Hospitality Jobs Mombasa', href: '/jobs?category=hospitality&location=Mombasa' },
    ],
    faqs: [
      {
        question: 'What are the top job sectors in Mombasa?',
        answer:
          'Mombasa\'s top employment sectors include port & maritime logistics, tourism and hospitality, retail and trade, manufacturing, and government/county jobs.',
      },
      {
        question: 'Are there tech jobs in Mombasa?',
        answer:
          'Yes. While smaller than Nairobi\'s tech scene, Mombasa has a growing number of tech roles especially in fintech, e-commerce, and IT support for the logistics industry.',
      },
    ],
    stats: [
      { label: 'Mombasa Jobs', value: '500+' },
      { label: 'Top Employers', value: '80+' },
      { label: 'Industries', value: '15+' },
      { label: 'New Jobs Weekly', value: '30+' },
    ],
  },

  kisumu: {
    slug: 'kisumu',
    title: 'Jobs in Kisumu – Browse Kisumu Job Vacancies',
    h1: 'Jobs in Kisumu',
    description:
      "Find verified jobs in Kisumu, Kenya's third-largest city. Healthcare, NGO, government, trade, and tech opportunities. Apply free on Kazicloud.",
    metaDescription:
      "Browse verified jobs in Kisumu, Kenya. Healthcare, NGO, government and trade roles. Updated daily. Free to apply – Kazicloud.",
    keywords: [
      'jobs in Kisumu',
      'Kisumu jobs 2026',
      'job vacancies Kisumu',
      'Kisumu employment',
      'NGO jobs Kisumu',
      'healthcare jobs Kisumu',
    ],
    country: 'Kenya',
    countryCode: 'KE',
    region: 'Kisumu County',
    city: 'Kisumu',
    geoPosition: '-0.091702;34.767956',
    placename: 'Kisumu, Kenya',
    relatedLocations: [
      { label: 'All Kenya Jobs', slug: 'kenya' },
      { label: 'Jobs in Nairobi', slug: 'nairobi' },
      { label: 'Jobs in Mombasa', slug: 'mombasa' },
    ],
    relatedCategories: [
      { label: 'NGO Jobs Kisumu', href: '/jobs?category=ngo&location=Kisumu' },
      { label: 'Healthcare Jobs Kisumu', href: '/jobs?category=healthcare&location=Kisumu' },
    ],
    faqs: [
      {
        question: 'What types of jobs are available in Kisumu?',
        answer:
          'Kisumu has strong demand for healthcare professionals, NGO/development workers, county government roles, trade and retail, education, and agribusiness.',
      },
    ],
    stats: [
      { label: 'Kisumu Jobs', value: '300+' },
      { label: 'Top Employers', value: '50+' },
      { label: 'Industries', value: '10+' },
      { label: 'New Jobs Weekly', value: '15+' },
    ],
  },

  uganda: {
    slug: 'uganda',
    title: 'Jobs in Uganda – Browse Uganda Job Vacancies',
    h1: 'Jobs in Uganda',
    description:
      "Uganda's fastest-growing job board. Find verified job vacancies in Kampala and across Uganda. Tech, finance, NGO, agriculture and more. Apply free on Kazicloud.",
    metaDescription:
      "Browse thousands of verified jobs in Uganda. Roles in Kampala, Entebbe, Jinja and more. Updated daily. Apply free on Kazicloud – Uganda's top job platform.",
    keywords: [
      'jobs in Uganda',
      'Uganda jobs 2026',
      'job vacancies Uganda',
      'employment Uganda',
      'jobs Kampala',
      'NGO jobs Uganda',
      'tech jobs Uganda',
      'Uganda graduate jobs',
      'remote jobs Uganda',
    ],
    country: 'Uganda',
    countryCode: 'UG',
    geoPosition: '0.347596;32.582520',
    placename: 'Uganda',
    relatedLocations: [
      { label: 'Jobs in Kampala', slug: 'kampala' },
      { label: 'Jobs in Kenya', slug: 'kenya' },
      { label: 'Jobs in Rwanda', slug: 'rwanda' },
      { label: 'Remote Jobs East Africa', slug: 'remote-east-africa' },
    ],
    relatedCategories: [
      { label: 'Tech Jobs Uganda', href: '/jobs?category=technology&location=Uganda' },
      { label: 'NGO Jobs Uganda', href: '/jobs?category=ngo&location=Uganda' },
      { label: 'Finance Jobs Uganda', href: '/jobs?category=finance&location=Uganda' },
      { label: 'Graduate Jobs Uganda', href: '/jobs?category=entry-level&location=Uganda' },
    ],
    faqs: [
      {
        question: 'How do I find jobs in Uganda on Kazicloud?',
        answer:
          'Go to kazicloud.com/jobs, search by role or skills, and filter by Uganda or a specific city like Kampala. All listed jobs are verified by our team before going live.',
      },
      {
        question: 'What are the top hiring sectors in Uganda?',
        answer:
          'Uganda\'s top hiring sectors include telecommunications, banking and finance, NGO and development, education, agriculture/agritech, and an emerging tech startup scene in Kampala.',
      },
      {
        question: 'Are there remote jobs for Ugandans?',
        answer:
          'Yes. Kazicloud lists remote roles suitable for Uganda-based professionals, including positions with East African and international companies.',
      },
    ],
    stats: [
      { label: 'Uganda Jobs', value: '1,500+' },
      { label: 'Verified Employers', value: '150+' },
      { label: 'New Jobs Daily', value: '20+' },
      { label: 'Industries', value: '20+' },
    ],
  },

  kampala: {
    slug: 'kampala',
    title: 'Jobs in Kampala – Kampala\'s Top Job Board',
    h1: 'Jobs in Kampala',
    description:
      "Find the best jobs in Kampala, Uganda's capital and economic hub. Roles across tech, banking, NGOs, and more from top Kampala employers. Apply free on Kazicloud.",
    metaDescription:
      "Browse verified jobs in Kampala, Uganda. Tech, NGO, banking and more. Updated daily. Free to apply – Kazicloud.",
    keywords: [
      'jobs in Kampala',
      'Kampala jobs 2026',
      'job vacancies Kampala',
      'employment Kampala',
      'tech jobs Kampala',
      'NGO jobs Kampala',
      'Kampala Uganda jobs',
    ],
    country: 'Uganda',
    countryCode: 'UG',
    city: 'Kampala',
    geoPosition: '0.347596;32.582520',
    placename: 'Kampala, Uganda',
    relatedLocations: [
      { label: 'All Uganda Jobs', slug: 'uganda' },
      { label: 'Jobs in Kenya', slug: 'kenya' },
      { label: 'Jobs in Rwanda', slug: 'rwanda' },
    ],
    relatedCategories: [
      { label: 'Tech Jobs Kampala', href: '/jobs?category=technology&location=Kampala' },
      { label: 'NGO Jobs Kampala', href: '/jobs?category=ngo&location=Kampala' },
      { label: 'Banking Jobs Kampala', href: '/jobs?category=finance&location=Kampala' },
    ],
    faqs: [
      {
        question: 'What industries are growing in Kampala?',
        answer:
          'Kampala\'s fastest-growing industries include fintech and mobile money, international NGOs and development, telecommunications, media, real estate, and logistics.',
      },
    ],
    stats: [
      { label: 'Kampala Jobs', value: '1,000+' },
      { label: 'Top Employers', value: '120+' },
      { label: 'New Jobs Daily', value: '15+' },
      { label: 'Industries', value: '18+' },
    ],
  },

  rwanda: {
    slug: 'rwanda',
    title: 'Jobs in Rwanda – Browse Rwanda Job Vacancies',
    h1: 'Jobs in Rwanda',
    description:
      "Rwanda's fastest-growing job platform. Find verified job vacancies in Kigali and across Rwanda. Tech, finance, tourism, and international development opportunities. Apply free on Kazicloud.",
    metaDescription:
      "Browse verified jobs in Rwanda. Roles in Kigali and across the country. Tech, tourism, NGO and finance. Updated daily. Free to apply – Kazicloud.",
    keywords: [
      'jobs in Rwanda',
      'Rwanda jobs 2026',
      'job vacancies Rwanda',
      'employment Rwanda',
      'jobs Kigali',
      'tech jobs Rwanda',
      'NGO jobs Rwanda',
      'graduate jobs Rwanda',
      'remote jobs Rwanda',
    ],
    country: 'Rwanda',
    countryCode: 'RW',
    geoPosition: '-1.940278;29.873888',
    placename: 'Rwanda',
    relatedLocations: [
      { label: 'Jobs in Kigali', slug: 'kigali' },
      { label: 'Jobs in Kenya', slug: 'kenya' },
      { label: 'Jobs in Uganda', slug: 'uganda' },
      { label: 'Remote Jobs East Africa', slug: 'remote-east-africa' },
    ],
    relatedCategories: [
      { label: 'Tech Jobs Rwanda', href: '/jobs?category=technology&location=Rwanda' },
      { label: 'Tourism Jobs Rwanda', href: '/jobs?category=tourism&location=Rwanda' },
      { label: 'NGO Jobs Rwanda', href: '/jobs?category=ngo&location=Rwanda' },
      { label: 'Finance Jobs Rwanda', href: '/jobs?category=finance&location=Rwanda' },
    ],
    faqs: [
      {
        question: 'What are the top jobs in Rwanda right now?',
        answer:
          'Rwanda\'s most in-demand roles include software developers, digital marketers, project managers, tourism professionals, banking and microfinance officers, and NGO programme coordinators.',
      },
      {
        question: 'Is Kigali a good city to find work in East Africa?',
        answer:
          'Yes. Kigali is consistently ranked one of Africa\'s top business cities. It has a thriving tech and startup ecosystem, strong NGO presence, and a growing financial services sector.',
      },
      {
        question: 'Are there English-language jobs in Rwanda?',
        answer:
          'Yes. English is an official language in Rwanda alongside Kinyarwanda and French. Most corporate and NGO jobs in Kigali require English proficiency.',
      },
    ],
    stats: [
      { label: 'Rwanda Jobs', value: '800+' },
      { label: 'Verified Employers', value: '100+' },
      { label: 'New Jobs Daily', value: '12+' },
      { label: 'Industries', value: '15+' },
    ],
  },

  kigali: {
    slug: 'kigali',
    title: 'Jobs in Kigali – Kigali\'s Top Job Board',
    h1: 'Jobs in Kigali',
    description:
      "Find the best jobs in Kigali, Rwanda's capital and tech hub. Roles in technology, NGOs, finance, and tourism. From top Kigali employers. Apply free on Kazicloud.",
    metaDescription:
      "Browse verified jobs in Kigali, Rwanda. Tech, NGO, finance and tourism roles. Updated daily. Free to apply – Kazicloud.",
    keywords: [
      'jobs in Kigali',
      'Kigali jobs 2026',
      'job vacancies Kigali',
      'employment Kigali',
      'tech jobs Kigali',
      'Kigali Rwanda jobs',
      'NGO jobs Kigali',
    ],
    country: 'Rwanda',
    countryCode: 'RW',
    city: 'Kigali',
    geoPosition: '-1.940278;29.873888',
    placename: 'Kigali, Rwanda',
    relatedLocations: [
      { label: 'All Rwanda Jobs', slug: 'rwanda' },
      { label: 'Jobs in Kenya', slug: 'kenya' },
      { label: 'Jobs in Uganda', slug: 'uganda' },
    ],
    relatedCategories: [
      { label: 'Tech Jobs Kigali', href: '/jobs?category=technology&location=Kigali' },
      { label: 'NGO Jobs Kigali', href: '/jobs?category=ngo&location=Kigali' },
      { label: 'Tourism Jobs Kigali', href: '/jobs?category=tourism&location=Kigali' },
    ],
    faqs: [
      {
        question: 'What makes Kigali attractive for job seekers?',
        answer:
          'Kigali offers excellent quality of life, a clean and safe environment, a booming tech and startup scene supported by Kigali Innovation City, and strong demand from international organisations and NGOs.',
      },
    ],
    stats: [
      { label: 'Kigali Jobs', value: '600+' },
      { label: 'Top Employers', value: '80+' },
      { label: 'New Jobs Daily', value: '10+' },
      { label: 'Industries', value: '12+' },
    ],
  },

  tanzania: {
    slug: 'tanzania',
    title: 'Jobs in Tanzania – Browse Tanzania Job Vacancies',
    h1: 'Jobs in Tanzania',
    description:
      "Tanzania's growing job platform. Find verified job vacancies in Dar es Salaam, Arusha, Dodoma, and across Tanzania. Mining, tourism, finance, and tech opportunities. Apply free on Kazicloud.",
    metaDescription:
      "Browse verified jobs in Tanzania. Roles in Dar es Salaam, Arusha and more. Mining, tourism, finance and tech. Updated daily. Free to apply – Kazicloud.",
    keywords: [
      'jobs in Tanzania',
      'Tanzania jobs 2026',
      'job vacancies Tanzania',
      'employment Tanzania',
      'jobs Dar es Salaam',
      'mining jobs Tanzania',
      'tech jobs Tanzania',
      'NGO jobs Tanzania',
      'remote jobs Tanzania',
    ],
    country: 'Tanzania',
    countryCode: 'TZ',
    geoPosition: '-6.369028;34.888822',
    placename: 'Tanzania',
    relatedLocations: [
      { label: 'Jobs in Dar es Salaam', slug: 'dar-es-salaam' },
      { label: 'Jobs in Kenya', slug: 'kenya' },
      { label: 'Jobs in Uganda', slug: 'uganda' },
      { label: 'Remote Jobs East Africa', slug: 'remote-east-africa' },
    ],
    relatedCategories: [
      { label: 'Mining Jobs Tanzania', href: '/jobs?category=mining&location=Tanzania' },
      { label: 'Tourism Jobs Tanzania', href: '/jobs?category=tourism&location=Tanzania' },
      { label: 'Tech Jobs Tanzania', href: '/jobs?category=technology&location=Tanzania' },
      { label: 'NGO Jobs Tanzania', href: '/jobs?category=ngo&location=Tanzania' },
    ],
    faqs: [
      {
        question: 'What are the top sectors hiring in Tanzania?',
        answer:
          'Tanzania\'s top hiring sectors include mining and extractives, tourism and hospitality, telecommunications, banking and microfinance, NGO and development, and a growing technology sector.',
      },
      {
        question: 'Do I need to speak Swahili to work in Tanzania?',
        answer:
          'For many corporate and international roles, English is sufficient. However, Swahili proficiency is highly valued for customer-facing and government roles in Tanzania.',
      },
    ],
    stats: [
      { label: 'Tanzania Jobs', value: '700+' },
      { label: 'Verified Employers', value: '90+' },
      { label: 'New Jobs Daily', value: '10+' },
      { label: 'Industries', value: '15+' },
    ],
  },

  'dar-es-salaam': {
    slug: 'dar-es-salaam',
    title: 'Jobs in Dar es Salaam – Dar es Salaam Job Vacancies',
    h1: 'Jobs in Dar es Salaam',
    description:
      "Find the best jobs in Dar es Salaam, Tanzania's commercial capital. Finance, logistics, NGO, tech and more. From top Dar es Salaam employers. Apply free on Kazicloud.",
    metaDescription:
      "Browse verified jobs in Dar es Salaam, Tanzania. Finance, logistics, NGO and tech roles. Updated daily. Free to apply – Kazicloud.",
    keywords: [
      'jobs in Dar es Salaam',
      'Dar es Salaam jobs 2026',
      'job vacancies Dar es Salaam',
      'Dar es Salaam employment',
      'jobs DSM Tanzania',
      'finance jobs Dar es Salaam',
    ],
    country: 'Tanzania',
    countryCode: 'TZ',
    city: 'Dar es Salaam',
    geoPosition: '-6.792354;39.208328',
    placename: 'Dar es Salaam, Tanzania',
    relatedLocations: [
      { label: 'All Tanzania Jobs', slug: 'tanzania' },
      { label: 'Jobs in Kenya', slug: 'kenya' },
      { label: 'Jobs in Uganda', slug: 'uganda' },
    ],
    relatedCategories: [
      { label: 'Finance Jobs Dar es Salaam', href: '/jobs?category=finance&location=Dar+es+Salaam' },
      { label: 'Logistics Jobs Dar es Salaam', href: '/jobs?category=logistics&location=Dar+es+Salaam' },
      { label: 'NGO Jobs Dar es Salaam', href: '/jobs?category=ngo&location=Dar+es+Salaam' },
    ],
    faqs: [
      {
        question: 'What industries are strongest in Dar es Salaam?',
        answer:
          'Dar es Salaam is Tanzania\'s commercial hub with strong demand in banking and finance, port logistics and shipping, telecommunications, retail, NGOs, and an emerging tech sector.',
      },
    ],
    stats: [
      { label: 'DSM Jobs', value: '500+' },
      { label: 'Top Employers', value: '70+' },
      { label: 'New Jobs Daily', value: '8+' },
      { label: 'Industries', value: '12+' },
    ],
  },

  'remote-kenya': {
    slug: 'remote-kenya',
    title: 'Remote Jobs in Kenya – Work From Home Kenya',
    h1: 'Remote Jobs in Kenya',
    description:
      "Find legitimate remote and work-from-home jobs for Kenya-based professionals. Roles with local and international companies. Paid in KES and USD. Updated daily on Kazicloud.",
    metaDescription:
      "Browse verified remote jobs in Kenya. Work from home roles for Kenya-based professionals. Paid in KES and USD. Updated daily – Kazicloud.",
    keywords: [
      'remote jobs Kenya',
      'work from home Kenya',
      'remote jobs Nairobi',
      'online jobs Kenya',
      'work from home Nairobi',
      'remote work Kenya 2026',
      'international remote jobs Kenya',
    ],
    country: 'Kenya',
    countryCode: 'KE',
    geoPosition: '-1.286389;36.817223',
    placename: 'Kenya (Remote)',
    relatedLocations: [
      { label: 'All Kenya Jobs', slug: 'kenya' },
      { label: 'Jobs in Nairobi', slug: 'nairobi' },
      { label: 'Remote East Africa', slug: 'remote-east-africa' },
    ],
    relatedCategories: [
      { label: 'Remote Tech Jobs Kenya', href: '/jobs?category=technology&workplaceType=remote&location=Kenya' },
      { label: 'Remote Marketing Jobs Kenya', href: '/jobs?category=marketing&workplaceType=remote&location=Kenya' },
      { label: 'Remote Customer Service Kenya', href: '/jobs?category=customer-service&workplaceType=remote&location=Kenya' },
    ],
    faqs: [
      {
        question: 'Are remote jobs in Kenya legitimate?',
        answer:
          'All remote jobs on Kazicloud are verified before listing. We check employers against business registrations to filter out scams. Look for the verified badge on each listing.',
      },
      {
        question: 'What remote jobs pay the most in Kenya?',
        answer:
          'The highest-paying remote jobs for Kenya-based professionals include software development, product management, data science, UX design, and digital marketing roles — often paid in USD by international companies.',
      },
      {
        question: 'Do I need a specific setup to apply for remote jobs in Kenya?',
        answer:
          'Most remote employers require a reliable internet connection (minimum 10Mbps), a dedicated workspace, and a laptop. Some roles also require a specific time zone overlap with a foreign team.',
      },
    ],
    stats: [
      { label: 'Remote Kenya Jobs', value: '800+' },
      { label: 'USD-Paying Roles', value: '200+' },
      { label: 'Industries', value: '20+' },
      { label: 'New Remote Jobs', value: '15+/day' },
    ],
  },

  'remote-east-africa': {
    slug: 'remote-east-africa',
    title: 'Remote Jobs in East Africa – Work From Anywhere',
    h1: 'Remote Jobs in East Africa',
    description:
      "Find remote and work-from-home jobs open to professionals across East Africa — Kenya, Uganda, Rwanda, and Tanzania. Roles with global and regional employers. Apply free on Kazicloud.",
    metaDescription:
      "Browse verified remote jobs open to East African professionals in Kenya, Uganda, Rwanda and Tanzania. Local and international roles. Updated daily – Kazicloud.",
    keywords: [
      'remote jobs East Africa',
      'work from home East Africa',
      'remote jobs Africa',
      'online jobs East Africa',
      'work from home Kenya Uganda Rwanda Tanzania',
      'international remote jobs East Africa',
    ],
    country: 'Kenya',
    countryCode: 'KE',
    geoPosition: '-1.286389;36.817223',
    placename: 'East Africa (Remote)',
    relatedLocations: [
      { label: 'Remote Jobs Kenya', slug: 'remote-kenya' },
      { label: 'Jobs in Kenya', slug: 'kenya' },
      { label: 'Jobs in Uganda', slug: 'uganda' },
      { label: 'Jobs in Rwanda', slug: 'rwanda' },
    ],
    relatedCategories: [
      { label: 'Remote Tech Jobs', href: '/jobs?category=technology&workplaceType=remote' },
      { label: 'Remote Marketing Jobs', href: '/jobs?category=marketing&workplaceType=remote' },
      { label: 'Remote Finance Jobs', href: '/jobs?category=finance&workplaceType=remote' },
    ],
    faqs: [
      {
        question: 'Which remote jobs are open to all East African countries?',
        answer:
          'Many international companies hire remotely across East Africa for roles in software development, digital marketing, content creation, data analysis, customer support, and project management.',
      },
    ],
    stats: [
      { label: 'Remote EA Jobs', value: '1,200+' },
      { label: 'Countries Covered', value: '4' },
      { label: 'New Remote Jobs', value: '20+/day' },
      { label: 'Industries', value: '25+' },
    ],
  },
}

// ── Static params for ISR / SSG ──────────────────────────────────────────────
// Next.js pre-generates each location page at build time.
// This is exactly how Indeed generates /jobs/in/kenya-type pages.
export function generateStaticParams() {
  return Object.keys(locations).map((slug) => ({ location: slug }))
}

// ── Per-location dynamic metadata ────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>
}): Promise<Metadata> {
  const { location } = await params
  const data = locations[location]
  if (!data) return {}

  return {
    title: data.title,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: {
      canonical: `/jobs/${data.slug}`,
      languages: {
        [`en-${data.countryCode}`]: `https://kazicloud.com/jobs/${data.slug}`,
        'x-default': `https://kazicloud.com/jobs/${data.slug}`,
      },
    },
    openGraph: {
      title: `${data.title} | Kazicloud`,
      description: data.metaDescription,
      url: `https://kazicloud.com/jobs/${data.slug}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${data.h1} – Kazicloud`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} | Kazicloud`,
      description: data.metaDescription,
    },
    other: {
      'geo.region': data.countryCode,
      'geo.placename': data.placename,
      'geo.position': data.geoPosition,
      ICBM: data.geoPosition.replace(';', ', '),
    },
  }
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function LocationJobsPage({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location } = await params
  const data = locations[location]

  if (!data) notFound()

  // BreadcrumbList schema — used by every major job board to get rich breadcrumb
  // snippets in Google SERPs (replaces the plain URL with readable breadcrumbs)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://kazicloud.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Jobs',
        item: 'https://kazicloud.com/jobs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.h1,
        item: `https://kazicloud.com/jobs/${data.slug}`,
      },
    ],
  }

  // FAQPage schema — drives FAQ rich snippets in Google SERPs
  // Glassdoor uses these on every location page to claim extra SERP real estate
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  // JobSearch schema — signals to Google this is a job search results page
  const jobSearchSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `https://kazicloud.com/jobs/${data.slug}#webpage`,
    url: `https://kazicloud.com/jobs/${data.slug}`,
    name: data.title,
    description: data.metaDescription,
    isPartOf: { '@id': 'https://kazicloud.com/#website' },
    breadcrumb: { '@id': `https://kazicloud.com/jobs/${data.slug}#breadcrumb` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://kazicloud.com/jobs?q={search_term_string}&location=${encodeURIComponent(data.city ?? data.country)}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      {/* Structured data injected in <head> via Next.js */}
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />
      <JsonLd schema={jobSearchSchema} />

      <Header />
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb (visible) */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-neutral-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li aria-hidden="true" className="text-neutral-600">/</li>
                <li><a href="/jobs" className="hover:text-white transition-colors">Jobs</a></li>
                <li aria-hidden="true" className="text-neutral-600">/</li>
                <li className="text-white font-medium" aria-current="page">{data.h1}</li>
              </ol>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.h1}</h1>
            <p className="text-lg text-neutral-300 max-w-2xl mb-8">{data.description}</p>

            {/* Stats row — social proof, mirrors Indeed's "X jobs available" */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.stats.map((stat) => (
                <div key={stat.label} className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{stat.value}</div>
                  <div className="text-sm text-neutral-300 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Job listings ─────────────────────────────────────────────── */}
        <section className="min-h-screen bg-neutral-50">
          <ConvexClientProvider>
            <PublicJobsContent />
          </ConvexClientProvider>
        </section>

        {/* ── Related searches (internal linking) ──────────────────────── */}
        {/* This is the LinkedIn/Indeed pattern — a dense internal link network
            that distributes PageRank to all location pages from each other */}
        <section className="bg-white border-t border-neutral-100 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Related locations */}
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                  Related Job Locations
                </h2>
                <ul className="space-y-2">
                  {data.relatedLocations.map((loc) => (
                    <li key={loc.slug}>
                      <a
                        href={`/jobs/${loc.slug}`}
                        className="text-orange-600 hover:text-orange-700 hover:underline text-sm"
                      >
                        {loc.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related categories */}
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                  Popular Job Categories
                </h2>
                <ul className="space-y-2">
                  {data.relatedCategories.map((cat) => (
                    <li key={cat.href}>
                      <a
                        href={cat.href}
                        className="text-orange-600 hover:text-orange-700 hover:underline text-sm"
                      >
                        {cat.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        {/* Renders the same FAQs that are in the JSON-LD schema — Google
            uses the visible page content to validate structured data */}
        <section className="bg-neutral-50 border-t border-neutral-100 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-neutral-800 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {data.faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                  <h3 className="font-semibold text-neutral-800 mb-3">{faq.question}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="bg-orange-500 py-12 px-4 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-3">
              Ready to Find Your Next Job?
            </h2>
            <p className="text-orange-100 mb-6 text-sm">
              Join 50,000+ professionals who found their next opportunity on Kazicloud.
              Create your free account and apply in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/sign-up"
                className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Create Free Account
              </a>
              <a
                href="/jobs"
                className="border border-white/50 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                Browse All Jobs
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
