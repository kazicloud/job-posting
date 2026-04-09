'use client'

import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'

export default function JobSeekersHero() {
  const [jobTitle, setJobTitle] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to jobs page with filters
    window.location.href = `/jobs?title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`
  }

  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-white via-neutral-secondary to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-orange rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-text-primary rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block rounded-lg px-4 py-2 bg-brand-orange/10 text-brand-orange text-sm font-medium mb-6">
            50,000+ professionals found jobs through KaziCloud
          </div>

          <h1 className="text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
            Find work that
            <br />
            fits your life
          </h1>

          <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Search thousands of verified jobs from top companies. Get matched with opportunities that align with your skills and career goals.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg p-2 border-2 border-border shadow-xl">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 border-r border-border">
                <Search className="w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="flex-1 outline-none text-text-primary placeholder:text-text-muted"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <MapPin className="w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="City or remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 outline-none text-text-primary placeholder:text-text-muted"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 rounded-lg bg-brand-orange text-white font-medium hover:bg-text-primary transition-colors"
              >
                Search Jobs
              </button>
            </div>
          </form>

          <div className="mt-8 text-sm text-text-muted">
            Popular searches: <span className="text-text-primary font-medium">Software Engineer</span>, <span className="text-text-primary font-medium">Product Manager</span>, <span className="text-text-primary font-medium">Data Analyst</span>
          </div>
        </div>
      </div>
    </section>
  )
}
