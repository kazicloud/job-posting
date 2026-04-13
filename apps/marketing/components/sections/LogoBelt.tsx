'use client'

import Image from 'next/image'

export default function LogoBelt() {
  const logos = [
    { name: 'Safaricom', file: 'safaricom-img.webp' },
    { name: 'Equity Group', file: 'equity-group-img.webp' },
    { name: 'Kenya Airways', file: 'kenya-airways-img.webp' },
    { name: 'Britam', file: 'britam-img.webp' },
    { name: 'Naivas', file: 'naivas-img.webp' },
    { name: 'Isuzu', file: 'isuzu-img.webp' },
    { name: 'Deloitte', file: 'deloitte-img.webp' },
    { name: 'EABL', file: 'eabl-img.webp' },
    { name: 'Housing Finance', file: 'housing-finance-group-img.webp' },
    { name: 'SimbaPOS', file: 'simbapos-img.webp' },
    { name: 'Smart Pay Network', file: 'smart-pay-network-img.webp' },
    { name: 'Unifi', file: 'unifi-img.webp' },
  ]

  return (
    <section className="py-12 sm:py-16 bg-neutral-secondary border-y border-border overflow-hidden">
      <div className="container-custom mb-8">
        <p className="text-center text-sm text-text-muted uppercase tracking-wider">
          Trusted by leading companies in Kenya
        </p>
      </div>
      
      <div className="relative">
        <div className="flex animate-scroll">
          {/* First set */}
          {logos.map((logo, index) => (
            <div
              key={`first-${index}`}
              className="flex-shrink-0 w-48 h-20 mx-8 flex items-center justify-center"
            >
              <Image
                src={`/images/logos/${logo.file}`}
                alt={`${logo.name} logo`}
                width={160}
                height={60}
                className="object-contain max-h-16"
              />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {logos.map((logo, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 w-48 h-20 mx-8 flex items-center justify-center"
            >
              <Image
                src={`/images/logos/${logo.file}`}
                alt={`${logo.name} logo`}
                width={160}
                height={60}
                className="object-contain max-h-16"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
