import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";

interface ProfileCompletenessProps {
  percentage: number;
  missingItems: string[];
}

export function ProfileCompleteness({ percentage, missingItems }: ProfileCompletenessProps) {
  if (percentage === 100) {
    return (
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-text mb-1">
              Profile Complete
            </h3>
            <p className="text-sm text-neutral-text-secondary">
              Your profile is fully optimized for job matching.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-text mb-1">
            Complete Your Profile
          </h3>
          <p className="text-sm text-neutral-text-secondary">
            {percentage}% complete
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-sm font-medium text-brand-orange hover:text-brand-orange/80"
        >
          Update
        </Link>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-neutral-bg-secondary rounded-full h-2 mb-4">
        <div
          className="bg-brand-orange h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Missing items */}
      {missingItems.length > 0 && (
        <ul className="space-y-2">
          {missingItems.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-neutral-text-secondary">
              <Plus className="w-4 h-4 text-neutral-text-muted flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
