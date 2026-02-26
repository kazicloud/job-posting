import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { Clipboard } from "lucide-react";

export default function MyWorkPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <PageHeader
          title="My Work"
          description="Contracts, engagements, and work history"
        />

        {/* Empty State */}
        <div className="bg-white border border-neutral-border rounded-lg p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-neutral-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Clipboard className="w-8 h-8 text-neutral-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-text mb-2">
              No Active Work
            </h3>
            <p className="text-sm text-neutral-text-secondary mb-6">
              Your contracts and work engagements will appear here once you start working.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
