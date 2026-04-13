export default function Values() {
  const values = [
    {
      color: 'orange',
      title: 'People First',
      subtitle: 'Inspired by Orange – Warmth & Happiness',
      description: 'We foster a supportive and fulfilling environment where our employees thrive. We believe that when people feel valued and inspired, they create extraordinary outcomes. At Kazicloud, happiness isn\'t a perk; it\'s part of our culture.',
      gradient: 'from-brand-orange/10 to-brand-orange/5',
      accentColor: 'bg-brand-orange',
      subtitleColor: 'text-brand-orange/80',
    },
    {
      color: 'black',
      title: 'Excellence with Integrity',
      subtitle: 'Inspired by Black – Authenticity & Unmatched Service',
      description: 'We are committed to delivering nothing short of excellence in every service we offer. Our strength lies in being real, reliable, and results-driven; building trust with our clients through unmatched professionalism and authenticity.',
      gradient: 'from-text-primary/70 to-text-primary/5',
      accentColor: 'bg-text-primary',
      subtitleColor: 'text-text-primary/70',
    },
    {
      color: 'white',
      title: 'Radical Transparency',
      subtitle: 'Inspired by White – Clarity & Honesty',
      description: 'We operate with openness, clarity, and honesty; from internal decisions to client engagements. At Kazicloud, transparency is more than a policy; it\'s a promise that defines how we lead, communicate, and grow.',
      gradient: 'from-neutral-secondary to-white',
      accentColor: 'bg-border',
      subtitleColor: 'text-text-secondary',
    },
  ]

  return (
    <section className="section-padding bg-gradient-to-b from-white to-neutral-secondary">
      <div className="container-custom">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Our Core Values
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-3xl mx-auto">
            At Kazicloud, our values are the foundation of everything we do. Each one is inspired by our brand colors and reflects our commitment to our people, our clients, and the way we do business.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
          {values.map((value, index) => (
            <div 
              key={index} 
              className={`relative p-6 sm:p-8 lg:p-10 rounded-2xl bg-gradient-to-br ${value.gradient} border border-border hover:border-brand-orange transition-all duration-300 hover:shadow-xl group`}
            >
              {/* Accent bar */}
              <div className={`absolute left-0 top-8 bottom-8 w-1 ${value.accentColor} rounded-r-full`} />
              
              <div className="pl-4 sm:pl-6">
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                  {value.title}
                </h3>
                <p className={`text-xs sm:text-sm font-medium ${value.subtitleColor} mb-4 italic`}>
                  {value.subtitle}
                </p>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {value.description}
                </p>
              </div>

              {/* Decorative element */}
              <div className={`absolute top-6 right-6 w-16 h-16 sm:w-20 sm:h-20 ${value.accentColor} opacity-5 rounded-full group-hover:scale-110 transition-transform duration-300`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
