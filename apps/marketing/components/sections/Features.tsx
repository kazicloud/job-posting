'use client'

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://app.kazicloud.com'

export default function Features() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Image Collage */}
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Top Left - Large (pushed down) */}
              <div className="row-span-2 pt-4 sm:pt-8">
                <div className="aspect-[3/4] bg-neutral-secondary overflow-hidden border border-border rounded-lg">
                  <img
                    src="/images/features/team-collaboration2.jpg"
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Top Right */}
              <div>
                <div className="aspect-[4/3] bg-neutral-secondary overflow-hidden border border-border rounded-lg">
                  <img
                    src="/images/features/professional2-setting.webp"
                    alt="Professional meeting"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Bottom Right */}
              <div>
                <div className="aspect-[4/3] bg-neutral-secondary overflow-hidden border border-border rounded-lg">
                  <img
                    src="/images/features/workaction.jpg"
                    alt="Work in action"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6">
                Elevate Your Workforce,
                <br />
                Elevate Best Business
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                At Kazicloud, we understand that key to business success lies in having the right people on your team. That's why we're committed to connecting you with top-tier talent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-sm sm:text-base">Tailored Staffing Solutions</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-sm sm:text-base">Ongoing Support</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium">Streamlined Hiring Process</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium">Experienced Team</span>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href={`${WEB_APP_URL}/sign-up`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-lg bg-text-primary hover:bg-brand-orange text-white font-medium transition-colors inline-flex items-center gap-2"
              >
                JOIN OUR NETWORK
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
