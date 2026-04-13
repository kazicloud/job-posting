import Link from 'next/link'
import HeroCanvas from './HeroCanvas'
import HeroSearch from './HeroSearch'
import { ConvexClientProvider } from '@/providers/ConvexClientProvider'

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 sm:pt-24">
      <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/home/hero-logo.png)', backgroundRepeat: 'repeat', backgroundSize: 'auto', filter: 'blur(2px)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-white" />
      <HeroCanvas />

      <div className="container-custom relative z-10 py-16 sm:py-24 lg:py-32 pb-4 sm:pb-24 lg:pb-32">
        {/* Mobile: Wall hanging image - absolute positioned top right */}
        <div className="lg:hidden absolute top-16 right-2 w-28 h-36 transform rotate-6 hover:rotate-3 transition-transform duration-300 z-0">
          <div className="relative w-full h-full">
            {/* Hanging wire */}
            <div className="absolute -top-3 left-1/2 w-0.5 h-3 bg-text-muted/30"></div>
            <div className="absolute -top-5 left-1/2 w-2 h-2 rounded-full bg-text-muted/40 -translate-x-1/2"></div>
            
            <div className="w-full h-full rounded-lg overflow-hidden border border-neutral-secondary shadow-lg">
              <img
                src="/images/home/interview.webp"
                alt="Interview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 sm:space-y-8 relative z-10">

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]">
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

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl">
              A recruitment platform built for the modern workforce. Connect with opportunities 
              that match your ambitions, or find talent that drives your vision forward.
            </p>

            {/* Search Bar */}
            <ConvexClientProvider>
              <HeroSearch />
            </ConvexClientProvider>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href={`${WEB_APP_URL}/sign-up`}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-brand-orange text-white text-sm sm:text-base font-medium overflow-hidden text-center"
              >
                <span className="relative z-10">Start Your Journey</span>
                <div className="absolute inset-0 bg-brand-orange transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Link>
              <Link
                href="/job-seekers"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-text-primary text-text-primary text-sm sm:text-base font-medium hover:bg-text-primary hover:text-white transition-colors duration-300 text-center"
              >
                Explore Opportunities
              </Link>
            </div>

            {/* Desktop: Third job card below buttons */}
            <div className="hidden lg:block mt-4">
              <div className="relative transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                {/* Tape effect at top */}
                <div className="absolute -top-2 left-12 w-16 h-6 bg-yellow-100/60 transform -rotate-12 shadow-sm"></div>
                
                <div className="bg-white rounded-lg p-5 shadow-xl border border-border max-w-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-orange/20 rounded-full overflow-hidden">
                      <img
                        src="/images/home/company-logo3.avif"
                        alt="Company logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Virtual Assistant</div>
                      <div className="text-xs text-text-muted">Signal Inc.</div>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Remote • Contract • $80k-$110k
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative aspect-square max-w-md mx-auto lg:max-w-none">
              {/* Mobile: Scattered job cards */}
              <div className="lg:hidden relative min-h-[220px]">
                {/* Card 1 - Top center-right */}
                <div className="absolute top-0 right-8 bg-white rounded-lg p-3 shadow-lg border border-border w-[170px] transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-brand-orange/10 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src="/images/home/company-logo1.webp"
                        alt="Company logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Senior Developer</div>
                      <div className="text-[10px] text-text-muted truncate">TechCorp</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-text-secondary">Hybrid • $120k+</div>
                </div>

                {/* Card 2 - Middle left */}
                <div className="absolute top-24 left-2 bg-white rounded-lg p-3 shadow-lg border border-border w-[160px] transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-text-primary/10 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src="/images/home/company-logo2.jpg"
                        alt="Company logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Marketing Manager</div>
                      <div className="text-[10px] text-text-muted truncate">DesignHub</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-text-secondary">Onsite • $90k+</div>
                </div>

                {/* Card 3 - Middle-bottom right */}
                <div className="absolute top-32 right-4 bg-white rounded-lg p-3 shadow-lg border border-border w-[165px] transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-brand-orange/20 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src="/images/home/company-logo3.avif"
                        alt="Company logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Virtual Assistant</div>
                      <div className="text-[10px] text-text-muted truncate">Signal Inc</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-text-secondary">Remote • $80k+</div>
                </div>
              </div>

              {/* Desktop: Original layout with 3 cards */}
              <div className="hidden lg:block">
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
                {/* Card 1 - Push Pin Effect */}
                <div className="absolute top-20 left-0 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  {/* Push pin */}
                  <div className="absolute -top-2 right-6 z-10">
                    {/* Pin head */}
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange/80 shadow-lg"></div>
                    {/* Pin needle */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-gray-400"></div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-xl border border-border max-w-xs">
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
                </div>

                {/* Card 2 - Sticky Note Style */}
                <div className="absolute bottom-20 right-0 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-brand-orange/10 rounded-lg p-6 shadow-lg border-t-8 border-brand-orange/30 max-w-xs relative">
                    {/* Stronger bottom shadow for sticky effect */}
                    <div className="absolute bottom-0 left-4 right-4 h-1 bg-black/20 blur-sm"></div>
                    
                    {/* More visible corner curl */}
                    <div className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden">
                      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-brand-orange to-gray-300 transform rotate-45 origin-bottom-right shadow-inner"></div>
                    </div>
                    
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
        </div>
      </div>
    </section>
  )
}
