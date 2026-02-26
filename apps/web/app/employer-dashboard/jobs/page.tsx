"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Eye, Users, Clock, MapPin, DollarSign, Briefcase } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function EmployerJobsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "draft" | "closed">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationOpts, setPaginationOpts] = useState({ numItems: 10, cursor: null as string | null });
  
  const result = useQuery(api.jobs.list, { paginationOpts });
  const allJobs = result?.page || [];
  const activeJobs = allJobs.filter(job => job.status === "published");
  const draftJobs = allJobs.filter(job => job.status === "draft");
  const closedJobs = allJobs.filter(job => job.status === "closed");

  const displayJobs = activeTab === "active" ? activeJobs : activeTab === "draft" ? draftJobs : closedJobs;
  const isLoading = result === undefined;

  const loadMore = () => {
    if (result && !result.isDone) {
      setPaginationOpts({ numItems: 10, cursor: result.continueCursor });
    }
  };

  return (
    <EmployerDashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-text mb-2">Job Postings</h1>
            <p className="text-neutral-text-secondary">Manage and track your job listings</p>
          </div>
          <Link
            href="/employer-dashboard/jobs/new"
            className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-neutral-border mb-6">
          <div className="flex items-center gap-8 px-6">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "active"
                  ? "border-neutral-text text-neutral-text"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              Active ({activeJobs.length})
            </button>
            <button
              onClick={() => setActiveTab("draft")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "draft"
                  ? "border-neutral-text text-neutral-text"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              Drafts ({draftJobs.length})
            </button>
            <button
              onClick={() => setActiveTab("closed")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "closed"
                  ? "border-neutral-text text-neutral-text"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              Closed ({closedJobs.length})
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-neutral-border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-border rounded-md text-sm font-medium text-neutral-text hover:bg-neutral-bg-secondary transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {isLoading ? (
            /* Loading Skeletons */
            <>
              {[1, 2, 3].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </>
          ) : displayJobs.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-neutral-border rounded-lg p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-neutral-text-muted" />
              <h3 className="text-lg font-semibold text-neutral-text mb-2">
                {activeTab === "active" ? "No active jobs" : activeTab === "draft" ? "No drafts" : "No closed jobs"}
              </h3>
              <p className="text-neutral-text-secondary mb-6">
                {activeTab === "active" 
                  ? "Start attracting top talent by posting your first job"
                  : activeTab === "draft"
                  ? "Draft jobs will appear here"
                  : "Closed jobs will appear here"}
              </p>
              {activeTab === "active" && (
                <Link
                  href="/employer-dashboard/jobs/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90"
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
                />
              ))}
              
              {result && !result.isDone && (
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
}: {
  jobId: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  status: "published" | "draft" | "closed" | "archived";
}) {
  // Fetch real analytics for this job
  const analytics = useQuery(api.analytics.getJobAnalytics, { jobId: jobId as any });
  
  const views = analytics?.viewCount || 0;
  const applications = analytics?.applicationCount || 0;
  const statusDisplay = status === "published" ? "active" : status;
  const canEdit = status === "draft" || applications < 10;
  
  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-neutral-text hover:text-brand-orange cursor-pointer">
              {title}
            </h3>
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                statusDisplay === "active"
                  ? "bg-green-50 text-green-700"
                  : statusDisplay === "draft"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              {statusDisplay.charAt(0).toUpperCase() + statusDisplay.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {type}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {salary}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {postedDate}
            </span>
          </div>
        </div>
        <button className="p-2 hover:bg-neutral-bg-secondary rounded-md transition-colors">
          <MoreVertical className="w-5 h-5 text-neutral-text-secondary" />
        </button>
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-neutral-border">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4 text-neutral-text-muted" />
          <span className="text-neutral-text-secondary">
            <span className="font-semibold text-neutral-text">{views}</span> views
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-neutral-text-muted" />
          <span className="text-neutral-text-secondary">
            <span className="font-semibold text-neutral-text">{applications}</span> applications
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {canEdit ? (
            <Link
              href={`/employer-dashboard/jobs/${jobId}/edit`}
              className="px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors"
            >
              Edit
            </Link>
          ) : (
            <div className="relative group">
              <button
                disabled
                className="px-4 py-2 text-sm font-medium text-neutral-text-muted border border-neutral-border rounded-md opacity-50 cursor-not-allowed"
              >
                Edit
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-text text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Cannot edit job with 10+ applications
              </div>
            </div>
          )}
          <Link
            href={`/employer-dashboard/applications?jobId=${jobId}`}
            className="px-4 py-2 text-sm font-medium text-white bg-neutral-text rounded-md hover:bg-neutral-text/90 transition-colors"
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
    <div className="bg-white border border-neutral-border rounded-lg p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Title */}
            <div className="h-6 bg-gray-200 rounded w-64"></div>
            {/* Status Badge */}
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
          {/* Meta Info Row */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
        {/* More Menu Button */}
        <div className="w-9 h-9 bg-gray-200 rounded-md"></div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center gap-6 pt-4 border-t border-neutral-border">
        {/* Views */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        {/* Applications */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        {/* Action Buttons */}
        <div className="ml-auto flex items-center gap-2">
          <div className="h-9 bg-gray-200 rounded-md w-16"></div>
          <div className="h-9 bg-gray-200 rounded-md w-36"></div>
        </div>
      </div>
    </div>
  );
}
