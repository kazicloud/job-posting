"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { TrendingUp, TrendingDown, Eye, Users, Briefcase, Target, Clock, MapPin, Award, Download, Calendar, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

type TimePeriod = "7d" | "30d" | "90d" | "all" | "custom";

export default function EmployerAnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  
  // Get employer's jobs
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const employerJobs = useQuery(
    api.jobs.listByEmployer,
    profile?.primaryRole === "employer" && profile._id ? { employerId: profile._id } : "skip"
  );

  // Set default to newest job on load
  const [hasSetDefault, setHasSetDefault] = useState(false);
  if (employerJobs && employerJobs.length > 0 && !hasSetDefault && selectedJobId === "all") {
    const newestJob = employerJobs.sort((a, b) => b._creationTime - a._creationTime)[0];
    if (newestJob) {
      setSelectedJobId(newestJob._id);
      setHasSetDefault(true);
    }
  }
  
  // Prepare query parameters with job filter
  const queryParams = selectedJobId === "all"
    ? (timePeriod === "custom" && customDateRange.from && customDateRange.to
        ? {
            timePeriod: "custom",
            fromDate: new Date(customDateRange.from).getTime(),
            toDate: new Date(customDateRange.to).setHours(23, 59, 59, 999),
          }
        : { timePeriod })
    : (timePeriod === "custom" && customDateRange.from && customDateRange.to
        ? {
            timePeriod: "custom",
            fromDate: new Date(customDateRange.from).getTime(),
            toDate: new Date(customDateRange.to).setHours(23, 59, 59, 999),
            jobId: selectedJobId,
          }
        : { timePeriod, jobId: selectedJobId });
  
  const employerAnalytics = useQuery(api.analytics.getEmployerAnalytics, queryParams);
  const isLoading = employerAnalytics === undefined;

  const handleCustomDateApply = () => {
    if (customDateRange.from && customDateRange.to) {
      setTimePeriod("custom");
      setShowDatePicker(false);
    }
  };

  const formatDateRange = () => {
    if (timePeriod === "custom" && customDateRange.from && customDateRange.to) {
      const from = new Date(customDateRange.from).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const to = new Date(customDateRange.to).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${from} - ${to}`;
    }
    return null;
  };

  return (
    <EmployerDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-text mb-1 sm:mb-2">Analytics</h1>
          <p className="text-sm sm:text-base text-neutral-text-secondary">Track your hiring performance and insights</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-text-secondary">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Period:</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-border rounded-lg p-1 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setTimePeriod("7d")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                timePeriod === "7d"
                  ? "bg-neutral-text text-white"
                  : "text-neutral-text hover:bg-neutral-bg-secondary"
              }`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => setTimePeriod("30d")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                timePeriod === "30d"
                  ? "bg-neutral-text text-white"
                  : "text-neutral-text hover:bg-neutral-bg-secondary"
              }`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => setTimePeriod("90d")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                timePeriod === "90d"
                  ? "bg-neutral-text text-white"
                  : "text-neutral-text hover:bg-neutral-bg-secondary"
              }`}
            >
              Last 90 days
            </button>
            <button
              onClick={() => setTimePeriod("all")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                timePeriod === "all"
                  ? "bg-neutral-text text-white"
                  : "text-neutral-text hover:bg-neutral-bg-secondary"
              }`}
            >
              All time
            </button>
            <button
              onClick={() => setShowDatePicker(true)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
                timePeriod === "custom"
                  ? "bg-neutral-text text-white"
                  : "text-neutral-text hover:bg-neutral-bg-secondary"
              }`}
            >
              <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              {timePeriod === "custom" ? formatDateRange() : "Custom"}
            </button>
          </div>
        </div>

        {/* Custom Date Picker Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-text">Select Date Range</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-neutral-bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-text-muted" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.from}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                    max={customDateRange.to || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.to}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                    min={customDateRange.from}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-text bg-white border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomDateApply}
                  disabled={!customDateRange.from || !customDateRange.to}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-orange rounded-md hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Filter */}
        <div className="bg-white border border-neutral-border rounded-lg p-3 sm:p-4 mb-6">
          <label className="block text-xs sm:text-sm font-semibold text-neutral-text mb-2">
            Viewing analytics for:
          </label>
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 border border-neutral-border rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white appearance-none cursor-pointer hover:border-brand-orange/50 transition-colors"
            >
              {employerJobs?.sort((a, b) => b._creationTime - a._creationTime).map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
              <option value="all">All Jobs (Aggregate)</option>
            </select>
            <Briefcase className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-brand-orange pointer-events-none" />
            <svg className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-neutral-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Key Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <MetricCard
              icon={<Users className="w-5 h-5" />}
              label="Applications"
              value={employerAnalytics?.totalApplications?.toString() || "0"}
              change={0}
              changeLabel="vs last period"
              iconBg="bg-green-50"
              iconColor="text-green-600"
            />
            <MetricCard
              icon={<Eye className="w-5 h-5" />}
              label="Total Views"
              value={employerAnalytics?.totalViews?.toString() || "0"}
              change={0}
              changeLabel="vs last period"
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
            />
            <MetricCard
              icon={<Award className="w-5 h-5" />}
              label="Shortlisted"
              value={employerAnalytics?.totalShortlisted?.toString() || "0"}
              change={0}
              changeLabel="vs last period"
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            {selectedJobId === "all" ? (
              <MetricCard
                icon={<Briefcase className="w-5 h-5" />}
                label="Active Jobs"
                value={employerAnalytics?.totalJobs?.toString() || "0"}
                change={0}
                changeLabel="vs last period"
                iconBg="bg-orange-50"
                iconColor="text-brand-orange"
              />
            ) : (
              <MetricCard
                icon={<Clock className="w-5 h-5" />}
                label="Avg Response Time"
                value={
                  employerAnalytics?.avgResponseTimeMs
                    ? `${Math.round(employerAnalytics.avgResponseTimeMs / (1000 * 60 * 60 * 24))}d`
                    : "N/A"
                }
                change={0}
                changeLabel="vs last period"
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />
            )}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Applications Over Time */}
          <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-border">
              <h3 className="text-lg font-semibold text-neutral-text">Applications Over Time</h3>
              <p className="text-sm text-neutral-text-secondary mt-0.5">Track application trends</p>
            </div>
            {isLoading ? (
              <div className="p-6">
                <ChartSkeleton />
              </div>
            ) : (
              <div className="p-6">
                <div className="h-64 flex items-center justify-center text-neutral-text-secondary">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-neutral-bg-secondary rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-neutral-text-muted" />
                    </div>
                    <h4 className="text-base font-semibold text-neutral-text mb-2">No data available yet</h4>
                    <p className="text-sm text-neutral-text-secondary">
                      Data will appear once you start receiving applications
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Performing Jobs */}
          <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-border">
              <h3 className="text-lg font-semibold text-neutral-text">Top Performing Jobs</h3>
              <p className="text-sm text-neutral-text-secondary mt-0.5">Jobs with most applications</p>
            </div>
            {isLoading ? (
              <div className="p-6">
                <ChartSkeleton />
              </div>
            ) : (
              <div className="p-6">
                <div className="h-64 flex items-center justify-center text-neutral-text-secondary">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-neutral-bg-secondary rounded-full flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-neutral-text-muted" />
                    </div>
                    <h4 className="text-base font-semibold text-neutral-text mb-2">No jobs posted yet</h4>
                    <p className="text-sm text-neutral-text-secondary">
                      Post your first job to see performance metrics
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Sources */}
          <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-border">
              <h3 className="text-lg font-semibold text-neutral-text">Application Sources</h3>
              <p className="text-sm text-neutral-text-secondary mt-0.5">Where candidates find you</p>
            </div>
            {isLoading ? (
              <div className="p-6">
                <InsightSkeleton />
              </div>
            ) : (
              <div className="p-6">
                {/* Show empty state only if all values are 0 */}
                {0 + 0 + 0 + 0 === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-neutral-bg-secondary rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-neutral-text-muted" />
                    </div>
                    <p className="text-sm text-neutral-text-secondary">
                      No application data yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <SourceItem label="Direct" value={0} total={employerAnalytics?.totalApplications || 1} color="bg-blue-500" />
                    <SourceItem label="LinkedIn" value={0} total={employerAnalytics?.totalApplications || 1} color="bg-purple-500" />
                    <SourceItem label="Job Boards" value={0} total={employerAnalytics?.totalApplications || 1} color="bg-green-500" />
                    <SourceItem label="Referrals" value={0} total={employerAnalytics?.totalApplications || 1} color="bg-orange-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top Locations */}
          <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-border">
              <h3 className="text-lg font-semibold text-neutral-text">Top Locations</h3>
              <p className="text-sm text-neutral-text-secondary mt-0.5">Candidate locations</p>
            </div>
            {isLoading ? (
              <div className="p-6">
                <InsightSkeleton />
              </div>
            ) : (
              <div className="p-6">
                {/* Show empty state only if all location counts are 0 */}
                {0 + 0 + 0 + 0 === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-neutral-bg-secondary rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-neutral-text-muted" />
                    </div>
                    <p className="text-sm text-neutral-text-secondary">
                      No location data yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <LocationItem location="Nairobi" count={0} />
                    <LocationItem location="Mombasa" count={0} />
                    <LocationItem location="Kisumu" count={0} />
                    <LocationItem location="Nakuru" count={0} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Candidate Quality */}
          <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-border">
              <h3 className="text-lg font-semibold text-neutral-text">Candidate Quality</h3>
              <p className="text-sm text-neutral-text-secondary mt-0.5">Qualification distribution</p>
            </div>
            {isLoading ? (
              <div className="p-6">
                <InsightSkeleton />
              </div>
            ) : (
              <div className="p-6">
                {/* Show empty state only if all percentages are 0 */}
                {0 + 0 + 0 === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-neutral-bg-secondary rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-neutral-text-muted" />
                    </div>
                    <p className="text-sm text-neutral-text-secondary">
                      No quality data yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <QualityMetric label="Highly Qualified" percentage={0} color="bg-green-500" />
                    <QualityMetric label="Qualified" percentage={0} color="bg-blue-500" />
                    <QualityMetric label="Under Qualified" percentage={0} color="bg-yellow-500" />
                  </div>
                )}
              </div>
            )}
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
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  iconBg: string;
  iconColor: string;
}) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-4 sm:p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-neutral-text mb-1">{value}</p>
      <p className="text-xs sm:text-sm text-neutral-text-secondary font-medium">{label}</p>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-border rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-8 sm:h-9 bg-gray-200 rounded w-20 sm:w-24 mb-1"></div>
      <div className="h-4 sm:h-5 bg-gray-200 rounded w-24 sm:w-32"></div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-64 animate-pulse space-y-3">
      <div className="flex items-end justify-between h-full gap-2">
        {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
          <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${height}%` }}></div>
        ))}
      </div>
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-8"></div>
        ))}
      </div>
    </div>
  );
}

function InsightSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      ))}
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
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-neutral-text font-medium">{label}</span>
        <span className="text-neutral-text-secondary font-semibold">{value}</span>
      </div>
      <div className="h-2.5 bg-neutral-bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`} 
          style={{ width: percentage > 0 ? `${percentage}%` : '0%' }} 
        />
      </div>
    </div>
  );
}

function LocationItem({ location, count }: { location: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-border last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-neutral-bg-secondary rounded-full flex items-center justify-center">
          <MapPin className="w-4 h-4 text-neutral-text-muted" />
        </div>
        <span className="text-sm text-neutral-text font-medium">{location}</span>
      </div>
      <span className="text-sm text-neutral-text-secondary font-semibold">{count}</span>
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
        <span className="text-neutral-text font-medium">{label}</span>
        <span className="text-neutral-text-secondary font-semibold">{percentage}%</span>
      </div>
      <div className="h-2.5 bg-neutral-bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}
