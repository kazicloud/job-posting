import Link from 'next/link'
import HeroCanvas from './HeroCanvas'
import HeroSearch from './HeroSearch'
import { ConvexClientProvider } from '@/providers/ConvexClientProvider'

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-orange/10 to-white">
      <HeroCanvas />

      <div className="container-custom relative z-10 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">

            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1]">
              Where careers
              <br />
              <span className="relative inline-block">
                take flight
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="12"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 2 100 2 150 6C200 10 250 10 298 6"
                    stroke="#DC842C"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
              A recruitment platform built for the modern workforce. Connect with opportunities 
              that match your ambitions, or find talent that drives your vision forward.
            </p>

            {/* Search Bar */}
            <ConvexClientProvider>
              <HeroSearch />
            </ConvexClientProvider>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`${WEB_APP_URL}/sign-up`}
                className="group relative px-8 py-4 rounded-lg bg-text-primary text-white font-medium overflow-hidden"
              >
                <span className="relative z-10">Start Your Journey</span>
                <div className="absolute inset-0 bg-brand-orange transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Link>
              <Link
                href="/job-seekers"
                className="px-8 py-4 rounded-lg border-2 border-text-primary text-text-primary font-medium hover:bg-text-primary hover:text-white transition-colors duration-300"
              >
                Explore Opportunities
              </Link>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square">
              {/* Geometric shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-xl overflow-hidden border-2 border-brand-orange/20">
                <img
                  src="/images/home/interview.webp"
                  alt="Interview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-12 right-12 w-64 h-64 rounded-lg bg-brand-orange/5" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-lg overflow-hidden border-2 border-text-primary/10">
                <img
                  src="/images/home/interview2.avif"
                  alt="Interview"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content cards */}
              <div className="absolute top-20 left-0 bg-white rounded-lg p-6 shadow-lg rounded-lg border border-border max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-full overflow-hidden">
                    <img
                      src="/images/home/company-logo1.webp"
                      alt="Company logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Senior Developer</div>
                    <div className="text-xs text-text-muted">TechCorp Inc.</div>
                  </div>
                </div>
                <div className="text-xs text-text-secondary">
                  Remote • Full-time • $120k-$180k
                </div>
              </div>

              <div className="absolute bottom-20 right-0 bg-white rounded-lg p-6 shadow-lg rounded-lg border border-border max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-text-primary/10 rounded-full overflow-hidden">
                    <img
                      src="/images/home/company-logo2.jpg"
                      alt="Company logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Marketing Manager</div>
                    <div className="text-xs text-text-muted">DesignHub</div>
                  </div>
                </div>
                <div className="text-xs text-text-secondary">
                  Hybrid • Full-time • $90k-$130k
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
