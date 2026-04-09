import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AboutHero from '@/components/about/Hero'
import Mission from '@/components/about/Mission'
import Story from '@/components/about/Story'
import Values from '@/components/about/Values'
import Team from '@/components/about/Team'
import JoinUs from '@/components/about/JoinUs'

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <AboutHero />
        <Mission />
        <Story />
        <Values />
        <JoinUs />
      </main>
      <Footer />
    </>
  )
}
