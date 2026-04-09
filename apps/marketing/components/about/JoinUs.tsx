import { ArrowRight } from 'lucide-react'

export default function JoinUs() {
  return (
    <section className="section-padding bg-text-primary text-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Join us on this journey
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Whether you're looking for work or looking to hire, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/job-seekers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-brand-orange text-white font-bold hover:bg-white hover:text-text-primary transition-colors"
            >
              Find Jobs
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/employers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-white text-white font-bold hover:bg-white hover:text-text-primary transition-colors"
            >
              Hire Talent
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
