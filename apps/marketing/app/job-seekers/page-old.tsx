import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import JobSeekersHero from '@/components/job-seekers/Hero'
import HowItWorks from '@/components/job-seekers/HowItWorks'
import Benefits from '@/components/job-seekers/Benefits'
import JobCategories from '@/components/job-seekers/JobCategories'
import SuccessMetrics from '@/components/job-seekers/SuccessMetrics'
import SuccessStories from '@/components/job-seekers/SuccessStories'
import Features from '@/components/job-seekers/Features'
import FAQ from '@/components/job-seekers/FAQ'
import FinalCTA from '@/components/job-seekers/FinalCTA'

export default function JobSeekersPage() {
  return (
    <>
      <Header />
      <main>
        <JobSeekersHero />
        <SuccessMetrics />
        <HowItWorks />
        <Benefits />
        <JobCategories />
        <Features />
        <SuccessStories />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
