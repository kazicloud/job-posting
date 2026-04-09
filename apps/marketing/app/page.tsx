import Hero from '@/components/sections/Hero'
import LogoBelt from '@/components/sections/LogoBelt'
import Features from '@/components/sections/Features'
import JobShowcase from '@/components/sections/JobShowcase'
import Process from '@/components/sections/Process'
import Proof from '@/components/sections/Proof'
import Final from '@/components/sections/Final'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <LogoBelt />
        <Features />
        <JobShowcase />
        <Process />
        <Proof />
        <Final />
      </main>
      <Footer />
    </>
  )
}
