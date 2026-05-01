'use client'

import { useState } from 'react'
import { Search, MapPin, Clock, Briefcase, Home, Building2, Laptop, Award, Calendar, ChevronDown, X } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import Link from 'next/link'

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000'

export default function PublicJobsContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'salary-high' | 'salary-low'>('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [paginationOpts, setPaginationOpts] = useState({ numItems: 20, cursor: null as string | null })
  
  // Filter states
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selectedWorkType, setSelectedWorkType] = useState<string>('')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>('')
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string>('')
  
  // Modal states
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [filterSearch, setFilterSearch] = useState('')

  const result = useQuery(api.jobs.listPublished, { paginationOpts, sortBy })
  const jobs = result?.page || []
  const isLoading = result === undefined

  const loadMore = () => {
    if (result && !result.isDone) {
      setPaginationOpts({ numItems: 20, cursor: result.continueCursor })
    }
  }

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort)
    setPaginationOpts({ numItems: 20, cursor: null })
    setShowSortMenu(false)
  }

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSkills = selectedSkills.length === 0 || 
      (job.requiredSkills && selectedSkills.some(skill => 
        job.requiredSkills?.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      ))

    const matchesLocation = !selectedLocation || 
      job.location.toLowerCase().includes(selectedLocation.toLowerCase())

    const matchesWorkType = !selectedWorkType || 
      job.workplaceType.toLowerCase() === selectedWorkType.toLowerCase()

    const matchesEmploymentType = !selectedEmploymentType || 
      job.employmentType.toLowerCase() === selectedEmploymentType.toLowerCase()

    const matchesExperience = !selectedExperienceLevel || 
      job.experienceLevel.toLowerCase() === selectedExperienceLevel.toLowerCase()

    return matchesSearch && matchesSkills && matchesLocation && 
           matchesWorkType && matchesEmploymentType && matchesExperience
  })

  const uniqueLocations = Array.from(new Set(jobs.map(j => j.location))).sort()
  const uniqueSkills = Array.from(new Set(jobs.flatMap(j => j.requiredSkills || []))).sort()

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSkills([])
    setSelectedLocation('')
    setSelectedWorkType('')
    setSelectedEmploymentType('')
    setSelectedExperienceLevel('')
  }

  const hasActiveFilters = searchQuery || selectedSkills.length > 0 || selectedLocation || 
    selectedWorkType || selectedEmploymentType || selectedExperienceLevel

  return (
    <div className="min-h-screen bg-neutral-secondary pt-20">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">Browse Jobs</h1>
          <p className="text-text-secondary">Explore opportunities from top companies</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, or location"
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <FilterButton
                icon={<Briefcase className="w-4 h-4" />}
                label="Skills"
                count={selectedSkills.length}
                isActive={selectedSkills.length > 0}
                onClick={() => setOpenFilter(openFilter === 'skills' ? null : 'skills')}
              />
              {openFilter === 'skills' && (
                <FilterDropdown
                  title="Skills"
                  items={uniqueSkills}
                  selectedItems={selectedSkills}
                  onToggle={(skill: string) => {
                    setSelectedSkills(prev =>
                      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                    )
                  }}
                  onClear={() => setSelectedSkills([])}
                  onClose={() => setOpenFilter(null)}
                  searchValue={filterSearch}
                  onSearchChange={setFilterSearch}
                />
              )}

              <FilterButton
                icon={<MapPin className="w-4 h-4" />}
                label="Location"
                isActive={!!selectedLocation}
                onClick={() => setOpenFilter(openFilter === 'location' ? null : 'location')}
              />
              {openFilter === 'location' && (
                <FilterDropdown
                  title="Location"
                  items={uniqueLocations}
                  selectedItems={selectedLocation ? [selectedLocation] : []}
                  onToggle={(loc: string) => setSelectedLocation(selectedLocation === loc ? '' : loc)}
                  onClear={() => setSelectedLocation('')}
                  onClose={() => setOpenFilter(null)}
                  searchValue={filterSearch}
                  onSearchChange={setFilterSearch}
                  singleSelect
                />
              )}

              <FilterButton
                icon={<Home className="w-4 h-4" />}
                label="Work Type"
                isActive={!!selectedWorkType}
                onClick={() => setOpenFilter(openFilter === 'workType' ? null : 'workType')}
              />
              {openFilter === 'workType' && (
                <FilterDropdown
                  title="Work Type"
                  items={['Remote', 'On-site', 'Hybrid']}
                  selectedItems={selectedWorkType ? [selectedWorkType] : []}
                  onToggle={(type: string) => setSelectedWorkType(selectedWorkType === type.toLowerCase() ? '' : type.toLowerCase())}
                  onClear={() => setSelectedWorkType('')}
                  onClose={() => setOpenFilter(null)}
                  singleSelect
                />
              )}

              <FilterButton
                icon={<Clock className="w-4 h-4" />}
                label="Job Type"
                isActive={!!selectedEmploymentType}
                onClick={() => setOpenFilter(openFilter === 'jobType' ? null : 'jobType')}
              />
              {openFilter === 'jobType' && (
                <FilterDropdown
                  title="Job Type"
                  items={['Full-time', 'Part-time', 'Contract', 'Internship']}
                  selectedItems={selectedEmploymentType ? [selectedEmploymentType] : []}
                  onToggle={(type: string) => setSelectedEmploymentType(selectedEmploymentType === type.toLowerCase() ? '' : type.toLowerCase())}
                  onClear={() => setSelectedEmploymentType('')}
                  onClose={() => setOpenFilter(null)}
                  singleSelect
                />
              )}

              <FilterButton
                icon={<Award className="w-4 h-4" />}
                label="Experience"
                isActive={!!selectedExperienceLevel}
                onClick={() => setOpenFilter(openFilter === 'experience' ? null : 'experience')}
              />
              {openFilter === 'experience' && (
                <FilterDropdown
                  title="Experience Level"
                  items={['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive']}
                  selectedItems={selectedExperienceLevel ? [selectedExperienceLevel] : []}
                  onToggle={(level: string) => {
                    const levelMap: Record<string, string> = {
                      'Entry Level': 'entry',
                      'Mid Level': 'mid',
                      'Senior': 'senior',
                      'Lead': 'lead',
                      'Executive': 'executive'
                    }
                    const value = levelMap[level] || ''
                    setSelectedExperienceLevel(selectedExperienceLevel === value ? '' : value)
                  }}
                  onClear={() => setSelectedExperienceLevel('')}
                  onClose={() => setOpenFilter(null)}
                  singleSelect
                />
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 transition-colors whitespace-nowrap"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <p className="text-sm text-text-secondary">
            {isLoading ? 'Loading...' : (
              <>
                <span className="font-semibold text-text-primary">{filteredJobs.length}</span> job{filteredJobs.length !== 1 ? 's' : ''} found
              </>
            )}
          </p>
          <div className="flex items-center gap-2 relative">
            <span className="text-sm text-text-secondary hidden sm:inline">Sorted by</span>
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 text-sm font-medium text-text-primary hover:text-brand-orange"
            >
              {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'salary-high' ? 'Salary: High to Low' : 'Salary: Low to High'}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                <div className="fixed sm:absolute right-4 sm:right-0 top-[180px] sm:top-full sm:mt-2 w-48 bg-white border border-border rounded-lg shadow-lg z-50">
                  {['newest', 'oldest', 'salary-high', 'salary-low'].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => handleSortChange(sort as typeof sortBy)}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-secondary transition-colors ${
                        sortBy === sort ? 'text-brand-orange font-medium' : 'text-text-primary'
                      }`}
                    >
                      {sort === 'newest' ? 'Newest' : sort === 'oldest' ? 'Oldest' : sort === 'salary-high' ? 'Salary: High to Low' : 'Salary: Low to High'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => <JobCardSkeleton key={i} />)}
            </>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white border border-border rounded-lg p-12 text-center">
              <p className="text-text-secondary mb-2">No jobs match your search</p>
              <p className="text-sm text-text-muted">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
              
              {result && !result.isDone && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 border border-border text-text-primary rounded-md hover:bg-neutral-secondary transition-colors"
                  >
                    Load More Jobs
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterButton({ icon, label, count, isActive, onClick }: any) {
  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
          isActive
            ? 'bg-text-primary text-white border-text-primary'
            : 'border-border text-text-primary hover:bg-neutral-secondary'
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
        {count > 0 && (
          <span className="px-1.5 py-0.5 bg-white/20 text-white text-xs rounded-full">
            {count}
          </span>
        )}
      </button>
    </div>
  )
}

function FilterDropdown({ title, items, selectedItems, onToggle, onClear, onClose, searchValue, onSearchChange, singleSelect = false }: any) {
  const filteredItems = searchValue
    ? items.filter((item: string) => item.toLowerCase().includes(searchValue.toLowerCase()))
    : items

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed sm:absolute left-4 right-4 top-20 sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white border border-border rounded-xl shadow-lg z-50 max-h-[70vh] sm:max-h-[500px] flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-neutral-secondary rounded-md">
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No results found</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredItems.map((item: string) => {
                const isSelected = selectedItems.includes(item) || selectedItems.includes(item.toLowerCase())
                return (
                  <button
                    key={item}
                    onClick={() => onToggle(item)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-text-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClear()
              if (onSearchChange) onSearchChange('')
            }}
            className="text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-text-primary text-white text-sm font-semibold rounded-lg hover:bg-text-primary/90 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  )
}

function JobCard({ job }: any) {
  const logo = job.companyName.charAt(0).toUpperCase()
  const cardStyles = [
    { bg: 'bg-[#E8F5E3]', text: 'text-[#4A7C3B]', logoGradient: 'bg-gradient-to-br from-green-400 to-emerald-600' },
    { bg: 'bg-[#F3E8F8]', text: 'text-[#7B4A9E]', logoGradient: 'bg-gradient-to-br from-purple-400 to-violet-600' },
    { bg: 'bg-[#FCE8E8]', text: 'text-[#C84A4A]', logoGradient: 'bg-gradient-to-br from-rose-400 to-red-600' },
    { bg: 'bg-[#E8F0FC]', text: 'text-[#4A6FA5]', logoGradient: 'bg-gradient-to-br from-blue-400 to-indigo-600' },
    { bg: 'bg-[#FFF9E6]', text: 'text-[#B8860B]', logoGradient: 'bg-gradient-to-br from-yellow-400 to-amber-600' },
  ]
  const colorIndex = job.companyName.length % cardStyles.length
  const style = cardStyles[colorIndex]!

  const isNew = Date.now() - job.createdAt < 48 * 60 * 60 * 1000

  const getWorkplaceIcon = () => {
    switch (job.workplaceType.toLowerCase()) {
      case 'remote':
        return <Home className="w-4 h-4" />
      case 'hybrid':
        return <Laptop className="w-4 h-4" />
      default:
        return <Building2 className="w-4 h-4" />
    }
  }

  const formatExperience = (level: string) => {
    const map: Record<string, string> = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior',
      lead: 'Lead',
      executive: 'Executive'
    }
    return map[level] || level
  }

  const salary = job.salaryDisclosure === 'range' && job.salaryMin && job.salaryMax
    ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
    : job.salaryDisclosure === 'negotiable'
    ? 'Competitive salary'
    : 'To be discussed'

  return (
    <div className="bg-white border border-border rounded-xl p-4 sm:p-6 hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className={`w-full sm:w-[120px] lg:w-[148px] h-[100px] sm:h-[140px] lg:h-[160px] ${style.bg} rounded-2xl flex flex-col items-center justify-center flex-shrink-0 p-3 sm:p-4`}>
          <span className={`text-xs sm:text-sm font-semibold ${style.text} mb-2 sm:mb-3 text-center truncate w-full px-2`}>{job.companyName}</span>
          <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 ${style.logoGradient} rounded-xl flex items-center justify-center overflow-hidden`}>
            {job.employerProfile?.companyLogo ? (
              <img 
                src={job.employerProfile.companyLogo} 
                alt={`${job.companyName} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{logo}</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md bg-[#FFE4C4] text-text-primary capitalize">
                {job.employmentType}
              </span>
              {job.department && (
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md bg-[#E8F0FC] text-text-primary capitalize">
                  {job.department}
                </span>
              )}
              {isNew && <span className="px-2 py-1 text-xs font-semibold text-[#EF4444]">New</span>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 mb-3">
            <Link
              href={job.slug ? `/job/${job.slug}` : `/jobs`}
              className="text-lg sm:text-xl font-semibold text-text-primary hover:text-brand-orange leading-tight flex-1 break-words"
            >
              {job.title}
            </Link>
            <p className="text-base sm:text-xl font-semibold text-text-primary whitespace-nowrap flex-shrink-0">{salary}</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-secondary mb-4 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <MapPin className="w-4 sm:w-4 h-4 sm:h-4" />
              <span className="truncate max-w-[120px] sm:max-w-none">{job.location}</span>
            </div>
            {job.workplaceType.toLowerCase() !== 'remote' && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {getWorkplaceIcon()}
                <span className="capitalize">{job.workplaceType}</span>
              </div>
            )}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Award className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span>{formatExperience(job.experienceLevel)}</span>
            </div>
          </div>

          <div className="border-t border-border my-3 sm:my-4"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {job.requiredSkills && job.requiredSkills.length > 0 ? (
                job.requiredSkills.slice(0, 3).map((skill: string, index: number) => (
                  <span key={index} className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-muted">No skills specified</span>
              )}
              {job.requiredSkills && job.requiredSkills.length > 3 && (
                <span className="text-xs text-text-muted">+{job.requiredSkills.length - 3} more</span>
              )}
            </div>

            <Link
              href={job.slug ? `/job/${job.slug}` : `${WEB_APP_URL}/sign-up`}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
            >
              <span>View & Apply</span>
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function JobCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-4 sm:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-full sm:w-[120px] lg:w-[148px] h-[100px] sm:h-[140px] lg:h-[160px] bg-gray-200 rounded-2xl flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-16 sm:w-24"></div>
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-14 sm:w-20"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 mb-3">
            <div className="h-6 sm:h-7 bg-gray-200 rounded w-full sm:w-2/3"></div>
            <div className="h-5 sm:h-7 bg-gray-200 rounded w-24 sm:w-32"></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 mb-4 flex-wrap">
            <div className="h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20 sm:w-28"></div>
          </div>
          <div className="border-t border-border my-3 sm:my-4"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-16 sm:w-20"></div>
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-20 sm:w-24"></div>
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-16 sm:w-20"></div>
            </div>
            <div className="h-9 bg-gray-200 rounded-lg flex-1 sm:flex-none sm:w-28"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
