'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'

const navigation = [
  { name: 'For Job Seekers', href: '/job-seekers' },
  { name: 'For Employers', href: '/employers' },
]

const pagesDropdown = [
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
]

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isPagesOpen, setIsPagesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPagesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <img 
              src="/images/kazicloud-logo.jpg" 
              alt="KaziCloud" 
              className="h-10 w-10 rounded-lg"
            />
            <span className="font-bold text-xl tracking-tight">
              KaziCloud
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Pages Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsPagesOpen(!isPagesOpen)}
                onMouseEnter={() => setIsPagesOpen(true)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Pages
                <ChevronDown className={`w-4 h-4 transition-transform ${isPagesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isPagesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg border border-border shadow-lg"
                  onMouseLeave={() => setIsPagesOpen(false)}
                >
                  {pagesDropdown.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="block px-4 py-3 text-sm text-text-secondary hover:bg-neutral-secondary hover:text-text-primary transition-colors"
                      onClick={() => setIsPagesOpen(false)}
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href={`${WEB_APP_URL}/sign-in`}
              className="text-sm font-medium text-text-primary hover:text-brand-orange transition-colors"
            >
              Sign In
            </a>
            <a
              href={`${WEB_APP_URL}/sign-up`}
              className="px-6 py-2.5 rounded-lg bg-brand-orange text-white text-sm font-medium hover:bg-brand-orange transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white rounded-lg border-t border-border">
          <div className="container-custom py-6 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-text-secondary hover:text-text-primary font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Pages in Mobile */}
            <div>
              <button
                onClick={() => setIsPagesOpen(!isPagesOpen)}
                className="flex items-center gap-1 text-text-secondary hover:text-text-primary font-medium w-full"
              >
                Pages
                <ChevronDown className={`w-4 h-4 transition-transform ${isPagesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPagesOpen && (
                <div className="ml-4 mt-2 space-y-2">
                  {pagesDropdown.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setIsPagesOpen(false)
                      }}
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 space-y-3 border-t border-border">
              <a
                href={`${WEB_APP_URL}/sign-in`}
                className="block text-center px-6 py-3 rounded-lg border border-text-primary text-text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </a>
              <a
                href={`${WEB_APP_URL}/sign-up`}
                className="block text-center px-6 py-3 rounded-lg bg-text-primary text-white font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
