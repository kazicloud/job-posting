'use client'

import { ArrowRight, CheckCircle } from 'lucide-react'

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://app.kazicloud.com'

export default function EmployersHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Image with White Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/employers/hero-bg.png"
          alt="Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/employers/hero-bg.jpg'
          }}
        />
        <div className="absolute inset-0 bg-white/90" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-block rounded-lg px-4 py-2 bg-brand-orange/10 text-brand-orange text-sm font-medium mb-6">
              Trusted by 3,000+ companies
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
              Hire top talent
              <br />
              <span className="text-brand-orange">50% faster</span>
            </h1>

            <p className="text-base text-text-secondary mb-8 leading-relaxed">
              Access 50,000+ pre-screened candidates. Post jobs, get matched with qualified talent, and build your dream team.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href={`${WEB_APP_URL}/sign-in`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-orange text-white font-bold text-lg hover:bg-text-primary transition-colors"
              >
                Post a Job
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-text-primary text-text-primary font-bold text-lg hover:bg-text-primary hover:text-white transition-colors"
              >
                See How It Works
              </a>
            </div>

            <div className="flex flex-col gap-3 text-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-orange" />
                <span>Free to post your first job</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-orange" />
                <span>Get matched candidates in 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-orange" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="relative">
              {/* Main image */}
              <div className="aspect-[4/3] bg-neutral-secondary border-4 border-white shadow-2xl rounded-xl overflow-hidden">
                <img
                  src="/images/employers/hero-screen.png"
                  alt="Employer dashboard"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/employers/hero-screen.jpg'
                  }}
                />
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg p-6 shadow-2xl border border-border">
                <div className="text-4xl font-bold text-brand-orange mb-1">2.3 days</div>
                <div className="text-sm text-text-muted">Average time-to-hire</div>
              </div>

              {/* Decorative element */}
              <div className="absolute -top-4 -right-4 w-32 h-32 border-4 border-brand-orange rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
