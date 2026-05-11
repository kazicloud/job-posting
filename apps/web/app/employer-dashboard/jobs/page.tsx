"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Eye, Users, Clock, MapPin, DollarSign, Briefcase, ChevronDown, AlertTriangle, Archive, TimerOff } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function EmployerJobsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "draft" | "closed" | "archived" | "expired" | "flagged">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alphabetical" | "views" | "applications">("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [paginationOpts, setPaginationOpts] = useState({ numItems: 50, cursor: null as string | null });
  
  const result = useQuery(api.jobs.list, { paginationOpts, sortBy });
  const allJobs = result?.page || [];
  const activeJobs = allJobs.filter(job => job.status === "published" && !job.flagged);
  const draftJobs = allJobs.filter(job => job.status === "draft" && !job.flagged);
  const closedJobs = allJobs.filter(job => job.status === "closed" && !job.flagged);
  const archivedJobs = allJobs.filter(job => job.status === "archived" && !job.flagged);
  const expiredJobs = allJobs.filter(job => job.status === "expired" && !job.flagged);
  const flaggedJobs = allJobs.filter(job => job.flagged === true);

  const tabJobMap = {
    active: activeJobs,
    draft: draftJobs,
    closed: closedJobs,
    archived: archivedJobs,
    expired: expiredJobs,
    flagged: flaggedJobs,
  };

  const allDisplayJobs = tabJobMap[activeTab];
  const displayJobs = searchQuery.trim()
    ? allDisplayJobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : allDisplayJobs;
  
  const isLoading = result === undefined;

  const loadMore = () => {
    if (result && result.continueCursor !== null) {
      setPaginationOpts({ numItems: 10, cursor: result.continueCursor });
    }
  };

  return (
    <EmployerDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-text mb-1 sm:mb-2">Job Postings</h1>
            <p className="text-sm sm:text-base text-neutral-text-secondary">Manage and track your job listings</p>
          </div>
          <Link
            href="/employer-dashboard/jobs/new"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Post New Job</span>
            <span className="sm:hidden">New Job</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-neutral-border mb-4 sm:mb-6 -mx-4 sm:mx-0">
          <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
            {([
              { key: "active", label: "Active", count: activeJobs.length },
              { key: "draft", label: "Drafts", count: draftJobs.length },
              { key: "closed", label: "Closed", count: closedJobs.length },
              { key: "archived", label: "Archived", count: archivedJobs.length },
              { key: "expired", label: "Expired", count: expiredJobs.length },
              { key: "flagged", label: "Flagged", count: flaggedJobs.length },
            ] as const).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-3 sm:pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === key
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                {key === "flagged" && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                {label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    key === "flagged"
                      ? "bg-red-100 text-red-700"
                      : activeTab === key
                      ? "bg-neutral-text text-white"
                      : "bg-neutral-bg-secondary text-neutral-text-secondary"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white border border-neutral-border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2 px-4 py-2 sm:py-2.5 border border-neutral-border rounded-md text-sm font-medium text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Sort: {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : sortBy === "views" ? "Most Viewed" : sortBy === "applications" ? "Most Applied" : "A-Z"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                  <div className="fixed sm:absolute right-4 sm:right-0 top-[180px] sm:top-full sm:mt-2 w-48 bg-white border border-neutral-border rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => { setSortBy("newest"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                        sortBy === "newest" ? "text-brand-orange font-medium" : "text-neutral-text"
                      }`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => { setSortBy("oldest"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                        sortBy === "oldest" ? "text-brand-orange font-medium" : "text-neutral-text"
                      }`}
                    >
                      Oldest First
                    </button>
                    <button
                      onClick={() => { setSortBy("views"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                        sortBy === "views" ? "text-brand-orange font-medium" : "text-neutral-text"
                      }`}
                    >
                      Most Viewed
                    </button>
                    <button
                      onClick={() => { setSortBy("applications"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                        sortBy === "applications" ? "text-brand-orange font-medium" : "text-neutral-text"
                      }`}
                    >
                      Most Applied
                    </button>
                    <button
                      onClick={() => { setSortBy("alphabetical"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                        sortBy === "alphabetical" ? "text-brand-orange font-medium" : "text-neutral-text"
                      }`}
                    >
                      Alphabetical (A-Z)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            /* Loading Skeletons */
            <>
              {[1, 2, 3].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </>
          ) : displayJobs.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-neutral-border rounded-lg p-8 sm:p-12 text-center">
              {activeTab === "flagged" ? (
                <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-red-400" />
              ) : activeTab === "archived" ? (
                <Archive className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-neutral-text-muted" />
              ) : activeTab === "expired" ? (
                <TimerOff className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-neutral-text-muted" />
              ) : (
                <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-neutral-text-muted" />
              )}
              <h3 className="text-base sm:text-lg font-semibold text-neutral-text mb-2">
                {activeTab === "active" ? "No active jobs" :
                 activeTab === "draft" ? "No drafts" :
                 activeTab === "closed" ? "No closed jobs" :
                 activeTab === "archived" ? "No archived jobs" :
                 activeTab === "expired" ? "No expired jobs" :
                 "No flagged jobs"}
              </h3>
              <p className="text-sm sm:text-base text-neutral-text-secondary mb-4 sm:mb-6">
                {activeTab === "active"
                  ? "Start attracting top talent by posting your first job"
                  : activeTab === "draft"
                  ? "Jobs saved as drafts will appear here"
                  : activeTab === "closed"
                  ? "Jobs you've closed will appear here"
                  : activeTab === "archived"
                  ? "Archived jobs are hidden from candidates but preserved for records"
                  : activeTab === "expired"
                  ? "Jobs that passed their expiry date will appear here — you can republish them"
                  : "Jobs flagged by admins for policy review will appear here"}
              </p>
              {activeTab === "active" && (
                <Link
                  href="/employer-dashboard/jobs/new"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90"
                >
                  <Plus className="w-5 h-5" />
                  Post Your First Job
                </Link>
              )}
            </div>
          ) : (
            <>
              {displayJobs.map((job) => (
                <JobCard
                  key={job._id}
                  jobId={job._id}
                  title={job.title}
                  location={job.location}
                  type={job.employmentType}
                  salary={
                    job.salaryDisclosure === "range" && job.salaryMin && job.salaryMax
                      ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                      : job.salaryDisclosure === "negotiable"
                      ? "Competitive salary"
                      : "To be discussed"
                  }
                  postedDate={new Date(job.createdAt).toLocaleDateString()}
                  status={job.status}
                  flagged={job.flagged}
                  flagReason={job.flagReason}
                />
              ))}
              
              {result && result.continueCursor !== null && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 border border-neutral-border text-neutral-text rounded-md hover:bg-neutral-bg-secondary transition-colors"
                  >
                    Load More Jobs
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

function JobCard({
  jobId,
  title,
  location,
  type,
  salary,
  postedDate,
  status,
  flagged,
  flagReason,
}: {
  jobId: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  status: "published" | "draft" | "closed" | "archived" | "expired";
  flagged?: boolean;
  flagReason?: string;
}) {
  // Fetch real analytics for this job
  const analytics = useQuery(api.analytics.getJobAnalytics, { jobId: jobId as any });
  
  const views = analytics?.viewCount || 0;
  const applications = analytics?.applicationCount || 0;

  const statusConfig: Record<string, { label: string; className: string }> = {
    published: { label: "Active", className: "bg-green-50 text-green-700" },
    draft: { label: "Draft", className: "bg-yellow-50 text-yellow-700" },
    closed: { label: "Closed", className: "bg-gray-50 text-gray-600" },
    archived: { label: "Archived", className: "bg-slate-100 text-slate-600" },
    expired: { label: "Expired", className: "bg-red-50 text-red-600" },
  };
  const statusInfo = statusConfig[status] ?? { label: status, className: "bg-gray-50 text-gray-600" };

  // LinkedIn-style edit: always allowed, but show informational note for published jobs
  const canEdit = status !== "archived";
  
  return (
    <div className={`bg-white border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow ${flagged ? "border-red-200" : "border-neutral-border"}`}>
      {/* Flagged admin notice */}
      {flagged && (
        <div className="flex items-start gap-2 mb-3 p-3 bg-red-50 rounded-md border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-700">Flagged for review by admin</p>
            {flagReason && <p className="text-xs text-red-600 mt-0.5">{flagReason}</p>}
          </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Link
              href={`/employer-dashboard/jobs/${jobId}/preview`}
              className="text-base sm:text-lg font-semibold text-neutral-text hover:text-brand-orange truncate"
            >
              {title}
            </Link>
            <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-medium rounded-full flex-shrink-0 ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate max-w-[100px] sm:max-w-none">{location}</span>
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
              {type}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {salary}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              {postedDate}
            </span>
          </div>
        </div>
        <button className="p-1.5 sm:p-2 hover:bg-neutral-bg-secondary rounded-md transition-colors flex-shrink-0">
          <MoreVertical className="w-5 h-5 text-neutral-text-secondary" />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-neutral-border">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-text-muted" />
          <span className="text-neutral-text-secondary">
            <span className="font-semibold text-neutral-text">{views}</span> views
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-text-muted" />
          <span className="text-neutral-text-secondary">
            <span className="font-semibold text-neutral-text">{applications}</span> applications
          </span>
        </div>
        <div className="ml-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Link
            href={`/employer-dashboard/jobs/${jobId}/preview`}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors text-center flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Link>
          {canEdit ? (
            <Link
              href={`/employer-dashboard/jobs/${jobId}/edit`}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors text-center"
            >
              Edit
            </Link>
          ) : (
            <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-neutral-text-muted border border-neutral-border rounded-md opacity-50 cursor-not-allowed text-center">
              Edit
            </span>
          )}
          <Link
            href={`/employer-dashboard/applications?jobId=${jobId}`}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-neutral-text rounded-md hover:bg-neutral-text/90 transition-colors text-center"
          >
            View Applications
          </Link>
        </div>
      </div>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-border rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            {/* Title */}
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-48 sm:w-64"></div>
            {/* Status Badge */}
            <div className="h-5 sm:h-6 bg-gray-200 rounded-full w-14 sm:w-16"></div>
          </div>
          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
            </div>
          </div>
        </div>
        {/* More Menu Button */}
        <div className="w-9 h-9 bg-gray-200 rounded-md"></div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-neutral-border">
        {/* Views */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16"></div>
        </div>
        {/* Applications */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
        </div>
        {/* Action Buttons */}
        <div className="ml-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="h-8 sm:h-9 bg-gray-200 rounded-md"></div>
          <div className="h-8 sm:h-9 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
