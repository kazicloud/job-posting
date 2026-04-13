export default function AboutHero() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* Background Image with Orange Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/about/hero-bg.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/80 via-brand-orange/70 to-white/60" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block rounded-lg px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-4">
            About Kazicloud
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            We're changing how people find work
          </h1>

          <p className="text-base text-white/90 leading-relaxed">
            Kazicloud connects talented professionals with companies that value their skills. 
            No gimmicks, no gatekeepers—just real opportunities.
          </p>
        </div>
      </div>
    </section>
  )
}
