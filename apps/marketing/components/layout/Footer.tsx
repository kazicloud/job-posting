import Link from 'next/link'

const footerLinks = {
  product: [
    { name: 'For Job Seekers', href: '/job-seekers' },
    { name: 'For Employers', href: '/employers' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/employers#pricing' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/job-seekers#career-program' },
    { name: 'Contact', href: '/contact' },
  ],
  resources: [
    { name: 'Blog', href: '/#' },
    { name: 'Help Center', href: '/#' },
    { name: 'API Documentation', href: '/#' },
    { name: 'Status', href: '/#' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-brand-orange border-t border-white/20">
      <div className="container-custom py-16">
        <div className="grid md:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <img 
                src="/images/kazicloud-logo.jpg" 
                alt="KaziCloud" 
                className="h-10 w-10 rounded-lg"
              />
              <span className="font-bold text-xl tracking-tight text-white">
                KaziCloud
              </span>
            </Link>
            <p className="text-white/80 mb-6 max-w-sm">
              The professional recruitment platform connecting talent with opportunity.
            </p>
            <div className="text-sm text-white/60">
              © {new Date().getFullYear()} KaziCloud. All rights reserved.
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="font-bold mb-4 text-white">Product</div>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold mb-4 text-white">Company</div>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold mb-4 text-white">Resources</div>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-sm">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/60 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="text-sm text-white/60">
            Built for professionals, by professionals
          </div>
        </div>
      </div>
    </footer>
  )
}
