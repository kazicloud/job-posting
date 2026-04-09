import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import EmployersHero from '@/components/employers/Hero'
import Benefits from '@/components/employers/Benefits'
import HowItWorks from '@/components/employers/HowItWorks'
import Pricing from '@/components/employers/Pricing'
import SuccessMetrics from '@/components/employers/SuccessMetrics'
import Features from '@/components/employers/Features'
import FinalCTA from '@/components/employers/FinalCTA'

export default function EmployersPage() {
  return (
    <>
      <Header />
      <main>
        <EmployersHero />
        <SuccessMetrics />
        <Benefits />
        <HowItWorks />
        <Features />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
