import { Users, Target, Zap, Shield, TrendingUp, Award } from 'lucide-react'

export default function Benefits() {
  const benefits = [
    {
      icon: Users,
      title: 'Pre-Screened Talent',
      description: 'Verified professionals ready to work.',
    },
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'AI matches jobs with qualified candidates.',
    },
    {
      icon: Zap,
      title: 'Hire Faster',
      description: 'Average time-to-hire: 2.3 days.',
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'Authentic credentials you can trust.',
    },
    {
      icon: TrendingUp,
      title: 'Better Retention',
      description: '85% one-year retention rate.',
    },
    {
      icon: Award,
      title: 'Dedicated Support',
      description: 'Expert help throughout hiring.',
    },
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-text-primary mb-3">
            Why companies choose Kazicloud
          </h2>
          <p className="text-lg text-text-secondary">
            Everything you need to find and hire top talent
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="group p-6 rounded-xl border border-border hover:border-brand-orange hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-brand-orange/10 group-hover:bg-brand-orange rounded-lg flex items-center justify-center mb-4 transition-colors">
                <benefit.icon className="w-6 h-6 text-brand-orange group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-text-secondary">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
