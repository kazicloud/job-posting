'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'How quickly will I get a response?',
      answer: 'We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us during business hours.',
    },
    {
      question: 'Do you offer phone support?',
      answer: 'Yes! Phone support is available Monday-Friday, 9am-6pm EAT. Email support is available 24/7.',
    },
    {
      question: 'Can I schedule a demo?',
      answer: 'Absolutely! For employers interested in our platform, we offer personalized demos. Contact our sales team to schedule one.',
    },
    {
      question: 'Where can I report a bug?',
      answer: 'Please email support@kazicloud.com with details about the issue, including screenshots if possible. We take all bug reports seriously.',
    },
    {
      question: 'How do I delete my account?',
      answer: 'You can delete your account from your settings page, or contact support and we\'ll help you through the process.',
    },
  ]

  return (
    <section className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-text-secondary">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-border rounded-lg">
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
        </div>
      </div>
    </section>
  )
}
