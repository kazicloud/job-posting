"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useState } from "react";
import { Building2, MapPin, Clock, Calendar, ExternalLink, MessageSquare, FileText, Filter, Search } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's applications
  const applicationsData = useQuery(api.applications.myApplications);
  const isLoading = applicationsData === undefined;
  const applications = applicationsData || [];

  const activeCount = applications.filter(a => 
    ["submitted", "under_review", "shortlisted", "interview"].includes(a.status)
  ).length;

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "active" ? ["submitted", "under_review", "shortlisted", "interview"].includes(app.status) :
      filter === "archived" ? ["rejected", "accepted"].includes(app.status) : true;

    const matchesSearch = !searchQuery || 
      app.job?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.companyName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary">
        {/* Header */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-neutral-text mb-1">
                  My Applications
                </h1>
                <p className="text-sm text-neutral-text-secondary">
                  Track and manage your job applications
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-neutral-border -mb-px">
              <button
                onClick={() => setFilter("all")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === "all"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                All applications ({applications.length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === "active"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilter("archived")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === "archived"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                Archived (0)
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="max-w-7xl mx-auto px-8 py-6">
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
              filteredApplications.map((app) => (
                <ApplicationCard key={app._id} application={app} />
              ))
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
  if (!job) return null;

  const logo = job.companyName.charAt(0).toUpperCase();
  const salary = job.salaryDisclosure === "range" && job.salaryMin && job.salaryMax
    ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
    : job.salaryDisclosure === "negotiable"
    ? "Competitive salary"
    : "To be discussed";

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Company Logo */}
        <div className="w-14 h-14 bg-neutral-bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-neutral-text">{logo}</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <Link
                href={`/dashboard/jobs/${job._id}`}
                className="text-lg font-semibold text-neutral-text mb-1 hover:text-brand-orange cursor-pointer block"
              >
                {job.title}
              </Link>
              <p className="text-sm text-neutral-text-secondary mb-2">{job.companyName}</p>
              
              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-neutral-text-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                <span>•</span>
                <span className="font-medium text-neutral-text">{salary}</span>
              </div>
            </div>

            {/* Status Badge */}
            <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${statusColors[application.status as keyof typeof statusColors]}`}>
              {statusLabels[application.status as keyof typeof statusLabels]}
            </span>
          </div>

          {/* Application Timeline */}
          <div className="mt-4 p-4 bg-neutral-bg-secondary rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-brand-orange rounded-full" />
                <div className="w-0.5 h-full bg-neutral-border mt-1" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-text mb-1">
                  {application.status === "submitted" && "Application submitted"}
                  {application.status === "under_review" && "Application under review"}
                  {application.status === "shortlisted" && "You've been shortlisted"}
                  {application.status === "interview" && "Interview scheduled"}
                  {application.status === "rejected" && "Application not selected"}
                  {application.status === "accepted" && "Congratulations! You got the job"}
                </p>
                <p className="text-sm text-neutral-text-secondary">
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
          <div className="flex items-center gap-3 mt-4">
            <Link
              href={`/dashboard/jobs/${job._id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View job
            </Link>
            {application.coverLetter && (
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors">
                <FileText className="w-4 h-4" />
                View cover letter
              </button>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-neutral-text-muted">
              <Calendar className="w-4 h-4" />
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
    <div className="bg-white border border-neutral-border rounded-lg p-6 animate-pulse">
      <div className="flex gap-4">
        {/* Company Logo Skeleton */}
        <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0"></div>

        {/* Main Content Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-7 bg-gray-200 rounded-full w-24"></div>
          </div>

          {/* Timeline Skeleton */}
          <div className="mt-4 p-4 bg-neutral-bg-secondary rounded-lg">
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
