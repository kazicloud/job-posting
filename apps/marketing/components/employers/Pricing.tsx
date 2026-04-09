import { Check } from 'lucide-react'

export default function Pricing() {
  const plans = [
    {
      id: 'free',
      name: 'Starter (Free Trial)',
      price: 0,
      period: '',
      tagline: 'Test the platform before committing',
      subtitle: 'Start hiring in minutes and experience how Kazicloud helps you identify top candidates instantly.',
      features: [
        '2 job postings (free)',
        '14-day listing duration per job',
        'Candidate ranking',
        'Custom screening questions',
        'Candidate analysis',
        'Social media sharing',
      ],
      cta: 'Start Free',
      href: '/signup?type=employer&plan=free',
      highlighted: false,
    },
    {
      id: 'basic',
      name: 'Basic (Pay As You Hire)',
      price: 3500,
      period: '/job',
      tagline: 'Ideal for urgent or competitive roles',
      subtitle: 'Post a job and let our system automatically rank and highlight your best candidates.',
      features: [
        '1 job posting (30 days)',
        'Candidate ranking',
        'Custom screening questions',
        'Candidate analysis',
        'Social media sharing',
        'WhatsApp job channels',
      ],
      cta: 'Choose Plan',
      href: '/signup?type=employer&plan=basic',
      highlighted: false,
    },
    {
      id: 'growth',
      name: 'Growth (Save More)',
      price: 7500,
      period: '/month',
      tagline: 'Best for SMEs with consistent hiring',
      subtitle: 'Hire smarter every month while saving over 40% compared to Basic.',
      features: [
        'Up to 5 job postings per month',
        '30-day listing duration',
        'Candidate ranking',
        'Custom screening questions',
        'Candidate analysis',
        'Social media sharing',
      ],
      cta: 'Choose Plan',
      href: '/signup?type=employer&plan=growth',
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise (Unlimited)',
      price: 15000,
      period: '/month',
      tagline: 'Best for high-volume hiring',
      subtitle: 'Post as many jobs as you need while our system helps you focus on qualified candidates.',
      features: [
        'Unlimited job postings',
        '30-day listing duration',
        'Priority listing visibility',
        'Candidate ranking',
        'Custom screening questions',
        'Social media sharing',
      ],
      cta: 'Choose Plan',
      href: '/signup?type=employer&plan=enterprise',
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-text-primary mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-text-secondary">
            Choose the plan that fits your hiring needs
          </p>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl p-6 flex flex-col h-full border-2 ${
                plan.highlighted
                  ? 'border-brand-orange shadow-xl'
                  : 'border-border hover:border-brand-orange/50 transition-colors'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-orange text-white text-xs font-medium">
                  Most Popular
                </div>
              )}

              <div className="flex-1">
                <div className="mb-4">
                  <h4 className="font-bold text-lg text-text-primary mb-1">{plan.name}</h4>
                  <p className="text-xs text-text-secondary mb-3">{plan.tagline}</p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-text-primary">
                      KES {plan.price.toLocaleString()}
                    </span>
                    <span className="text-text-muted text-sm ml-1">{plan.period}</span>
                  </div>
                </div>

                <p className="text-xs text-text-secondary mb-4 leading-relaxed">{plan.subtitle}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-text-primary mb-3">What's included:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-text-secondary">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <a
                href={plan.href}
                className={`block w-full py-3 text-center rounded-lg font-semibold transition-colors text-sm mt-auto ${
                  plan.highlighted
                    ? 'bg-brand-orange text-white hover:bg-brand-orange/90'
                    : 'bg-text-primary text-white hover:bg-brand-orange'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
