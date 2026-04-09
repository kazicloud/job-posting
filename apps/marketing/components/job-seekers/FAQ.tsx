'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'Is KaziCloud free for job seekers?',
      answer: 'Yes! KaziCloud is completely free for job seekers. Create your profile, browse jobs, and apply to unlimited positions at no cost.',
    },
    {
      question: 'How does the matching algorithm work?',
      answer: 'Our AI analyzes your profile, skills, experience, and preferences to match you with relevant opportunities. The more complete your profile, the better your matches.',
    },
    {
      question: 'How long does it take to find a job?',
      answer: 'On average, our users receive their first interview invitation within 2 weeks. 94% of active users land a job within 3 months.',
    },
    {
      question: 'Are all employers verified?',
      answer: 'Yes. Every company on KaziCloud undergoes verification. We check business registration, contact information, and legitimacy before approving job postings.',
    },
    {
      question: 'Can I apply to jobs without a resume?',
      answer: 'Your KaziCloud profile serves as your resume. However, you can also upload a traditional resume if preferred. Many employers accept profile-only applications.',
    },
    {
      question: 'Do employers see my current employer?',
      answer: 'Your profile is private by default. You control what information is visible to employers. You can hide your current employer or make your profile completely anonymous.',
    },
    {
      question: 'How do salary insights work?',
      answer: 'We aggregate salary data from job postings, user reports, and market research to provide accurate salary ranges for specific roles and locations.',
    },
    {
      question: 'Can I get help with my job search?',
      answer: 'Yes! We offer career resources, resume tips, interview preparation guides, and email support. Premium users get access to career coaching.',
    },
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-text-primary mb-4">
              Frequently asked questions
            </h2>
            <p className="text-xl text-text-secondary">
              Everything you need to know about finding jobs on KaziCloud
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-border rounded-lg">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-secondary transition-colors"
                >
                  <span className="font-bold text-text-primary pr-8">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-8 bg-neutral-secondary">
            <h3 className="font-bold text-text-primary mb-2">
              Still have questions?
            </h3>
            <p className="text-text-secondary mb-4">
              Our support team is here to help
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-brand-orange font-medium hover:underline"
            >
              Contact Support
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
