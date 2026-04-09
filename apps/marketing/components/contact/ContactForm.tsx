'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    // Simulate API call
    setTimeout(() => {
      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus('idle'), 3000)
    }, 1000)
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-6">
        Send us a message
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border focus:border-brand-orange focus:outline-none"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border focus:border-brand-orange focus:outline-none"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
            Subject
          </label>
          <select
            id="subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border focus:border-brand-orange focus:outline-none"
          >
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="support">Technical Support</option>
            <option value="billing">Billing Question</option>
            <option value="partnership">Partnership Opportunity</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
            Message
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border focus:border-brand-orange focus:outline-none resize-none"
            placeholder="Tell us how we can help..."
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full px-8 py-4 rounded-lg bg-brand-orange text-white font-bold hover:bg-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
          <Send className="w-5 h-5" />
        </button>

        {status === 'success' && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            Message sent successfully! We'll get back to you soon.
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800">
            Something went wrong. Please try again.
          </div>
        )}
      </form>
    </div>
  )
}
