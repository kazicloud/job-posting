'use client'

export default function Features() {
  const features = [
    {
      title: 'Profile Builder',
      description: 'Create a comprehensive profile that showcases your skills, experience, and career aspirations. Our guided builder makes it easy.',
      image: '/images/job-seekers/profile-builder.jpg',
    },
    {
      title: 'Job Recommendations',
      description: 'Get personalized job recommendations based on your profile, preferences, and career goals. New matches delivered daily.',
      image: '/images/job-seekers/recommendations.jpg',
    },
    {
      title: 'Application Tracking',
      description: 'Track all your applications in one place. See which employers viewed your profile and get real-time status updates.',
      image: '/images/job-seekers/tracking.jpg',
    },
    {
      title: 'Salary Insights',
      description: 'Access comprehensive salary data for your role and location. Know your worth and negotiate with confidence.',
      image: '/images/job-seekers/salary.jpg',
    },
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-text-primary mb-4">
            Powerful features to accelerate your search
          </h2>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-16 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="aspect-[4/3] bg-neutral-secondary border border-border overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="w-12 h-1 bg-brand-orange mb-6" />
                <h3 className="text-3xl font-bold text-text-primary mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
