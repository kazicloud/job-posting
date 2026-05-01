'use client'

import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { use, useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  Briefcase,
  Building2,
  ChevronRight,
  CheckCircle,
  Share2,
  AlertCircle,
  Calendar,
  Award,
  Users,
  Laptop,
  Home,
  ArrowLeft,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://app.kazicloud.com'
const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || 'https://kazicloud.com'

function formatSalary(job: any) {
  if (job.salaryDisclosure === 'range' && job.salaryMin && job.salaryMax) {
    const currency = job.currency || 'KES'
    return `${currency} ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}`
  }
  if (job.salaryDisclosure === 'negotiable') return 'Competitive salary'
  return 'To be discussed'
}

function formatExperienceLevel(level: string) {
  const map: Record<string, string> = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior Level',
    lead: 'Lead',
    executive: 'Executive',
  }
  return map[level] || level
}

function WorkplaceIcon({ type }: { type: string }) {
  switch (type?.toLowerCase()) {
    case 'remote':
      return <Home className="w-4 h-4" />
    case 'hybrid':
      return <Laptop className="w-4 h-4" />
    default:
      return <Building2 className="w-4 h-4" />
  }
}

function getDaysLeft(deadline?: string) {
  if (!deadline) return null
  const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return daysLeft > 0 ? daysLeft : null
}

function getPostedAgo(createdAt: number) {
  const days = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`
}

export default function PublicJobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const job = useQuery(api.jobs.getPublicBySlug, { slug })

  // Hide the mobile fixed bar once the inline apply card scrolls into view
  const ctaRef = useRef<HTMLDivElement>(null)
  const inlineApplyRef = useRef<HTMLDivElement>(null)
  const [showFixedBar, setShowFixedBar] = useState(true)

  useEffect(() => {
    if (!inlineApplyRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          // Inline apply card is in view — hide fixed bar
          setShowFixedBar(false)
        } else {
          // Only show bar if the inline card is still below the viewport
          // (not when user has scrolled past it)
          setShowFixedBar(entry.boundingClientRect.top > 0)
        }
      },
      { threshold: 0 }
    )
    observer.observe(inlineApplyRef.current)
    return () => observer.disconnect()
  }, [job])

  // Loading state
  if (job === undefined) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 lg:pt-28 pb-24 lg:pb-16 animate-pulse">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2">
              <div className="h-3.5 bg-gray-200 rounded w-8" />
              <div className="h-3 bg-gray-200 rounded w-2" />
              <div className="h-3.5 bg-gray-200 rounded w-10" />
              <div className="h-3 bg-gray-200 rounded w-2" />
              <div className="h-3.5 bg-gray-200 rounded w-40" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Job header card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-start gap-3 sm:gap-4 mb-5">
                    {/* Logo */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3.5 bg-gray-200 rounded w-32" />
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {[28, 24, 24, 20].map((w, i) => (
                      <div key={i} className={`h-7 bg-gray-100 rounded-full w-${w}`} />
                    ))}
                  </div>
                  {/* Tag badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <div className="h-6 bg-orange-100 rounded-full w-20" />
                    <div className="h-6 bg-blue-100 rounded-full w-24" />
                  </div>
                  {/* Action row */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="h-3.5 bg-gray-200 rounded w-24" />
                    <div className="ml-auto h-7 bg-gray-100 rounded-lg w-16" />
                  </div>
                </div>

                {/* About this role */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-36" />
                  <div className="space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-5/6" />
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-4/6" />
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-28" />
                  <div className="space-y-2.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-orange-100 rounded flex-shrink-0 mt-0.5" />
                        <div className="h-3.5 bg-gray-100 rounded flex-1" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-40" />
                  <div className="space-y-2.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-orange-100 rounded flex-shrink-0 mt-0.5" />
                        <div className={`h-3.5 bg-gray-100 rounded ${i % 2 === 0 ? 'w-full' : 'w-5/6'}`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="flex flex-wrap gap-2">
                    {[16, 20, 14, 24, 18, 16, 22].map((w, i) => (
                      <div key={i} className={`h-7 bg-gray-100 rounded-full w-${w}`} />
                    ))}
                  </div>
                </div>

                {/* Inline apply card (mobile) */}
                <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-40" />
                  <div className="h-7 bg-gray-200 rounded w-36" />
                  <div className="h-11 bg-orange-200 rounded-xl w-full" />
                  <div className="h-11 bg-gray-100 rounded-xl w-full" />
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-20" />
                  <div className="space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-4/5" />
                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              </div>

              {/* Sidebar (desktop only) */}
              <div className="hidden lg:block space-y-6">
                {/* Apply card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                  <div className="pb-5 border-b border-gray-100 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-12" />
                    <div className="h-7 bg-gray-200 rounded w-40" />
                    <div className="h-3 bg-gray-100 rounded w-32" />
                  </div>
                  <div className="h-3.5 bg-gray-100 rounded w-full" />
                  <div className="h-3.5 bg-gray-100 rounded w-5/6" />
                  <div className="h-12 bg-orange-200 rounded-xl w-full" />
                  <div className="h-11 bg-gray-100 rounded-xl w-full" />
                </div>

                {/* Job summary card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-28" />
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-3.5 bg-gray-100 rounded w-16" />
                        <div className="h-3.5 bg-gray-200 rounded w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Not found or expired
  if (job === null) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-24">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Job Not Available</h1>
            <p className="text-gray-500 mb-8">
              This position is no longer accepting applications or may have been removed.
            </p>
            <Link
              href="/jobs"
              className="inline-block px-8 py-3 bg-[#DC842C] text-white font-semibold rounded-xl hover:bg-[#DC842C]/90 transition-colors"
            >
              Browse Open Positions
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const isExpired = job.applicationDeadline
    ? new Date(job.applicationDeadline).getTime() < Date.now()
    : false
  const isClosed = job.status === 'closed' || job.status === 'expired'
  const canApply = !isExpired && !isClosed
  const daysLeft = getDaysLeft(job.applicationDeadline)
  const salary = formatSalary(job)
  const postedAgo = getPostedAgo(job.createdAt)

  // Share URL — points back to this marketing page
  const shareUrl = `${MARKETING_URL}/job/${slug}`

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl)
    }
  }

  // JSON-LD JobPosting schema — injected inline so it travels with this client component
  // This is what makes the job eligible for Google for Jobs carousel
  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: [job.description, job.responsibilities, job.requirements]
      .filter(Boolean)
      .join('\n\n'),
    identifier: {
      '@type': 'PropertyValue',
      name: job.companyName,
      value: slug,
    },
    datePosted: new Date(job.createdAt).toISOString().split('T')[0],
    validThrough: job.applicationDeadline
      ? new Date(job.applicationDeadline).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.employmentType?.toUpperCase().replace(/-/g, '_') || 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companyName,
      sameAs: `https://kazicloud.com`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'KE',
      },
    },
    ...(job.workplaceType?.toLowerCase() === 'remote' && {
      jobLocationType: 'TELECOMMUTE',
    }),
    ...(job.salaryMin &&
      job.salaryMax && {
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: job.currency || 'KES',
          value: {
            '@type': 'QuantitativeValue',
            minValue: job.salaryMin,
            maxValue: job.salaryMax,
            unitText: 'MONTH',
          },
        },
      }),
    skills: job.requiredSkills?.join(', ') || '',
    experienceRequirements: formatExperienceLevel(job.experienceLevel),
    url: shareUrl,
    directApply: true,
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'Kenya',
    },
  }

  return (
    <>
      {/* Google for Jobs structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />

      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 pt-24 lg:pt-28 lg:pb-16 ${showFixedBar ? 'pb-24' : 'pb-8'}`}>
          {/* Breadcrumb */}
          <nav className="mb-4 sm:mb-6 flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 overflow-hidden">
            <Link href="/" className="hover:text-[#DC842C] transition-colors whitespace-nowrap">
              Home
            </Link>
            <span>/</span>
            <Link href="/jobs" className="hover:text-[#DC842C] transition-colors whitespace-nowrap">
              Jobs
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate min-w-0">{job.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ── Main content ──────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Job header card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                  {/* Company logo */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#DC842C] to-orange-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                    {job.employerProfile?.companyLogo ? (
                      <img
                        src={job.employerProfile.companyLogo}
                        alt={`${job.companyName} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      job.companyName.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="truncate">{job.companyName}</span>
                      <span title="Verified employer" className="flex-shrink-0">
                        <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500" />
                      </span>
                    </p>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      {job.title}
                    </h1>
                  </div>
                </div>

                {/* Meta row — pill style on mobile */}
                <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5">
                  <span className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 rounded-full px-3 py-1.5 sm:bg-transparent sm:px-0 sm:py-0">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 rounded-full px-3 py-1.5 sm:bg-transparent sm:px-0 sm:py-0">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="capitalize">{job.employmentType?.replace(/-/g, ' ')}</span>
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 rounded-full px-3 py-1.5 sm:bg-transparent sm:px-0 sm:py-0">
                    <WorkplaceIcon type={job.workplaceType} />
                    <span className="capitalize">{job.workplaceType}</span>
                  </span>
                  {job.experienceLevel && (
                    <span className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 rounded-full px-3 py-1.5 sm:bg-transparent sm:px-0 sm:py-0">
                      <Award className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {formatExperienceLevel(job.experienceLevel)}
                    </span>
                  )}
                  {daysLeft && (
                    <span className="flex items-center gap-1 sm:gap-1.5 bg-orange-50 text-orange-600 font-medium rounded-full px-2.5 py-1 sm:bg-transparent sm:px-0 sm:py-0">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      {daysLeft}d left
                    </span>
                  )}
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5">
                  <span className="px-3 py-1.5 text-xs font-semibold bg-orange-50 text-orange-700 rounded-full capitalize">
                    {job.employmentType?.replace(/-/g, ' ')}
                  </span>
                  {job.workplaceType?.toLowerCase() === 'remote' && (
                    <span className="px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 rounded-full">
                      Remote
                    </span>
                  )}
                  {job.department && (
                    <span className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                      {job.department}
                    </span>
                  )}
                  {Date.now() - job.createdAt < 48 * 60 * 60 * 1000 && (
                    <span className="px-3 py-1.5 text-xs font-bold text-red-500 rounded-full border border-red-200">
                      New
                    </span>
                  )}
                </div>

                {/* Action row */}
                <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Posted {postedAgo}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#DC842C] transition-colors px-3 py-1.5 border border-gray-200 rounded-lg hover:border-[#DC842C]/30"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>
                </div>
              </div>

              {/* About this role */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About this role</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                  {job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">What you'll do</h2>
                  <ul className="space-y-2 sm:space-y-3">
                    {job.responsibilities
                      .split('\n')
                      .filter((line: string) => line.trim())
                      .map((line: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 sm:gap-3">
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#DC842C] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm leading-relaxed">
                            {line.replace(/^[•\-]\s*/, '')}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">What we're looking for</h2>
                  <ul className="space-y-2 sm:space-y-3">
                    {job.requirements
                      .split('\n')
                      .filter((line: string) => line.trim())
                      .map((line: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 sm:gap-3">
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#DC842C] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm leading-relaxed">
                            {line.replace(/^[•\-]\s*/, '')}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Nice to have */}
              {job.niceToHave && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Nice to have</h2>
                  <ul className="space-y-2 sm:space-y-3">
                    {job.niceToHave
                      .split('\n')
                      .filter((line: string) => line.trim())
                      .map((line: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 sm:gap-3">
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm leading-relaxed">
                            {line.replace(/^[•\-]\s*/, '')}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Required skills */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Required skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gray-100 text-gray-800 text-xs sm:text-sm font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile inline apply card — sits in flow before Benefits, hides the fixed bar */}
              <div ref={inlineApplyRef} className="lg:hidden bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-3">Interested in this role?</h3>
                {salary !== 'To be discussed' && (
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xl font-bold text-gray-900 leading-none">{salary}</p>
                      {job.applicationDeadline && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    {daysLeft && (
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        {daysLeft}d left
                      </span>
                    )}
                  </div>
                )}
                {canApply ? (
                  <div className="space-y-2">
                    <Link
                      href={`${WEB_APP_URL}/sign-up`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-[#DC842C] text-white text-center font-semibold rounded-xl hover:bg-[#DC842C]/90 transition-colors text-sm"
                    >
                      Apply for this role
                    </Link>
                    <Link
                      href={`${WEB_APP_URL}/sign-in`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 border border-gray-200 text-gray-700 text-center font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      Already have an account? Sign in
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/jobs"
                    className="block w-full py-3 bg-gray-100 text-gray-700 text-center font-semibold rounded-xl text-sm"
                  >
                    Browse similar roles
                  </Link>
                )}
              </div>

              {/* Benefits */}
              {job.benefits && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Benefits</h2>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {job.benefits}
                  </p>
                </div>
              )}
            </div>

            {/* ── Sidebar (desktop only — mobile uses fixed bar) ─────────── */}
            <div className="hidden lg:block space-y-6">
              {/* Apply card — sticky */}
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                {/* Salary */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Salary</p>
                  <p className="text-2xl font-bold text-gray-900">{salary}</p>
                  {job.applicationDeadline && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {canApply ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Create a free Kazicloud account to apply. Takes 2 minutes.
                    </p>
                    <Link
                      href={`${WEB_APP_URL}/sign-up`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3.5 bg-[#DC842C] text-white text-center font-semibold rounded-xl hover:bg-[#DC842C]/90 transition-colors mb-3 text-sm"
                    >
                      Apply for this role
                    </Link>
                    <Link
                      href={`${WEB_APP_URL}/sign-in`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 border border-gray-200 text-gray-700 text-center font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      Already have an account? Sign in
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700 mb-1">Applications Closed</p>
                    <p className="text-xs text-gray-400">
                      This position is no longer accepting applications.
                    </p>
                    <Link
                      href="/jobs"
                      className="block mt-4 w-full py-3 bg-gray-100 text-gray-700 text-center font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                    >
                      Browse similar roles
                    </Link>
                  </div>
                )}
              </div>

              {/* Job summary card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Job summary</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Location</dt>
                    <dd className="font-medium text-gray-800 text-right">{job.location}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Job type</dt>
                    <dd className="font-medium text-gray-800 capitalize">
                      {job.employmentType?.replace(/-/g, ' ')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Workplace</dt>
                    <dd className="font-medium text-gray-800 capitalize">{job.workplaceType}</dd>
                  </div>
                  {job.experienceLevel && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Experience</dt>
                      <dd className="font-medium text-gray-800">
                        {formatExperienceLevel(job.experienceLevel)}
                      </dd>
                    </div>
                  )}
                  {job.positions && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Openings</dt>
                      <dd className="font-medium text-gray-800 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {job.positions}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Posted</dt>
                    <dd className="font-medium text-gray-800">{postedAgo}</dd>
                  </div>
                </dl>
              </div>

              {/* Back to jobs */}
              <Link
                href="/jobs"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#DC842C] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all jobs
              </Link>
            </div>
          </div>

          {/* Bottom CTA banner — also acts as the mobile apply section once in view */}
          <div ref={ctaRef} className="mt-8 sm:mt-12 mb-8 lg:mb-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
              Ready to apply? It's free.
            </h2>
            <p className="text-gray-300 mb-5 sm:mb-6 text-xs sm:text-sm max-w-lg mx-auto">
              Join 50,000+ professionals who found their next opportunity on Kazicloud. Sign up in 2
              minutes and apply instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`${WEB_APP_URL}/sign-up`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-[#DC842C] text-white font-semibold rounded-xl hover:bg-[#DC842C]/90 transition-colors text-sm"
              >
                Create Free Account
              </Link>
              <Link
                href="/jobs"
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm"
              >
                Browse More Jobs
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile fixed Apply bar — hidden when bottom CTA card is visible ── */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-xl px-4 py-3 safe-area-pb transition-transform duration-300 ${showFixedBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-lg mx-auto">
          {/* Salary + deadline row — only shown when salary is known */}
          {salary !== 'To be discussed' && (
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-base font-bold text-gray-900 leading-none">{salary}</p>
                {job.applicationDeadline && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
              {daysLeft && (
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  {daysLeft}d left
                </span>
              )}
            </div>
          )}
          {canApply ? (
            <div className="flex gap-2">
              <Link
                href={`${WEB_APP_URL}/sign-up`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#DC842C] text-white text-center font-semibold rounded-xl hover:bg-[#DC842C]/90 transition-colors text-sm"
              >
                Apply for this role
              </Link>
              <Link
                href={`${WEB_APP_URL}/sign-in`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 border border-gray-200 text-gray-700 text-center font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <Link
              href="/jobs"
              className="block w-full py-3 bg-gray-100 text-gray-700 text-center font-semibold rounded-xl text-sm"
            >
              Browse similar roles
            </Link>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
