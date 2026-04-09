import { Mail, MapPin, Phone, Clock } from 'lucide-react'

export default function ContactInfo() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@kazicloud.com',
      description: 'We typically respond within 24 hours',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+254 700 000 000',
      description: 'Mon-Fri, 9am-6pm EAT',
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'Nairobi, Kenya',
      description: 'Westlands, Nairobi',
    },
    {
      icon: Clock,
      title: 'Support Hours',
      value: '24/7 Email Support',
      description: 'Phone support during business hours',
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
            <div className="w-12 h-12 bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
              <method.icon className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary mb-1">{method.title}</h3>
              <p className="text-text-primary mb-1">{method.value}</p>
              <p className="text-sm text-text-muted">{method.description}</p>
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
          className="inline-block px-6 py-3 border-2 border-text-primary text-text-primary font-medium hover:bg-text-primary hover:text-white transition-colors"
        >
          Visit Help Center
        </a>
      </div>
    </div>
  )
}
