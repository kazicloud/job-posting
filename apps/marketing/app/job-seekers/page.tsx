'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Check, Download, Users, Target, TrendingUp, Star } from 'lucide-react'

export default function JobSeekersPage() {
  const services = [
    {
      id: 1,
      title: 'Download Your ATS-Optimized CV',
      price: '$1',
      priceKes: 'KES ~150',
      badge: 'Instant & Affordable',
      bestFor: 'Candidates seeking a fast, professionally formatted CV tailored for local and international job opportunities—including remote roles.',
      features: [
        'Supported Formats: Kenya, US, UK, Canada, Australia, EU (Europass), and International Remote.',
        'ATS-friendly, recruiter-approved CV',
        'Country-specific formatting and standards',
      ],
      outcome: 'Apply confidently across borders and increase your chances of securing interviews—locally and internationally',
      cta: 'Download Now',
      icon: Download,
      popular: false,
    },
    {
      id: 2,
      title: 'CV Revamp – Premium Upgrade',
      price: 'KSh 3,000',
      priceKes: '',
      badge: 'Human Input for Maximum Impact',
      bestFor: 'Candidates who want a human-curated CV tailored for your top roles',
      features: [
        'Two fully curated CVs for your top 2 target roles',
        'Personalized wording and achievement framing',
        'Optimized for ATS and recruiter review',
      ],
      outcome: 'Maximizes your chances of being shortlisted for your best opportunities',
      cta: 'Upgrade to CV Revamp',
      icon: Star,
      popular: true,
    },
    {
      id: 3,
      title: 'Job Search Support',
      price: 'KSh 5,000',
      priceKes: '',
      badge: 'Hands-free job search',
      bestFor: 'Busy professionals seeking targeted job opportunities and hands-free job search support',
      features: [
        'We actively identify and curate roles that match your skills, experience, and career goals',
        'We position and market you to relevant hiring managers and opportunities',
        'We guide and support your application strategy to improve interview conversion rates',
        '(Registration Fee) + 50% of 1st Month Salary (Success Fee)',
      ],
      outcome: 'You secure employment faster through guided, structured job placement support',
      cta: 'Start Job Search Support',
      icon: Target,
      popular: false,
    },
  ]

  const programSessions = [
    {
      number: 1,
      title: 'Self-Assessment & Career Goal Setting',
      description: 'Identify your strengths, skills, and gaps. Clarify short- and long-term career goals.',
    },
    {
      number: 2,
      title: 'Resume & LinkedIn Profile Revamp',
      description: 'Create a tailored, ATS-optimized CV and revamp LinkedIn profile for maximum visibility.',
    },
    {
      number: 3,
      title: 'Interview Preparation',
      description: 'Role-specific mock interviews using STAR/CAR frameworks for confident responses.',
    },
    {
      number: 4,
      title: 'Job Search & Networking Strategies',
      description: 'Strategic networking tactics and advanced job search methods for faster results.',
    },
    {
      number: 5,
      title: 'Salary Negotiation & Promotion Strategy',
      description: 'Market value understanding and negotiation tactics for offers or promotions.',
    },
    {
      number: 6,
      title: 'Job Search Assistance',
      description: 'Identify best matching jobs with application strategy and recruiter engagement.',
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-secondary">
        {/* Hero Section */}
        <section className="relative bg-white border-b border-border pt-24 pb-16 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/job-seekers/hero-bg.webp"
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-brand-orange/60" />
          </div>

          <div className="container-custom relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold text-white mb-6">
                  Take Control of Your Career—
                  <br />
                  <span className="text-white/90">Fast, Smart, and Effective</span>
                </h1>
                <p className="text-base text-white/90 mb-8">
                  From a quick CV download to our premium Career Success Program, our services are designed to get you noticed, prepared, and hired for the roles you want.
                </p>
                <a
                  href="/jobs"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-orange font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-lg"
                >
                  Explore Opportunities
                  <span className="text-xl">→</span>
                </a>
              </div>
              <div className="relative">
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl -z-10" />
                <div className="absolute -top-6 -right-6 w-24 h-24 border-4 border-white/20 rounded-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {services.map((service) => {
                const IconComponent = service.icon
                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-lg border p-8 relative flex flex-col ${
                      service.popular ? 'border-brand-orange shadow-lg' : 'border-border'
                    }`}
                  >
                    {service.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-orange text-white text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-brand-orange" />
                      </div>
                      <div className="text-sm font-medium text-brand-orange">{service.badge}</div>
                    </div>

                    <h3 className="text-xl font-bold text-text-primary mb-2">{service.title}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-text-primary">{service.price}</span>
                      {service.priceKes && (
                        <span className="text-text-secondary ml-1">{service.priceKes}</span>
                      )}
                    </div>

                    <p className="text-sm text-text-secondary mb-4">
                      <strong>Best for:</strong> {service.bestFor}
                    </p>

                    <div className="mb-6 flex-grow">
                      <p className="text-sm font-medium text-text-primary mb-3">What you get:</p>
                      <ul className="space-y-2">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6 p-4 bg-neutral-secondary rounded-lg">
                      <p className="text-sm font-medium text-text-primary mb-1">Outcome:</p>
                      <p className="text-sm text-text-secondary">{service.outcome}</p>
                    </div>

                    <button className="w-full py-3 rounded-lg bg-brand-orange text-white font-medium hover:bg-text-primary transition-colors mt-auto">
                      <a href={`${process.env.NEXT_PUBLIC_WEB_APP_URL}/dashboard/help`} className="block">
                        {service.cta}
                      </a>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Career Success Program */}
        <section id="career-program" className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="order-2 lg:order-1">
                <img
                  src="/images/job-seekers/coaching.jpg"
                  alt="Career coaching session"
                  className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-orange/10 text-brand-orange text-sm font-medium mb-4">
                  <TrendingUp className="w-4 h-4" />
                  Premium Engagement
                </div>
                <h2 className="text-4xl font-bold text-text-primary mb-4">
                  Career Success Program
                </h2>
                <div className="text-2xl font-bold text-brand-orange mb-2">
                  KSh 3,000 per session (1 hour, scaleable)
                </div>
                <p className="text-text-secondary mb-6">
                  Minimum: 3 sessions (choose as needed)
                </p>
                <p className="text-lg text-text-secondary">
                  <strong>Best for:</strong> Candidates who want to secure a new job, get a promotion, or negotiate a higher salary
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-neutral-secondary rounded-lg p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-4">Why this program works</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-text-secondary">
                      <Check className="w-4 h-4 text-green-600" />
                      Modular, outcome-focused, hands-on
                    </li>
                    <li className="flex items-center gap-2 text-text-secondary">
                      <Check className="w-4 h-4 text-green-600" />
                      Covers all critical steps from self-assessment to offer negotiation
                    </li>
                    <li className="flex items-center gap-2 text-text-secondary">
                      <Check className="w-4 h-4 text-green-600" />
                      Each session is practical, actionable, and career-result driven
                    </li>
                  </ul>
                </div>

                <div className="bg-brand-orange/5 rounded-lg p-6 border border-brand-orange/20">
                  <h3 className="text-xl font-bold text-text-primary mb-4">Program Outcomes</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-text-secondary">
                      <Check className="w-4 h-4 text-brand-orange" />
                      Professionally optimized CV + LinkedIn profile
                    </li>
                    <li className="flex items-center gap-2 text-text-secondary">
                      <Check className="w-4 h-4 text-brand-orange" />
                      Clear career direction and strategy
                    </li>
                    <li className="flex items-center gap-2 text-text-secondary">
                      <Check className="w-4 h-4 text-brand-orange" />
                      Confidence to succeed in interviews and negotiations
                    </li>
                    <li className="flex items-center gap-2 text-text-secondary">
                      <Check className="w-4 h-4 text-brand-orange" />
                      Increased chances of landing a job, promotion, or salary increase
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-2xl font-bold text-text-primary mb-8 text-center">
                  Program Structure – 6 Core Sessions
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {programSessions.map((session) => (
                    <div key={session.number} className="flex gap-4 p-6 border border-border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {session.number}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary mb-2">{session.title}</h4>
                        <p className="text-sm text-text-secondary">{session.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center bg-neutral-secondary rounded-lg p-8">
                <h3 className="text-2xl font-bold text-text-primary mb-4">How it Works</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <div className="text-lg font-bold text-brand-orange mb-2">Pick Sessions</div>
                    <p className="text-sm text-text-secondary">Fully modular and flexible</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-brand-orange mb-2">KSh 3,000</div>
                    <p className="text-sm text-text-secondary">Per session</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-brand-orange mb-2">KSh 18,000</div>
                    <p className="text-sm text-text-secondary">Complete 6-session program</p>
                  </div>
                </div>
                <p className="text-text-secondary mb-6">Flexible scheduling to fit your pace</p>
                <a
                  href={`${process.env.NEXT_PUBLIC_WEB_APP_URL}/dashboard/help`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-brand-orange text-white font-bold text-lg hover:bg-text-primary transition-colors"
                >
                  Start Your Career Success Journey
                </a>
                <p className="text-sm text-text-secondary mt-4">
                  Start with min 3 sessions or commit to the full program<br />
                  Focused entirely on results: job offers, salary growth, and promotions
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
