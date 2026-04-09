import { MapPin, Clock } from 'lucide-react'

const categories = ['All', 'Remote', 'Hybrid', 'On-site']

const mockJobs = [
  {
    _id: '1',
    _creationTime: Date.now(),
    title: 'Senior Software Engineer',
    companyName: 'TechCorp',
    location: 'Nairobi, Kenya',
    workplaceType: 'Hybrid',
    salaryMin: 150000,
    salaryMax: 200000,
    currency: 'KES',
    requiredSkills: ['React', 'TypeScript', 'Node.js'],
  },
  {
    _id: '2',
    _creationTime: Date.now(),
    title: 'Product Designer',
    companyName: 'DesignHub',
    location: 'Remote',
    workplaceType: 'Remote',
    salaryMin: 120000,
    salaryMax: 180000,
    currency: 'KES',
    requiredSkills: ['Figma', 'UI/UX', 'Prototyping'],
  },
  {
    _id: '3',
    _creationTime: Date.now(),
    title: 'Data Analyst',
    companyName: 'DataCo',
    location: 'Mombasa, Kenya',
    workplaceType: 'On-site',
    salaryMin: 100000,
    salaryMax: 150000,
    currency: 'KES',
    requiredSkills: ['Python', 'SQL', 'Tableau'],
  },
]

export default function JobShowcase() {
  const jobs = mockJobs

  return (
    <section className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div className="flex-1 text-center">
            <span className="text-sm font-mono text-brand-orange tracking-wider uppercase">
              Latest Opportunities
            </span>
            <h2 className="text-5xl font-bold mt-4 leading-tight">
              Find your next role
            </h2>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_WEB_APP_URL}/jobs`}
            className="text-text-primary font-medium hover:text-brand-orange transition-colors inline-flex items-center gap-2"
          >
            View All Jobs
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className="px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap bg-white text-text-secondary hover:text-text-primary hover:shadow-sm"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Job Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <div className="col-span-full text-center py-12 text-text-muted">
              No jobs available at the moment
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl border border-border p-6 hover:border-brand-orange/50 transition-all hover:shadow-xl group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-orange/10 to-brand-orange/5 rounded-xl flex items-center justify-center text-text-primary font-bold text-lg">
                    {job.companyName?.charAt(0) || 'J'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="w-4 h-4" />
                    {new Date(job._creationTime).toLocaleDateString()}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-orange transition-colors mb-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-text-secondary">{job.companyName}</p>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">{job.location}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-neutral-secondary text-text-primary text-xs font-medium">
                      {job.workplaceType}
                    </span>
                  </div>

                  {(job.salaryMin || job.salaryMax) && (
                    <div className="text-base font-bold text-text-primary">
                      {job.currency} {job.salaryMin?.toLocaleString()}{job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : ''}
                    </div>
                  )}

                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full bg-neutral-secondary text-text-secondary text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <a
                  href={`${process.env.NEXT_PUBLIC_WEB_APP_URL}/jobs/${job._id}`}
                  className="block w-full py-3 text-center bg-brand-orange text-white font-medium rounded-full hover:bg-brand-orange/90 transition-colors"
                >
                  Apply Now
                </a>
              </div>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/jobs"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-text-primary text-white font-medium hover:bg-brand-orange transition-all hover:shadow-lg"
          >
            Browse All Opportunities
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
