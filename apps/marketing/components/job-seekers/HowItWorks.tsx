import { UserPlus, Search, Send, Briefcase } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Build a profile in minutes. Add your experience, skills, and what you\'re looking for.',
    },
    {
      number: '02',
      icon: Search,
      title: 'Get Matched',
      description: 'Our algorithm finds jobs that match your profile. Browse personalized recommendations.',
    },
    {
      number: '03',
      icon: Send,
      title: 'Apply Instantly',
      description: 'One-click applications. No repetitive forms. Your profile is your resume.',
    },
    {
      number: '04',
      icon: Briefcase,
      title: 'Land the Job',
      description: 'Connect with employers, schedule interviews, and negotiate offers—all in one place.',
    },
  ]

  return (
    <section className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-brand-orange mx-auto mb-6" />
          <h2 className="text-5xl font-bold text-text-primary mb-4">
            How it works
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            From profile to paycheck in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-lg p-8 h-full border border-border hover:border-brand-orange transition-colors">
                <div className="text-sm font-mono text-text-muted mb-4">{step.number}</div>
                <div className="w-12 h-12 bg-brand-orange/10 flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
