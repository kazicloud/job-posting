'use client'

export default function SuccessStories() {
  const stories = [
    {
      name: 'Sarah Mwangi',
      image: '/images/testimonials/sarah.jpg',
      avatar: 'SM',
      before: {
        role: 'Junior Designer',
        company: 'Small Agency',
        salary: '$35K',
      },
      after: {
        role: 'Senior Product Designer',
        company: 'DesignCo',
        salary: '$85K',
      },
      quote: 'Kazicloud helped me find a role that valued my skills. The salary transparency feature gave me confidence to negotiate.',
      timeframe: '3 weeks',
    },
    {
      name: 'James Omondi',
      image: '/images/testimonials/james.jpg',
      avatar: 'JO',
      before: {
        role: 'Support Engineer',
        company: 'Local Startup',
        salary: '$42K',
      },
      after: {
        role: 'Full Stack Developer',
        company: 'TechHub',
        salary: '$95K',
      },
      quote: 'The matching algorithm actually works. Every job recommendation was relevant to my skills and career goals.',
      timeframe: '2 weeks',
    },
    {
      name: 'Priya Patel',
      image: '/images/testimonials/priya.jpg',
      avatar: 'PP',
      before: {
        role: 'Data Analyst',
        company: 'Finance Corp',
        salary: '$55K',
      },
      after: {
        role: 'Senior Data Scientist',
        company: 'DataFlow',
        salary: '$120K',
      },
      quote: 'Found my dream remote job with a 118% salary increase. The platform made the entire process seamless.',
      timeframe: '4 weeks',
    },
  ]

  return (
    <section className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-text-primary mb-4">
            Real people, real results
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            See how professionals transformed their careers through Kazicloud
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div key={index} className="bg-white rounded-lg p-8 border border-border rounded-lg">
              {/* Profile */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-neutral-secondary overflow-hidden rounded-full">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-text-primary font-bold">${story.avatar}</div>`;
                      }
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">{story.name}</h3>
                  <p className="text-sm text-text-muted">Found job in {story.timeframe}</p>
                </div>
              </div>

              {/* Before/After */}
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Before</div>
                  <div className="text-sm">
                    <div className="font-medium text-text-primary">{story.before.role}</div>
                    <div className="text-text-muted">{story.before.company} • {story.before.salary}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-brand-orange uppercase tracking-wider mb-2">After</div>
                  <div className="text-sm">
                    <div className="font-bold text-text-primary">{story.after.role}</div>
                    <div className="text-text-muted">{story.after.company} • <span className="text-brand-orange font-bold">{story.after.salary}</span></div>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <p className="text-text-secondary italic leading-relaxed">
                "{story.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
