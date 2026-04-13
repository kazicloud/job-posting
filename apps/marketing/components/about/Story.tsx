export default function Story() {
  return (
    <section className="section-padding relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #f7f9fc 0%, #ffffff 50%, #f7f9fc 100%)'
    }}>
      {/* Minimal Pattern Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle, #DC842C 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          opacity: 0.15
        }} />
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-6">
            How we started
          </h2>

          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              Kazicloud was born from frustration. Our founders spent months navigating broken job boards, fake listings, and endless applications that went nowhere.
            </p>

            <p>
              They realized the problem wasn't a lack of jobs or talent—it was the platforms connecting them. Most job boards prioritize quantity over quality.
            </p>

            <p>
              So in 2024, we built something different. A platform that verifies every company, screens every candidate, and uses smart matching to connect the right people with the right opportunities.
            </p>

            <p className="text-text-primary font-medium text-base">
              Today, we've helped 50,000+ professionals find meaningful work and 3,000+ companies build exceptional teams.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
