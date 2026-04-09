'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Vincent Muderu',
    role: 'Branch Manager',
    company: 'Pheonix Capital',
    image: '/images/testimonials/testimony1.webp',
    content: 'We hire regularly, and this platform simplified the process. Clear pricing, good candidate reach, and a steady flow of qualified applicants. It\'s now part of our standard recruitment toolkit.',
    rating: 5,
  },
  {
    name: 'Simon Oparah',
    role: 'Mwezi Solar Co. LTD',
    company: '',
    image: '/images/testimonials/testimony2.webp',
    content: 'We posted our role and started receiving relevant applications within days. The dashboard made it easy to track candidates, and the added visibility across social media helped us reach talent we wouldn\'t have found otherwise.',
    rating: 5,
  },
  {
    name: 'Lucy Mwangi',
    role: 'Smart Pay Ltd',
    company: '',
    image: '/images/testimonials/testimony3.webp',
    content: 'For hard-to-fill roles, the hiring support made a real difference. From shortlisting to interview coordination, the process was efficient and professional. We filled positions faster with better candidates.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="section-padding">
      <div className="container-custom">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-display-md md:text-display-lg font-display font-bold text-text-primary mb-4"
          >
            Loved by <span className="gradient-text">thousands</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary"
          >
            See what our users have to say about their experience
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-brand-orange/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-orange text-brand-orange" />
                ))}
              </div>

              {/* Content */}
              <p className="text-text-secondary mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-text-primary">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-text-muted">
                    {testimonial.company ? `${testimonial.role} - ${testimonial.company}` : testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
