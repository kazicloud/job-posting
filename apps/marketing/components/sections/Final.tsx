'use client'

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://app.kazicloud.com'

export default function Final() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-secondary via-white to-neutral-secondary">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[500px] lg:min-h-[600px]">
          {/* Left - Success Stories Collage */}
          <div className="relative py-12 lg:py-24 hidden lg:block">
            <div className="relative h-full">
              {/* Main large image */}
              <div className="absolute top-0 left-0 w-64 h-80 border-4 border-white shadow-xl overflow-hidden">
                <img
                  src="/images/cta/success-1.jpg"
                  alt="Success story"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Floating stat card */}
              <div className="absolute top-32 left-48 bg-white rounded-lg p-6 shadow-2xl rounded-lg border border-border z-10">
                <div className="text-4xl font-bold text-brand-orange mb-1">12K+</div>
                <div className="text-sm text-text-muted">Jobs filled</div>
              </div>

              {/* Second image */}
              <div className="absolute bottom-32 left-12 w-56 h-64 border-4 border-white shadow-xl overflow-hidden">
                <img
                  src="/images/cta/success-2.avif"
                  alt="Success story"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Floating stat card 2 */}
              <div className="absolute bottom-16 right-0 bg-brand-orange text-white p-6 shadow-2xl rounded-lg">
                <div className="text-4xl font-bold mb-1">94%</div>
                <div className="text-sm opacity-90">Success rate</div>
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-8 right-12 w-32 h-28 bg-brand-orange/10 rounded-lg shadow-xl" />
            </div>
          </div>

          {/* Right - Dual CTA */}
          <div className="flex items-center py-12 lg:py-24 lg:pl-16">
            <div className="w-full">
              <div className="w-16 h-1 bg-brand-orange mb-6" />
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-text-primary mb-4 sm:mb-6 leading-tight">
                Ready to make
                <br />
                your next move?
              </h2>
              
              <p className="text-sm sm:text-base text-text-secondary mb-8 sm:mb-12 max-w-lg">
                Join thousands of professionals and companies who have found success through Kazicloud.
              </p>

              {/* Dual CTAs */}
              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                <a
                  href={`${WEB_APP_URL}/sign-up?role=job_seeker`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 rounded-lg bg-text-primary text-white hover:bg-brand-orange transition-colors"
                >
                  <div>
                    <div className="font-bold text-base sm:text-lg">I'm looking for work</div>
                    <div className="text-xs sm:text-sm opacity-90">Find your next opportunity</div>
                  </div>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>

                <a
                  href={`${WEB_APP_URL}/sign-up?role=employer`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-white transition-colors rounded-lg"
                >
                  <div>
                    <div className="font-bold text-base sm:text-lg">I'm hiring</div>
                    <div className="text-xs sm:text-sm opacity-75">Find top talent for your team</div>
                  </div>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-xs sm:text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free to join
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-brand-orange/5 rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-brand-orange/5 rounded-full -translate-x-1/2 translate-y-1/2" />
    </section>
  )
}
