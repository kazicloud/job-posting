import { FileText, Users, MessageSquare, CheckCircle } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Post Your Job',
      description: 'Create a listing in minutes.',
      time: '5 min',
    },
    {
      number: '02',
      icon: Users,
      title: 'Get Matches',
      description: 'AI finds qualified candidates.',
      time: '24 hrs',
    },
    {
      number: '03',
      icon: MessageSquare,
      title: 'Interview',
      description: 'Message and schedule interviews.',
      time: '1-2 weeks',
    },
    {
      number: '04',
      icon: CheckCircle,
      title: 'Hire',
      description: 'Send offers and onboard.',
      time: '1 day',
    },
  ]

  return (
    <section id="how-it-works" className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="w-16 h-1 bg-brand-orange mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-text-primary mb-3">
            How it works
          </h2>
          <p className="text-lg text-text-secondary">
            From posting to hiring in four steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl p-6 h-full border border-border hover:border-brand-orange transition-colors">
                <div className="text-xs font-mono text-text-muted mb-3">{step.number}</div>
                <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-brand-orange" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                  {step.description}
                </p>
                <div className="text-xs text-brand-orange font-medium">
                  ⏱ {step.time}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
