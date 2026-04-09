'use client'

import { useState, useEffect } from 'react'

interface Section {
  id: string
  title: string
}

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  sections: Section[]
  children: React.ReactNode
}

export default function LegalLayout({ title, lastUpdated, sections, children }: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -80% 0px' }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [sections])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="pt-20 pb-16 bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-[240px_1fr] gap-12">
          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">
                On this page
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left text-sm py-1.5 px-3 transition-colors ${
                      activeSection === section.id
                        ? 'text-brand-orange font-medium border-l-2 border-brand-orange'
                        : 'text-text-secondary hover:text-text-primary border-l-2 border-transparent'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="max-w-3xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-text-primary mb-3">{title}</h1>
              <p className="text-sm text-text-muted">Last updated: {lastUpdated}</p>
            </div>

            <div className="prose prose-slate max-w-none">
              <style jsx global>{`
                .prose section {
                  margin-bottom: 3rem;
                  scroll-margin-top: 6rem;
                }
                .prose h2 {
                  font-size: 1.5rem;
                  font-weight: 700;
                  color: #0F172A;
                  margin-bottom: 1rem;
                  margin-top: 0;
                }
                .prose h3 {
                  font-size: 1.125rem;
                  font-weight: 600;
                  color: #0F172A;
                  margin-bottom: 0.75rem;
                  margin-top: 1.5rem;
                }
                .prose p {
                  color: #475569;
                  line-height: 1.7;
                  margin-bottom: 1rem;
                }
                .prose ul {
                  list-style: disc;
                  padding-left: 1.5rem;
                  margin-bottom: 1rem;
                  color: #475569;
                }
                .prose li {
                  margin-bottom: 0.5rem;
                  line-height: 1.7;
                }
                .prose strong {
                  color: #0F172A;
                  font-weight: 600;
                }
              `}</style>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
