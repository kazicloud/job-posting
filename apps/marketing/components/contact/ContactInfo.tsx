import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react'

export default function ContactInfo() {
  const contactMethods = [
    {
      icon: MapPin,
      title: 'Address',
      value: 'P O Box 3006 -00202',
      description: 'City Square, Nairobi, Kenya',
      extra: 'Greenhouse Mall, 4th floor, Suite 17, Ngong Rd, Nairobi',
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+254 715 670 000',
      description: 'WhatsApp: +254 715 670 000',
      extra: 'SMS: +254 715 670 000',
    },
    {
      icon: Mail,
      title: 'Customer Care',
      value: 'info@kazicloud.co.ke',
      description: 'Job Applications: careers@kazicloud.co.ke',
      extra: 'Submit Jobs/Hire Talent: hire@kazicloud.co.ke',
    },
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-6">
        Other ways to reach us
      </h2>

      <div className="space-y-6 mb-8">
        {contactMethods.map((method, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <method.icon className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary mb-1">{method.title}</h3>
              <p className="text-text-primary mb-1">{method.value}</p>
              <p className="text-sm text-text-secondary mb-1">{method.description}</p>
              {method.extra && (
                <p className="text-sm text-text-muted">{method.extra}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-neutral-secondary border border-border rounded-lg">
        <h3 className="font-bold text-text-primary mb-3">Need immediate help?</h3>
        <p className="text-text-secondary mb-4">
          Check out our Help Center for instant answers to common questions.
        </p>
        <a
          href="/help"
          className="inline-block px-6 py-3 rounded-lg border-2 border-text-primary text-text-primary font-medium hover:bg-text-primary hover:text-white transition-colors"
        >
          Visit Help Center
        </a>
      </div>
    </div>
  )
}
