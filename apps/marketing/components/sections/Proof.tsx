'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: "Vincent Muderu",
    role: "Branch Manager",
    company: "Pheonix Capital",
    rating: 5,
    text: "We hire regularly, and this platform simplified the process. Clear pricing, good candidate reach, and a steady flow of qualified applicants. It's now part of our standard recruitment toolkit.",
    image: "/images/testimonials/testimony1.webp",
    avatar: "VM",
  },
  {
    name: "Simon Oparah",
    role: "",
    company: "Mwezi Solar Co. LTD",
    rating: 5,
    text: "We posted our role and started receiving relevant applications within days. The dashboard made it easy to track candidates, and the added visibility across social media helped us reach talent we wouldn't have found otherwise.",
    image: "/images/testimonials/testimony2.webp",
    avatar: "SO",
  },
  {
    name: "Lucy Mwangi",
    role: "",
    company: "Smart Pay Ltd",
    rating: 5,
    text: "For hard-to-fill roles, the hiring support made a real difference. From shortlisting to interview coordination, the process was efficient and professional. We filled positions faster with better candidates.",
    image: "/images/testimonials/testimony3.webp",
    avatar: "LM",
  },
]

export default function Proof() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const getVisibleTestimonials = () => {
    const next = (activeIndex + 1) % testimonials.length
    const prev = (activeIndex - 1 + testimonials.length) % testimonials.length
    
    return testimonials.map((testimonial, idx) => {
      if (idx === next) return { ...testimonial, position: 'top', isActive: false, show: true }
      if (idx === activeIndex) return { ...testimonial, position: 'middle', isActive: true, show: true }
      if (idx === prev) return { ...testimonial, position: 'bottom', isActive: false, show: true }
      return { ...testimonial, position: 'hidden', isActive: false, show: false }
    })
  }

  const visible = getVisibleTestimonials()
  const currentTestimonial = testimonials[activeIndex] || testimonials[0]

  return (
    <section className="section-padding bg-white overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-orange/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Testimonials Arc */}
          <div>
            <div className="w-16 h-1 bg-brand-orange mb-4" />
            <h2 className="text-5xl font-bold text-text-primary mb-12">
              What people are saying
            </h2>

            <div className="relative h-[420px] w-full max-w-[400px]">
              {/* Arc Path */}
              <svg className="absolute left-0 top-0 w-[250px] h-[420px] z-0" viewBox="0 0 250 420">
                <path
                  d="M 50 40 Q 140 210 50 380"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>

              {/* Animated Testimonials */}
              {visible.map((testimonial) => {
                if (!testimonial.show) return null
                
                const positions: Record<string, { top: string; left: string }> = {
                  top: { top: '0px', left: '0px' },
                  middle: { top: '180px', left: '70px' },
                  bottom: { top: '340px', left: '0px' }
                }
                
                return (
                  <div
                    key={testimonial.name}
                    style={{
                      top: positions[testimonial.position]?.top || '0px',
                      left: positions[testimonial.position]?.left || '0px',
                    }}
                    className={`absolute transition-all duration-1000 ease-in-out ${
                      testimonial.isActive ? 'opacity-100 z-20' : 'opacity-50 z-10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full bg-neutral-secondary flex items-center justify-center overflow-hidden border-4 transition-all duration-1000 ${
                        testimonial.isActive 
                          ? 'w-20 h-20 border-brand-orange shadow-lg' 
                          : 'w-16 h-16 border-white'
                      }`}>
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-text-primary font-bold">${testimonial.avatar}</div>`;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <h3 className={`font-bold text-text-primary transition-all duration-1000 ${
                          testimonial.isActive ? 'text-lg' : 'text-base'
                        }`}>
                          {testimonial.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`fill-brand-orange text-brand-orange transition-all duration-1000 ${
                              testimonial.isActive ? 'w-4 h-4' : 'w-3 h-3'
                            }`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right - Active Testimonial */}
          <div className="relative">
            {currentTestimonial && (
              <div className="bg-neutral-secondary p-12 relative">
                <div className="text-6xl text-brand-orange font-serif mb-4">"</div>
                <p className="text-text-secondary text-lg leading-relaxed mb-6 italic">
                  {currentTestimonial.text}
                </p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <div className="text-sm text-text-muted">
                  {currentTestimonial.company}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
