import { Target, Shield, Zap, TrendingUp, Bell, BarChart } from 'lucide-react'

export default function Benefits() {
  const benefits = [
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'AI-powered algorithm matches you with jobs that fit your skills and career goals.',
    },
    {
      icon: Shield,
      title: 'Verified Employers',
      description: 'Every company is verified. Apply with confidence knowing opportunities are legitimate.',
    },
    {
      icon: Zap,
      title: 'Quick Applications',
      description: 'Apply to multiple jobs in seconds. Your profile is your resume.',
    },
    {
      icon: TrendingUp,
      title: 'Salary Transparency',
      description: 'See salary ranges upfront. No more guessing or wasting time.',
    },
    {
      icon: Bell,
      title: 'Real-Time Alerts',
      description: 'Get notified instantly when employers view your profile or respond to applications.',
    },
    {
      icon: BarChart,
      title: 'Career Insights',
      description: 'Access market data, salary benchmarks, and industry trends to make informed decisions.',
    },
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-text-primary mb-4">
            Why job seekers choose KaziCloud
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Everything you need to find and land your next opportunity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="group p-8 border border-border hover:border-brand-orange hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-brand-orange/10 group-hover:bg-brand-orange flex items-center justify-center mb-6 transition-colors">
                <benefit.icon className="w-7 h-7 text-brand-orange group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {benefit.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
