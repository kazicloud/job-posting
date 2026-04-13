'use client'

import { useState, useEffect } from 'react'

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(1)

  const features = [
    {
      title: 'Applicant Tracking',
      description: 'Manage applications and track candidates through your pipeline.',
      image: '/images/employers/ats.jpg',
    },
    {
      title: 'Smart Filtering',
      description: 'Filter by skills, experience, and location to find the right match.',
      image: '/images/employers/filtering.jpg',
    },
    {
      title: 'Team Collaboration',
      description: 'Share feedback and make hiring decisions together.',
      image: '/images/employers/collaboration.jpg',
    },
    {
      title: 'Analytics',
      description: 'Track performance and metrics for data-driven decisions.',
      image: '/images/employers/analytics.jpg',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [features.length])

  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            Powerful hiring tools
          </h2>
        </div>

        {/* Desktop: Carousel layout */}
        <div className="hidden md:block relative h-[600px] flex items-center justify-center">
          <div className="flex items-center justify-center gap-6">
            {features.map((feature, index) => {
              const isActive = index === activeIndex
              const distance = Math.abs(index - activeIndex)
              
              return (
                <div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`transition-all duration-700 ease-out cursor-pointer ${
                    isActive ? 'z-30' : distance === 1 ? 'z-20' : 'z-10'
                  }`}
                  style={{
                    transform: `scale(${isActive ? 1 : distance === 1 ? 0.85 : 0.7})`,
                    opacity: isActive ? 1 : distance === 1 ? 0.6 : 0.3,
                  }}
                >
                  <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${
                    isActive ? 'w-[280px] h-[500px]' : 'w-[240px] h-[430px]'
                  }`}>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-700 ${
                      isActive ? 'opacity-100' : 'opacity-70'
                    }`} />
                    <div className={`absolute bottom-0 left-0 right-0 p-6 text-white transition-all duration-700 ${
                      isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/90">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile: Single card with swipe */}
        <div className="md:hidden">
          {features[activeIndex] && (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] sm:h-[450px]">
              <img
                src={features[activeIndex].image}
                alt={features[activeIndex].title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{features[activeIndex].title}</h3>
                <p className="text-sm sm:text-base text-white/90">{features[activeIndex].description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-2 mt-6 sm:mt-8">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex
                  ? 'bg-brand-orange w-8 h-2'
                  : 'bg-border hover:bg-brand-orange/50 w-2 h-2'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
