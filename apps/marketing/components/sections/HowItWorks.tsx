'use client'

import { motion } from 'framer-motion'
import { UserPlus, FileText, Search, Rocket } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up in minutes and build a compelling profile that showcases your skills and experience.',
  },
  {
    icon: Search,
    title: 'Discover Opportunities',
    description: 'Browse thousands of jobs or let our AI match you with positions that fit your goals.',
  },
  {
    icon: FileText,
    title: 'Apply with Ease',
    description: 'Submit applications instantly with your saved profile. Track everything in one dashboard.',
  },
  {
    icon: Rocket,
    title: 'Land Your Dream Job',
    description: 'Connect with employers, ace interviews, and start your next career chapter.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-display-md md:text-display-lg font-display font-bold text-text-primary mb-4"
          >
            How it <span className="gradient-text">works</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary"
          >
            Get started in four simple steps
          </motion.p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 -z-10" />

            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="card text-center">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto mb-4 mt-4">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
