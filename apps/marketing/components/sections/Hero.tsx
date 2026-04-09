'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Loader2 } from 'lucide-react'
import { useJobSearch } from '../../hooks/useJobSearch'

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { query, setQuery, results, isSearching, hasQuery } = useJobSearch()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.append('title', query)
    window.location.href = `${WEB_APP_URL}/jobs?${params.toString()}`
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      })
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(220, 132, 44, 0.1)'
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-orange/10 to-white">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      <div className="container-custom relative z-10 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">

            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1]">
              Where careers
              <br />
              <span className="relative inline-block">
                take flight
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="12"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 2 100 2 150 6C200 10 250 10 298 6"
                    stroke="#DC842C"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
              A recruitment platform built for the modern workforce. Connect with opportunities 
              that match your ambitions, or find talent that drives your vision forward.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl relative">
              <div className="bg-white shadow-xl rounded-lg border border-border p-2 flex gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3">
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 text-text-muted flex-shrink-0 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
                  )}
                  <input
                    type="text"
                    placeholder="Search jobs by title or keyword..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 outline-none text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-lg bg-brand-orange text-white font-medium hover:bg-text-primary transition-colors"
                >
                  Search
                </button>
              </div>
              
              {/* Search Results Dropdown */}
              {hasQuery && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white shadow-xl rounded-lg border border-border max-h-96 overflow-y-auto z-50">
                  {results.map((job: any) => (
                    <a
                      key={job._id}
                      href={`${WEB_APP_URL}/jobs/${job._id}`}
                      className="block p-4 hover:bg-neutral-secondary border-b border-border last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        {job.employerProfile?.companyLogo && (
                          <img
                            src={job.employerProfile.companyLogo}
                            alt={job.companyName}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-text-primary truncate">{job.title}</h4>
                          <p className="text-sm text-text-secondary">{job.companyName}</p>
                          <p className="text-xs text-text-muted mt-1">{job.location} • {job.employmentType}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </form>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`${WEB_APP_URL}/sign-up`}
                className="group relative px-8 py-4 rounded-lg bg-text-primary text-white font-medium overflow-hidden"
              >
                <span className="relative z-10">Start Your Journey</span>
                <div className="absolute inset-0 bg-brand-orange transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Link>
              <Link
                href="/job-seekers"
                className="px-8 py-4 rounded-lg border-2 border-text-primary text-text-primary font-medium hover:bg-text-primary hover:text-white transition-colors duration-300"
              >
                Explore Opportunities
              </Link>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square">
              {/* Geometric shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-xl overflow-hidden border-2 border-brand-orange/20">
                <img
                  src="/images/home/interview.webp"
                  alt="Interview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-12 right-12 w-64 h-64 rounded-lg bg-brand-orange/5" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-lg overflow-hidden border-2 border-text-primary/10">
                <img
                  src="/images/home/interview2.avif"
                  alt="Interview"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content cards */}
              <div className="absolute top-20 left-0 bg-white rounded-lg p-6 shadow-lg rounded-lg border border-border max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-full overflow-hidden">
                    <img
                      src="/images/home/company-logo1.webp"
                      alt="Company logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Senior Developer</div>
                    <div className="text-xs text-text-muted">TechCorp Inc.</div>
                  </div>
                </div>
                <div className="text-xs text-text-secondary">
                  Remote • Full-time • $120k-$180k
                </div>
              </div>

              <div className="absolute bottom-20 right-0 bg-white rounded-lg p-6 shadow-lg rounded-lg border border-border max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-text-primary/10 rounded-full overflow-hidden">
                    <img
                      src="/images/home/company-logo2.jpg"
                      alt="Company logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Marketing Manager</div>
                    <div className="text-xs text-text-muted">DesignHub</div>
                  </div>
                </div>
                <div className="text-xs text-text-secondary">
                  Hybrid • Full-time • $90k-$130k
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
