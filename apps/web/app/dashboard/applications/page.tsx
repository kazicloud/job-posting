"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useState } from "react";
import { Building2, MapPin, Clock, Calendar, ExternalLink, MessageSquare, FileText, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "final" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "company" | "status">("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [paginationOpts, setPaginationOpts] = useState({ numItems: 10, cursor: null as string | null });

  // Fetch user's applications with pagination
  const applicationsData = useQuery(api.applications.myApplications, { paginationOpts });
  const isLoading = applicationsData === undefined;
  const applications = applicationsData?.page || [];
  const hasMore = applicationsData ? !applicationsData.isDone : false;

  const pendingCount = applications.filter(a => a.status === "submitted").length;
  const inProgressCount = applications.filter(a => ["under_review", "shortlisted"].includes(a.status)).length;
  const finalCount = applications.filter(a => a.status === "interview").length;
  const closedCount = applications.filter(a => ["accepted", "rejected"].includes(a.status)).length;

  // Filter applications
  let filteredApplications = applications.filter(app => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "pending" ? app.status === "submitted" :
      filter === "in_progress" ? ["under_review", "shortlisted"].includes(app.status) :
      filter === "final" ? app.status === "interview" :
      filter === "closed" ? ["accepted", "rejected"].includes(app.status) : true;

    const matchesSearch = !searchQuery || 
      app.job?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.companyName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Sort applications
  filteredApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b._creationTime - a._creationTime;
      case "oldest":
        return a._creationTime - b._creationTime;
      case "company":
        return (a.job?.companyName || "").localeCompare(b.job?.companyName || "");
      case "status":
        const statusOrder = ["interview", "shortlisted", "under_review", "submitted", "accepted", "rejected"];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      default:
        return 0;
    }
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary">
        {/* Header */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-neutral-text mb-1">
                  My Applications
                </h1>
                <p className="text-sm text-neutral-text-secondary">
                  Track and manage your job applications
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <button 
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Sort: {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : sortBy === "company" ? "Company" : "Status"}
                  </button>
                  
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                      <div className="fixed sm:absolute right-4 sm:right-0 top-[140px] sm:top-full sm:mt-2 w-48 bg-white border border-neutral-border rounded-lg shadow-lg z-50">
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
                        onClick={() => { setSortBy("company"); setShowSortMenu(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                          sortBy === "company" ? "text-brand-orange font-medium" : "text-neutral-text"
                        }`}
                      >
                        Company (A-Z)
                      </button>
                      <button
                        onClick={() => { setSortBy("status"); setShowSortMenu(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                          sortBy === "status" ? "text-brand-orange font-medium" : "text-neutral-text"
                        }`}
                      >
                        Status Priority
                      </button>
                    </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 sm:gap-6 border-b border-neutral-border -mb-px overflow-x-auto pb-px">
              <button
                onClick={() => setFilter("all")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === "all"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === "pending"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter("in_progress")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === "in_progress"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                onClick={() => setFilter("final")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === "final"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                Interview ({finalCount})
              </button>
              <button
                onClick={() => setFilter("closed")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === "closed"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                Closed ({closedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="space-y-4">
            {isLoading ? (
              // Loading Skeletons
              <>
                {[1, 2, 3].map((i) => (
                  <ApplicationCardSkeleton key={i} />
                ))}
              </>
            ) : filteredApplications.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-lg border border-neutral-border p-12 text-center">
                <div className="w-16 h-16 bg-neutral-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-neutral-text-muted" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-text mb-2">
                  {searchQuery ? "No matching applications" : "No applications yet"}
                </h3>
                <p className="text-sm text-neutral-text-secondary mb-6">
                  {searchQuery ? "Try adjusting your search" : "Start applying to jobs to see them here"}
                </p>
                {!searchQuery && (
                  <Link
                    href="/dashboard/jobs"
                    className="inline-block px-6 py-2.5 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
                  >
                    Browse Jobs
                  </Link>
                )}
              </div>
            ) : (
              <>
                {filteredApplications.map((app) => (
                  <ApplicationCard key={app._id} application={app} />
                ))}
                
                {/* Pagination Controls */}
                {(hasMore || paginationOpts.cursor) && (
                  <div className="flex items-center justify-center gap-4 pt-6">
                    <button
                      onClick={() => setPaginationOpts({ numItems: 10, cursor: null })}
                      disabled={!paginationOpts.cursor}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <span className="text-sm text-neutral-text-muted">
                      Showing {applications.length} applications
                    </span>
                    
                    <button
                      onClick={() => setPaginationOpts({ numItems: 10, cursor: applicationsData?.continueCursor || null })}
                      disabled={!hasMore}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ApplicationCard({ application }: { application: any }) {
  const statusColors = {
    "submitted": "bg-neutral-bg-secondary text-neutral-text-secondary border-neutral-border",
    "under_review": "bg-blue-50 text-blue-700 border-blue-200",
    "shortlisted": "bg-purple-50 text-purple-700 border-purple-200",
    "interview": "bg-green-50 text-green-700 border-green-200",
    "rejected": "bg-red-50 text-red-700 border-red-200",
    "accepted": "bg-green-50 text-green-700 border-green-200",
  };

  const statusLabels = {
    "submitted": "Submitted",
    "under_review": "Under Review",
    "shortlisted": "Shortlisted",
    "interview": "Interview",
    "rejected": "Regret",
    "accepted": "Accepted",
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (weeks > 0) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    return 'Just now';
  };

  const job = application.job;

  // Fetch employer profile for logo (must be called unconditionally)
  const employerProfile = useQuery(
    api.profile.getEmployerProfile,
    job ? { userId: job.employerId as any } : "skip"
  );

  if (!job) return null;

  const logo = job.companyName.charAt(0).toUpperCase();
  const salary = job.salaryDisclosure === "range" && job.salaryMin && job.salaryMax
    ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
    : job.salaryDisclosure === "negotiable"
    ? "Competitive salary"
    : "To be discussed";

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-3 sm:gap-4">
        {/* Company Logo */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {employerProfile?.companyLogo ? (
            <img 
              src={employerProfile.companyLogo} 
              alt={`${job.companyName} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg sm:text-xl font-bold text-neutral-text">{logo}</span>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <Link
                href={job.slug ? `/dashboard/jobs/${job.slug}` : `/dashboard/jobs/${job._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base sm:text-lg font-semibold text-neutral-text mb-1 hover:text-brand-orange cursor-pointer block break-words"
              >
                {job.title}
              </Link>
              <p className="text-sm text-neutral-text-secondary mb-2 truncate">{job.companyName}</p>
              
              {/* Meta Info */}
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-text-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{job.location}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                <span className="hidden sm:inline">•</span>
                <span className="font-medium text-neutral-text hidden sm:inline">{salary}</span>
              </div>
            </div>

            {/* Status Badge */}
            <span className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-full border whitespace-nowrap ${statusColors[application.status as keyof typeof statusColors]}`}>
              {statusLabels[application.status as keyof typeof statusLabels]}
            </span>
          </div>

          {/* Application Timeline */}
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-brand-orange rounded-full" />
                <div className="w-0.5 h-full bg-neutral-border mt-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-text mb-1">
                  {application.status === "submitted" && "Application submitted"}
                  {application.status === "under_review" && "Application under review"}
                  {application.status === "shortlisted" && "You've been shortlisted"}
                  {application.status === "interview" && "Interview scheduled"}
                  {application.status === "rejected" && "Application not selected"}
                  {application.status === "accepted" && "Congratulations! You got the job"}
                </p>
                <p className="text-xs sm:text-sm text-neutral-text-secondary">
                  {application.status === "submitted" && "Waiting for employer review"}
                  {application.status === "under_review" && "Your application is being reviewed"}
                  {application.status === "shortlisted" && "Waiting for next steps"}
                  {application.status === "interview" && "Prepare for your interview"}
                  {application.status === "rejected" && "Keep applying to other opportunities"}
                  {application.status === "accepted" && "The employer will contact you soon"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
            <Link
              href={job.slug ? `/dashboard/jobs/${job.slug}` : `/dashboard/jobs/${job._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View job
            </Link>
            {application.coverLetter && (
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">View cover letter</span>
                <span className="sm:hidden">Cover letter</span>
              </button>
            )}
            <div className="hidden sm:block flex-1" />
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-text-muted">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Applied {getTimeAgo(application._creationTime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-border rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="flex gap-3 sm:gap-4">
        {/* Company Logo Skeleton */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-lg flex-shrink-0"></div>

        {/* Main Content Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 mb-2">
            <div className="flex-1 w-full">
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32 hidden sm:block"></div>
              </div>
            </div>
            <div className="h-6 sm:h-7 bg-gray-200 rounded-full w-20 sm:w-24"></div>
          </div>

          {/* Timeline Skeleton */}
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Actions Skeleton */}
          <div className="flex items-center gap-3 mt-4">
            <div className="h-9 bg-gray-200 rounded-md w-28"></div>
            <div className="h-9 bg-gray-200 rounded-md w-36"></div>
            <div className="flex-1" />
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
