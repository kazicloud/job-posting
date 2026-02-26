"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { TrendingUp, TrendingDown, Eye, Users, Briefcase, Target, Clock, MapPin, Award } from "lucide-react";

export default function EmployerAnalyticsPage() {
  return (
    <EmployerDashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-text mb-2">Analytics</h1>
          <p className="text-neutral-text-secondary">Track your hiring performance and insights</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center gap-3 mb-6">
          <button className="px-4 py-2 text-sm font-medium text-neutral-text bg-white border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors">
            Last 7 days
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-neutral-text rounded-md">
            Last 30 days
          </button>
          <button className="px-4 py-2 text-sm font-medium text-neutral-text bg-white border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors">
            Last 90 days
          </button>
          <button className="px-4 py-2 text-sm font-medium text-neutral-text bg-white border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors">
            All time
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Eye className="w-5 h-5" />}
            label="Total Views"
            value="0"
            change={0}
            changeLabel="vs last period"
          />
          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Applications"
            value="0"
            change={0}
            changeLabel="vs last period"
          />
          <MetricCard
            icon={<Target className="w-5 h-5" />}
            label="Conversion Rate"
            value="0%"
            change={0}
            changeLabel="vs last period"
          />
          <MetricCard
            icon={<Clock className="w-5 h-5" />}
            label="Avg. Time to Hire"
            value="0 days"
            change={0}
            changeLabel="vs last period"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Applications Over Time */}
          <div className="bg-white border border-neutral-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Applications Over Time</h3>
            <div className="h-64 flex items-center justify-center text-neutral-text-secondary">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-neutral-text-muted" />
                <p>No data available yet</p>
              </div>
            </div>
          </div>

          {/* Top Performing Jobs */}
          <div className="bg-white border border-neutral-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Top Performing Jobs</h3>
            <div className="h-64 flex items-center justify-center text-neutral-text-secondary">
              <div className="text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-neutral-text-muted" />
                <p>No jobs posted yet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Sources */}
          <div className="bg-white border border-neutral-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Application Sources</h3>
            <div className="space-y-3">
              <SourceItem label="Direct" value={0} total={0} color="bg-blue-500" />
              <SourceItem label="LinkedIn" value={0} total={0} color="bg-purple-500" />
              <SourceItem label="Job Boards" value={0} total={0} color="bg-green-500" />
              <SourceItem label="Referrals" value={0} total={0} color="bg-orange-500" />
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white border border-neutral-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Top Locations</h3>
            <div className="space-y-3">
              <LocationItem location="Nairobi" count={0} />
              <LocationItem location="Mombasa" count={0} />
              <LocationItem location="Kisumu" count={0} />
              <LocationItem location="Nakuru" count={0} />
            </div>
          </div>

          {/* Candidate Quality */}
          <div className="bg-white border border-neutral-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Candidate Quality</h3>
            <div className="space-y-4">
              <QualityMetric label="Highly Qualified" percentage={0} color="bg-green-500" />
              <QualityMetric label="Qualified" percentage={0} color="bg-blue-500" />
              <QualityMetric label="Under Qualified" percentage={0} color="bg-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  changeLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center text-brand-orange">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-neutral-text mb-1">{value}</p>
      <p className="text-sm text-neutral-text-secondary mb-2">{label}</p>
      <div className="flex items-center gap-1 text-xs">
        {change !== 0 && (
          <>
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              {Math.abs(change)}%
            </span>
          </>
        )}
        <span className="text-neutral-text-muted">{changeLabel}</span>
      </div>
    </div>
  );
}

function SourceItem({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-neutral-text">{label}</span>
        <span className="text-neutral-text-secondary">{value}</span>
      </div>
      <div className="h-2 bg-neutral-bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function LocationItem({ location, count }: { location: string; count: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-neutral-text-muted" />
        <span className="text-neutral-text">{location}</span>
      </div>
      <span className="text-neutral-text-secondary font-medium">{count}</span>
    </div>
  );
}

function QualityMetric({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-neutral-text">{label}</span>
        <span className="text-neutral-text-secondary font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-neutral-bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
