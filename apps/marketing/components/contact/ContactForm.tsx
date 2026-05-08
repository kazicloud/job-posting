'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'

export default function ContactForm() {
  const submitMessage = useMutation(api.contactMessages.submit)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorText, setErrorText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorText('')

    try {
      await submitMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      })
      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err: any) {
      setStatus('error')
      setErrorText(err?.message || 'Something went wrong. Please try again.')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary">Message sent!</h3>
        <p className="text-text-secondary max-w-sm">
          Thank you for reaching out. Our team will review your message and get back to you as soon as possible.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 px-6 py-2.5 rounded-lg border border-border text-text-primary text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Send another message
        </button>
      </div>
    )
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
            <option value="General Inquiry">General Inquiry</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Billing Question">Billing Question</option>
            <option value="Partnership Opportunity">Partnership Opportunity</option>
            <option value="Feedback">Feedback</option>
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
          {status === 'sending' ? 'Sending…' : 'Send Message'}
          <Send className="w-5 h-5" />
        </button>

        {status === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {errorText}
          </div>
        )}
      </form>
    </div>
  )
}
