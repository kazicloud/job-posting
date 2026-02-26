import Link from "next/link";
import { formatRelativeTime, formatCurrency } from "@repo/lib";

interface JobCardProps {
  id: string;
  title: string;
  companyName: string;
  location: string;
  type: string;
  remote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  createdAt: number;
}

export function JobCard({
  id,
  title,
  companyName,
  location,
  type,
  remote,
  salaryMin,
  salaryMax,
  currency = "USD",
  createdAt,
}: JobCardProps) {
  const typeLabel = type.replace("_", " ");
  const salary =
    salaryMin && salaryMax
      ? `${formatCurrency(salaryMin, currency)} - ${formatCurrency(salaryMax, currency)}`
      : null;

  return (
    <Link
      href={`/jobs/${id}`}
      className="block bg-white border border-neutral-border rounded-lg p-6 hover:border-neutral-text-muted transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-neutral-text mb-1">{title}</h3>
          <p className="text-neutral-text-secondary">{companyName}</p>
        </div>
        {salary && (
          <span className="text-sm font-medium text-neutral-text">{salary}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-neutral-text-muted">
        <span>{location}</span>
        <span>•</span>
        <span className="capitalize">{typeLabel}</span>
        {remote && (
          <>
            <span>•</span>
            <span>Remote</span>
          </>
        )}
        <span>•</span>
        <span>{formatRelativeTime(createdAt)}</span>
      </div>
    </Link>
  );
}
