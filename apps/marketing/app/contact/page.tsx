import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactHero from '@/components/contact/Hero'
import ContactForm from '@/components/contact/ContactForm'
import ContactInfo from '@/components/contact/ContactInfo'
import FAQ from '@/components/contact/FAQ'

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <ContactHero />
        <div className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-16">
              <ContactForm />
              <ContactInfo />
            </div>
          </div>
        </div>
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
