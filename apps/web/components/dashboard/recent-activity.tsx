import { CheckCircle2, Eye, Bookmark } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "application" | "view" | "save";
  jobTitle: string;
  company: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white border border-neutral-border rounded-lg p-6">
        <h2 className="text-base font-semibold text-neutral-text mb-4">
          Recent Activity
        </h2>
        <p className="text-sm text-neutral-text-secondary text-center py-8">
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6">
      <h2 className="text-base font-semibold text-neutral-text mb-4">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <ActivityIcon type={activity.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-text">
                <span className="font-medium">{getActivityLabel(activity.type)}</span>{" "}
                {activity.jobTitle}
              </p>
              <p className="text-xs text-neutral-text-secondary mt-0.5">
                {activity.company} • {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getActivityLabel(type: ActivityItem["type"]): string {
  switch (type) {
    case "application":
      return "Applied to";
    case "view":
      return "Viewed";
    case "save":
      return "Saved";
  }
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center";
  
  switch (type) {
    case "application":
      return (
        <div className={`${baseClasses} bg-brand-orange/10`}>
          <CheckCircle2 className="w-4 h-4 text-brand-orange" />
        </div>
      );
    case "view":
      return (
        <div className={`${baseClasses} bg-neutral-bg-secondary`}>
          <Eye className="w-4 h-4 text-neutral-text-secondary" />
        </div>
      );
    case "save":
      return (
        <div className={`${baseClasses} bg-neutral-bg-secondary`}>
          <Bookmark className="w-4 h-4 text-neutral-text-secondary" />
        </div>
      );
  }
}
