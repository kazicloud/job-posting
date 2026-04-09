import { Check } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="section-padding bg-gradient-to-br from-text-primary to-text-primary/90 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to find your
            <br />
            next opportunity?
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join 50,000+ professionals who have transformed their careers through KaziCloud
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="/signup"
              className="px-10 py-5 rounded-lg bg-brand-orange text-white font-bold text-lg hover:bg-white hover:text-text-primary transition-colors inline-flex items-center justify-center gap-2"
            >
              Create Free Account
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/jobs"
              className="px-10 py-5 rounded-lg border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-text-primary transition-colors"
            >
              Browse Jobs
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-brand-orange" />
              Free forever
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-brand-orange" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-brand-orange" />
              Set up in 5 minutes
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
