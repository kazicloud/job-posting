import Link from "next/link";
import { Briefcase } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  postedAt: string;
}

interface JobListItemProps {
  job: Job;
}

export function JobListItem({ job }: JobListItemProps) {
  return (
    <article className="bg-white border border-neutral-border rounded-lg p-6 hover:border-neutral-text-muted transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-text mb-2">
            {job.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-text-secondary mb-3">
            <span className="font-medium">{job.company}</span>
            <span className="text-neutral-text-muted">•</span>
            <span>{job.location}</span>
            <span className="text-neutral-text-muted">•</span>
            <span>{job.type}</span>
          </div>

          <p className="text-sm text-neutral-text-secondary line-clamp-2 mb-4">
            {job.description}
          </p>

          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/jobs/${job.id}`}
              className="text-sm font-medium text-brand-orange hover:text-brand-orange/80"
            >
              View Details
            </Link>
            <span className="text-xs text-neutral-text-muted">{job.postedAt}</span>
          </div>
        </div>

        <button className="px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90 transition-colors flex-shrink-0">
          Apply
        </button>
      </div>
    </article>
  );
}

interface JobListProps {
  jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-neutral-border rounded-lg p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-12 h-12 bg-neutral-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-neutral-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-text mb-2">
            No jobs found
          </h3>
          <p className="text-sm text-neutral-text-secondary">
            Check back later for new opportunities that match your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobListItem key={job.id} job={job} />
      ))}
    </div>
  );
}
