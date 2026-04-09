'use client'

export default function Team() {
  const team = [
    {
      name: 'David Omondi',
      role: 'Co-Founder & CEO',
      image: '/images/team/david.jpg',
      bio: 'Former tech recruiter who got tired of broken hiring processes.',
    },
    {
      name: 'Sarah Mwangi',
      role: 'Co-Founder & CTO',
      image: '/images/team/sarah.jpg',
      bio: 'Built matching algorithms at a Fortune 500 before starting KaziCloud.',
    },
    {
      name: 'James Kamau',
      role: 'Head of Product',
      image: '/images/team/james.jpg',
      bio: 'Spent 10 years designing tools that people actually want to use.',
    },
    {
      name: 'Linda Njeri',
      role: 'Head of Growth',
      image: '/images/team/linda.jpg',
      bio: 'Helped scale 3 startups from zero to millions of users.',
    },
  ]

  return (
    <section className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-text-primary mb-4">
            Meet the team
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            The people building the future of work
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-border rounded-lg">
              <div className="aspect-square bg-neutral-secondary mb-4 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-brand-orange font-medium mb-3">
                {member.role}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
