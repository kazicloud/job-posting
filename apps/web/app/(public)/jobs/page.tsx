import { Input } from "@repo/ui/input";
import { JobFilters } from "@/components/job-filters";

export default function JobsPage() {
  return (
    <div className="bg-neutral-bg-secondary min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-text mb-4">Find Your Next Role</h1>
          <div className="max-w-2xl">
            <Input
              placeholder="Search jobs by title, company, or keyword..."
              className="text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <JobFilters />
          </aside>

          <div className="lg:col-span-3">
            <div className="text-center py-16">
              <p className="text-neutral-text-secondary">
                Please sign in to view available jobs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
