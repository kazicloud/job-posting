'use client'

export default function Process() {
  const steps = [
    {
      number: '01',
      title: 'Create Profile',
      description: 'Build a comprehensive profile that highlights your experience, skills, and career aspirations. Our system learns what makes you unique.',
      image: '/images/process/createprofilee-ani.png',
      points: ['Professional summary', 'Skills & certifications', 'Work history'],
    },
    {
      number: '02',
      title: 'Get Matched',
      description: 'Our intelligent system analyzes thousands of opportunities to find roles that align with your skills, experience, and career goals.',
      image: '/images/process/match-jobs.jpg',
      points: ['AI-powered matching', 'Personalized recommendations', 'Real-time alerts'],
    },
    {
      number: '03',
      title: 'Start Working',
      description: 'Connect directly with hiring managers, schedule interviews, and negotiate offers—all within the platform. We\'re with you every step.',
      image: '/images/process/job-connect.jpg',
      points: ['Direct messaging', 'Interview scheduling', 'Offer management'],
    },
  ]

  return (
    <section id="how-it-works" className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mb-20">
          <span className="text-sm font-mono text-brand-orange tracking-wider uppercase">
            How It Works
          </span>
          <h2 className="text-5xl font-bold mt-4 leading-tight">
            From application
            <br />
            to offer letter
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-px bg-border">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-lg p-12">
              {/* Image */}
              <div className="aspect-[4/3] bg-neutral-secondary mb-8 overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="text-sm font-mono text-text-muted mb-8">{step.number}</div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed mb-8">
                {step.description}
              </p>
              <div className="space-y-3">
                {step.points.map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-brand-orange" />
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
