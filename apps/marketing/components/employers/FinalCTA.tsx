import { ArrowRight } from 'lucide-react'

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
            Ready to hire
            <br />
            top talent?
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join 3,000+ companies who have transformed their hiring through Kazicloud
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="/signup?type=employer"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-lg bg-brand-orange text-white font-bold text-lg hover:bg-white hover:text-text-primary transition-colors"
            >
              Post Your First Job
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-lg border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-text-primary transition-colors"
            >
              Talk to Sales
            </a>
          </div>

          <div className="text-sm text-white/70">
            14-day free trial • No credit card required • Cancel anytime
          </div>
        </div>
      </div>
    </section>
  )
}
