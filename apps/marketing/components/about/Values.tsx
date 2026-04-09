import { Target, Users, Zap, Shield } from 'lucide-react'

export default function Values() {
  const values = [
    {
      icon: Target,
      title: 'Quality over quantity',
      description: 'Meaningful connections, not vanity metrics. Every job and candidate is verified.',
    },
    {
      icon: Users,
      title: 'People first',
      description: 'Technology serves people. We build tools that respect your time.',
    },
    {
      icon: Zap,
      title: 'Move fast',
      description: 'Hiring shouldn\'t take months. Streamlined process without sacrificing quality.',
    },
    {
      icon: Shield,
      title: 'Trust & transparency',
      description: 'No hidden fees, no fake listings. What you see is what you get.',
    },
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            Our values
          </h2>
          <p className="text-sm text-text-secondary">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div key={index} className="p-6 rounded-xl border border-border hover:border-brand-orange transition-colors">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-4">
                <value.icon className="w-6 h-6 text-brand-orange" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
