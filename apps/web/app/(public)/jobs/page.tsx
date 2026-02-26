import { Input } from "@repo/ui/input";
import { JobCard } from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";

// Mock data - will be replaced with Convex queries
const mockJobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    companyName: "TechCorp",
    location: "Nairobi, Kenya",
    type: "full_time",
    remote: true,
    salaryMin: 120000,
    salaryMax: 180000,
    currency: "USD",
    createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
  },
  {
    id: "2",
    title: "Product Designer",
    companyName: "DesignHub",
    location: "Lagos, Nigeria",
    type: "full_time",
    remote: false,
    salaryMin: 80000,
    salaryMax: 120000,
    currency: "USD",
    createdAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
  },
  {
    id: "3",
    title: "Data Analyst",
    companyName: "DataCo",
    location: "Kigali, Rwanda",
    type: "contract",
    remote: true,
    salaryMin: 60000,
    salaryMax: 90000,
    currency: "USD",
    createdAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
  },
  {
    id: "4",
    title: "Marketing Manager",
    companyName: "GrowthLabs",
    location: "Accra, Ghana",
    type: "full_time",
    remote: false,
    salaryMin: 70000,
    salaryMax: 100000,
    currency: "USD",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  },
];

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
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-neutral-text-secondary">
                {mockJobs.length} jobs found
              </p>
              <select className="text-sm border border-neutral-border rounded-md px-3 py-1.5 text-neutral-text">
                <option>Most Recent</option>
                <option>Salary: High to Low</option>
                <option>Salary: Low to High</option>
              </select>
            </div>

            <div className="space-y-4">
              {mockJobs.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
