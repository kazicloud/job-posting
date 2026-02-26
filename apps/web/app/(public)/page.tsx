import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

export default function HomePage() {
  return (
    <div>
      <section className="bg-white border-b border-neutral-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-neutral-text mb-6 leading-tight">
              Find work that matters
            </h1>
            <p className="text-xl text-neutral-text-secondary mb-8">
              Connect with top employers and discover roles that match your skills and ambitions.
            </p>
            <div className="flex gap-3">
              <Input
                placeholder="Job title or keyword"
                className="flex-1 text-base"
              />
              <Button variant="primary" size="lg">
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-text">Recent Opportunities</h2>
            <Link
              href="/jobs"
              className="text-neutral-text-secondary hover:text-neutral-text"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Senior Software Engineer",
                company: "TechCorp",
                location: "Nairobi",
                type: "Full-time",
              },
              {
                title: "Product Designer",
                company: "DesignHub",
                location: "Lagos",
                type: "Full-time",
              },
              {
                title: "Data Analyst",
                company: "DataCo",
                location: "Remote",
                type: "Contract",
              },
            ].map((job, i) => (
              <Link
                key={i}
                href="/jobs"
                className="bg-white border border-neutral-border rounded-lg p-6 hover:border-neutral-text-muted transition-colors"
              >
                <h3 className="font-semibold text-neutral-text mb-2">{job.title}</h3>
                <p className="text-neutral-text-secondary mb-3">{job.company}</p>
                <div className="flex gap-2 text-sm text-neutral-text-muted">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.type}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-neutral-text mb-3">
                For Job Seekers
              </h3>
              <p className="text-neutral-text-secondary mb-4">
                Browse curated opportunities from verified employers. Apply with confidence.
              </p>
              <Link href="/jobs" className="text-brand-orange hover:underline">
                Explore jobs →
              </Link>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-text mb-3">
                For Employers
              </h3>
              <p className="text-neutral-text-secondary mb-4">
                Reach qualified candidates. Streamline your hiring process.
              </p>
              <Link href="/post-job" className="text-brand-orange hover:underline">
                Post a job →
              </Link>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-text mb-3">
                Trusted Platform
              </h3>
              <p className="text-neutral-text-secondary mb-4">
                Built for transparency, efficiency, and meaningful connections.
              </p>
              <Link href="/about" className="text-brand-orange hover:underline">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
