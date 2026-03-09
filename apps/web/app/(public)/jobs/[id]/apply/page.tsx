import Link from "next/link";

export default function ApplyPage({ params }: { params: { id: string } }) {
  return (
    <div className="bg-neutral-bg-secondary min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/jobs"
          className="inline-flex items-center text-neutral-text-secondary hover:text-neutral-text mb-6"
        >
          ← Back to jobs
        </Link>

        <div className="bg-white rounded-lg border border-neutral-border p-8 text-center">
          <p className="text-neutral-text-secondary">
            Please sign in to apply for jobs
          </p>
        </div>
      </div>
    </div>
  );
}
