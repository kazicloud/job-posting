'use client'

import { Search, Loader2 } from 'lucide-react'
import { useJobSearch } from '../../hooks/useJobSearch'

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000'

export default function HeroSearch() {
  const { query, setQuery, results, isSearching, hasQuery } = useJobSearch()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.append('title', query)
    window.location.href = `${WEB_APP_URL}/jobs?${params.toString()}`
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
      <div className="bg-white shadow-xl rounded-lg border border-border p-1.5 sm:p-2 flex gap-2">
        <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3">
          {isSearching ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted flex-shrink-0 animate-spin" />
          ) : (
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted flex-shrink-0" />
          )}
          <input
            type="text"
            placeholder="Search jobs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-sm sm:text-base text-text-primary placeholder:text-text-muted"
          />
        </div>
        <button
          type="submit"
          className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-brand-orange text-white hover:bg-text-primary transition-colors flex-shrink-0"
        >
          <Search className="w-5 h-5" />
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
  )
}
