interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-neutral-border rounded-lg p-5">
      <p className="text-sm text-neutral-text-secondary mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-neutral-text">{value}</p>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? "text-green-600" : "text-neutral-text-muted"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: Array<{
    label: string;
    value: string | number;
    trend?: { value: string; positive: boolean };
  }>;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
