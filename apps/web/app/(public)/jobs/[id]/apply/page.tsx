import { ApplicationForm } from "@/components/application-form";
import Link from "next/link";

// Mock data
const mockJob = {
  id: "1",
  title: "Senior Software Engineer",
  companyName: "TechCorp",
};

export default function ApplyPage({ params }: { params: { id: string } }) {
  return (
    <div className="bg-neutral-bg-secondary min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/jobs/${params.id}`}
          className="inline-flex items-center text-neutral-text-secondary hover:text-neutral-text mb-6"
        >
          ← Back to job
        </Link>

        <ApplicationForm jobId={params.id} jobTitle={mockJob.title} />
      </div>
    </div>
  );
}
