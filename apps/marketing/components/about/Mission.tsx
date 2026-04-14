'use client'

export default function Mission() {
  return (
    <section className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-12 h-1 bg-brand-orange mb-4" />
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Our mission
            </h2>
            <p className="text-base text-text-secondary leading-relaxed mb-4">
              We believe finding work shouldn't be complicated. Every professional deserves access to opportunities that match their skills and ambitions.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              That's why we built Kazicloud—a platform that cuts through the noise, verifies every opportunity, and connects people with jobs they'll actually love.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-white rounded-xl border border-border overflow-hidden shadow-lg">
              <img
                src="/images/about/team1.jpeg"
                alt="Our mission"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/about/mission.jpg'
                }}
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-4 border-brand-orange rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
