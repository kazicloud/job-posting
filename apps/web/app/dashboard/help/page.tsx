import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/dashboard/page-header";

const resources = [
  {
    title: "Resume Writing Guide",
    description: "Learn how to craft a compelling resume that stands out",
    category: "Resources",
  },
  {
    title: "Interview Preparation",
    description: "Tips and strategies for acing your next interview",
    category: "Resources",
  },
  {
    title: "Career Coaching",
    description: "One-on-one sessions with experienced career coaches",
    category: "Coaching",
  },
  {
    title: "Salary Negotiation",
    description: "Master the art of negotiating your compensation",
    category: "Resources",
  },
];

export default function CareerHelpPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <PageHeader
          title="Career Help"
          description="Resources and coaching to advance your career"
        />

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="bg-white border border-neutral-border rounded-lg p-6 hover:border-neutral-text-muted transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-neutral-text-muted uppercase tracking-wider">
                  {resource.category}
                </span>
              </div>
              <h3 className="text-base font-semibold text-neutral-text mb-2">
                {resource.title}
              </h3>
              <p className="text-sm text-neutral-text-secondary">
                {resource.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
