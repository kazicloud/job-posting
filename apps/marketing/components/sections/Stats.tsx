'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Briefcase, Award } from 'lucide-react'

const stats = [
  { label: 'Active Jobs', value: '10,000+', icon: Briefcase },
  { label: 'Companies', value: '2,500+', icon: TrendingUp },
  { label: 'Job Seekers', value: '50,000+', icon: Users },
  { label: 'Success Rate', value: '94%', icon: Award },
]

export default function Stats() {
  return (
    <section className="py-16 bg-neutral-secondary">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange mb-4">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold text-text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-text-secondary font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
