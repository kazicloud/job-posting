"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Download, Star, MapPin, Briefcase, Calendar, FileText, ExternalLink, CheckCircle2, X, Mail, Phone, Users, ChevronDown } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";

export default function EmployerApplicationsPage() {
  const searchParams = useSearchParams();
  const jobIdFromUrl = searchParams.get("jobId");
  
  const [activeTab, setActiveTab] = useState<"all" | "submitted" | "shortlisted" | "interview" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | "all">(jobIdFromUrl || "all");

  // Update selectedJobId when URL changes
  useEffect(() => {
    if (jobIdFromUrl) {
      setSelectedJobId(jobIdFromUrl);
    }
  }, [jobIdFromUrl]);

  // Get employer's jobs
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const employerJobs = useQuery(
    api.jobs.listByEmployer,
    profile?.primaryRole === "employer" && profile._id ? { employerId: profile._id } : "skip"
  );

  // Set default to newest job on load (only if no URL param)
  const [hasSetDefault, setHasSetDefault] = useState(false);
  if (employerJobs && employerJobs.length > 0 && !hasSetDefault && selectedJobId === "all" && !jobIdFromUrl) {
    const newestJob = employerJobs.sort((a, b) => b._creationTime - a._creationTime)[0];
    if (newestJob) {
      setSelectedJobId(newestJob._id);
      setHasSetDefault(true);
    }
  }

  // Fetch applications only for selected job (optimized)
  const result = useQuery(
    api.applications.getEmployerApplications,
    selectedJobId !== "all" 
      ? { 
          jobId: selectedJobId as Id<"jobs">,
          status: activeTab === "all" ? undefined : (activeTab as any),
          paginationOpts: { numItems: 20, cursor: null }
        }
      : "skip"
  );

  // Get counts for selected job
  const counts = useQuery(
    api.applications.getJobApplicationCounts,
    selectedJobId !== "all" ? { jobId: selectedJobId as Id<"jobs"> } : "skip"
  );

  // Get counts for all jobs (for dropdown)
  const allJobCounts = useQuery(api.applications.getAllJobsApplicationCounts, {});

  const updateStatus = useMutation(api.applications.updateStatus);

  const isLoading = result === undefined || employerJobs === undefined || (selectedJobId !== "all" && counts === undefined);

  const applications = result?.page || [];

  // Filter by search
  const searchedApplications = applications.filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.jobSeeker?.name?.toLowerCase().includes(query) ||
      app.jobSeeker?.email?.toLowerCase().includes(query) ||
      app.job?.title?.toLowerCase().includes(query)
    );
  });

  const handleStatusUpdate = async (applicationId: Id<"applications">, status: any) => {
    try {
      await updateStatus({ applicationId, status });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  return (
    <EmployerDashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-text mb-2">Applications</h1>
            <p className="text-neutral-text-secondary">Review and manage candidate applications</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-neutral-border text-neutral-text text-sm font-medium rounded-lg hover:bg-neutral-bg-secondary transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-neutral-border mb-6">
          <div className="flex items-center gap-8 px-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              All ({counts?.all || 0})
            </button>
            <button
              onClick={() => setActiveTab("submitted")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "submitted"
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              New ({counts?.submitted || 0})
            </button>
            <button
              onClick={() => setActiveTab("shortlisted")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "shortlisted"
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              Shortlisted ({counts?.shortlisted || 0})
            </button>
            <button
              onClick={() => setActiveTab("interview")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "interview"
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              Interview ({counts?.interview || 0})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "rejected"
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              Regret ({counts?.rejected || 0})
            </button>
          </div>
        </div>

        {/* Job Selector & Header - Compact Design */}
        <div className="bg-white border border-neutral-border rounded-lg mb-6">
          {/* Top Bar - Job Selector */}
          <div className="border-b border-neutral-border p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-neutral-text whitespace-nowrap">
                Viewing applications for:
              </label>
              {isLoading ? (
                <div className="relative flex-1 max-w-md">
                  <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <div className="relative flex-1 max-w-md">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-neutral-border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white appearance-none cursor-pointer hover:border-brand-orange/50 transition-colors"
                  >
                    <option value="all" disabled>Select a job position...</option>
                    {employerJobs?.sort((a, b) => b._creationTime - a._creationTime).map((job) => {
                      const jobAppCount = allJobCounts?.[job._id] || 0;
                      return (
                        <option key={job._id} value={job._id}>
                          {job.title} • {jobAppCount} {jobAppCount === 1 ? 'application' : 'applications'}
                        </option>
                      );
                    })}
                  </select>
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange pointer-events-none" />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Job Details - Loading Skeleton */}
          {isLoading && (
            <div className="p-6 bg-gradient-to-r from-gray-50/50 to-white animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Details - Actual Data */}
          {!isLoading && selectedJobId !== "all" && (
            <div className="p-6 bg-gradient-to-r from-gray-50/50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-200">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-neutral-text">
                        {employerJobs?.find(j => j._id === selectedJobId)?.title}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        <Users className="w-3 h-3" />
                        {counts?.all || 0} {(counts?.all || 0) === 1 ? 'Application' : 'Applications'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-text-secondary">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {employerJobs?.find(j => j._id === selectedJobId)?.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {employerJobs?.find(j => j._id === selectedJobId)?.employmentType.replace('-', ' ')}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {new Date(employerJobs?.find(j => j._id === selectedJobId)?._creationTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-neutral-border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by candidate name, email, or job title..."
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-border rounded-md text-sm font-medium text-neutral-text hover:bg-neutral-bg-secondary transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Applications Table */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Match
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border">
                  {[1, 2, 3, 4].map((i) => (
                    <ApplicationCardSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : searchedApplications.length === 0 ? (
          <div className="bg-white border border-neutral-border rounded-lg p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-text-muted" />
            <h3 className="text-lg font-semibold text-neutral-text mb-2">
              {selectedJobId === "all" ? "Select a job to view applications" : (counts?.all === 0 ? "No applications yet" : "No matching applications")}
            </h3>
            <p className="text-neutral-text-secondary">
              {selectedJobId === "all"
                ? "Choose a job from the dropdown above to view its applications"
                : counts?.all === 0
                ? "Applications will appear here once candidates start applying to this job"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Match
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-text uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border">
                  {searchedApplications.map((application) => (
                    <ApplicationRow
                      key={application._id}
                      application={application}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </EmployerDashboardLayout>
  );
}

function ApplicationRow({
  application,
  onStatusUpdate,
}: {
  application: any;
  onStatusUpdate: (id: Id<"applications">, status: string) => void;
}) {
  const jobSeeker = application.jobSeeker;
  const job = application.job;
  
  if (!jobSeeker || !job) return null;

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "under_review":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "shortlisted":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "interview":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "accepted":
        return "bg-green-50 text-green-700 border-green-200";
      case "rejected":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <tr className="hover:bg-neutral-bg-secondary/50 transition-colors">
      {/* Candidate */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-brand-orange">
              {jobSeeker.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-text">{jobSeeker.name || "Anonymous"}</p>
            {jobSeeker.skills && jobSeeker.skills.length > 0 && (
              <p className="text-xs text-neutral-text-muted">
                {jobSeeker.skills.slice(0, 2).join(", ")}
                {jobSeeker.skills.length > 2 && ` +${jobSeeker.skills.length - 2}`}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          {jobSeeker.email && (
            <p className="text-xs text-neutral-text-secondary flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {jobSeeker.email}
            </p>
          )}
          {jobSeeker.phone && (
            <p className="text-xs text-neutral-text-secondary flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {jobSeeker.phone}
            </p>
          )}
        </div>
      </td>

      {/* Match Score */}
      <td className="px-6 py-4">
        {application.matchScore !== undefined ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
              <div
                className={`h-2 rounded-full ${
                  application.matchScore >= 80
                    ? "bg-green-500"
                    : application.matchScore >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${application.matchScore}%` }}
              />
            </div>
            <span className="text-xs font-medium text-neutral-text">{application.matchScore}%</span>
          </div>
        ) : (
          <span className="text-xs text-neutral-text-muted">N/A</span>
        )}
      </td>

      {/* Applied */}
      <td className="px-6 py-4">
        <p className="text-sm text-neutral-text-secondary">{getTimeAgo(application._creationTime)}</p>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(application.status)}`}>
          {application.status.replace("_", " ").charAt(0).toUpperCase() + application.status.slice(1).replace("_", " ")}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/employer-dashboard/applications/${application._id}`}
            className="px-3 py-1.5 text-xs font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors"
          >
            View
          </Link>
          
          {application.status === "submitted" && (
            <>
              <button
                onClick={() => onStatusUpdate(application._id, "shortlisted")}
                className="px-3 py-1.5 text-xs font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onStatusUpdate(application._id, "rejected")}
                className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
            </>
          )}

          {application.status === "shortlisted" && (
            <>
              <button
                onClick={() => onStatusUpdate(application._id, "interview")}
                className="px-3 py-1.5 text-xs font-medium text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition-colors"
              >
                Interview
              </button>
              <button
                onClick={() => onStatusUpdate(application._id, "rejected")}
                className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
            </>
          )}

          {application.status === "interview" && (
            <>
              <button
                onClick={() => onStatusUpdate(application._id, "accepted")}
                className="px-3 py-1.5 text-xs font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => onStatusUpdate(application._id, "rejected")}
                className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function ApplicationCardSkeleton() {
  return (
    <tr className="animate-pulse">
      {/* Candidate */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-36"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
        </div>
      </td>

      {/* Match Score */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
        </div>
      </td>

      {/* Applied */}
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <div className="h-7 bg-gray-200 rounded-md w-14"></div>
          <div className="h-7 bg-gray-200 rounded-md w-20"></div>
          <div className="h-7 bg-gray-200 rounded-md w-16"></div>
        </div>
      </td>
    </tr>
  );
}
