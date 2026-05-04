"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { InterviewModal, InterviewDetails } from "@/components/employer-dashboard/interview-modal";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Download, Star, MapPin, Briefcase, Calendar, FileText, ExternalLink, CheckCircle2, X, Mail, Phone, Users, ChevronDown, ArrowUpDown } from "lucide-react";
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
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "match" | "name">("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  // Interview modal state
  const [interviewModal, setInterviewModal] = useState<{
    applicationId: Id<"applications">;
    candidateName: string;
    jobTitle: string;
  } | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

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

  // Sort applications
  const sortedApplications = [...searchedApplications].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return a._creationTime - b._creationTime;
      case "match":
        return (b.matchScore || 0) - (a.matchScore || 0);
      case "name":
        return (a.jobSeeker?.name || "").localeCompare(b.jobSeeker?.name || "");
      case "newest":
      default:
        return b._creationTime - a._creationTime;
    }
  });

  const handleStatusUpdate = async (applicationId: Id<"applications">, status: any) => {
    try {
      await updateStatus({ applicationId, status });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handleInterviewConfirm = async (details: InterviewDetails) => {
    if (!interviewModal) return;
    setIsScheduling(true);
    try {
      await updateStatus({ applicationId: interviewModal.applicationId, status: "interview", interviewDetails: details });
      setInterviewModal(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to schedule interview");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleExport = async () => {
    if (selectedJobId === "all" || !sortedApplications.length) return;
    
    setIsExporting(true);
    
    try {
      // Use setTimeout to avoid blocking UI
      setTimeout(() => {
        const job = employerJobs?.find(j => j._id === selectedJobId);
        const jobTitle = job?.title.replace(/[^a-z0-9]/gi, '_') || 'applications';
        
        const headers = ['Candidate Name', 'Email', 'Phone', 'Match Score', 'Status', 'Applied Date'];
        
        const chunkSize = 100;
        const chunks: string[][] = [];
        
        for (let i = 0; i < sortedApplications.length; i += chunkSize) {
          const chunk = sortedApplications.slice(i, i + chunkSize);
          const rows = chunk.map(app => [
            app.jobSeeker?.name || 'N/A',
            app.jobSeeker?.email || 'N/A',
            app.jobSeeker?.phone || 'N/A',
            app.matchScore?.toString() || 'N/A',
            app.status,
            new Date(app._creationTime).toLocaleDateString()
          ]);
          chunks.push(...rows);
        }
        
        const csvContent = [
          headers.join(','),
          ...chunks.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${jobTitle}_applications_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
      }, 100);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  return (
    <EmployerDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-text mb-1 sm:mb-2">Applications</h1>
          <p className="text-sm sm:text-base text-neutral-text-secondary">Review and manage candidate applications</p>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-neutral-border mb-6 -mx-4 sm:mx-0">
          <div className="flex items-center gap-4 sm:gap-8 px-4 sm:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              All ({counts?.all || 0})
            </button>
            <button
              onClick={() => setActiveTab("submitted")}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "submitted"
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              New ({counts?.submitted || 0})
            </button>
            <button
              onClick={() => setActiveTab("shortlisted")}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "shortlisted"
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              Shortlisted ({counts?.shortlisted || 0})
            </button>
            <button
              onClick={() => setActiveTab("interview")}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "interview"
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-neutral-text-muted hover:text-neutral-text"
              }`}
            >
              Interview ({counts?.interview || 0})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
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
          <div className="border-b border-neutral-border p-3 sm:p-4">
            <label className="block text-xs sm:text-sm font-semibold text-neutral-text mb-2">
              Viewing applications for:
            </label>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="relative flex-1">
                  <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="relative flex-1">
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 border border-neutral-border rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white appearance-none cursor-pointer hover:border-brand-orange/50 transition-colors"
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
                    <Briefcase className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-brand-orange pointer-events-none" />
                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-neutral-text-muted pointer-events-none" />
                  </div>
                  <button
                    onClick={handleExport}
                    disabled={isExporting || selectedJobId === "all" || !sortedApplications.length}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-neutral-border text-neutral-text text-xs sm:text-sm font-medium rounded-lg hover:bg-neutral-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Job Details - Loading Skeleton */}
          {isLoading && (
            <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50/50 to-white animate-pulse">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded w-32 sm:w-48"></div>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded-full w-16 sm:w-24"></div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <div className="h-3 bg-gray-200 rounded w-20 sm:w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 sm:w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 sm:w-28"></div>
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
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-neutral-text truncate max-w-[200px] sm:max-w-md">
                        {employerJobs?.find(j => j._id === selectedJobId)?.title}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0">
                        <Users className="w-3 h-3" />
                        {counts?.all || 0} {(counts?.all || 0) === 1 ? 'Application' : 'Applications'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-neutral-text-secondary flex-wrap">
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                        <span className="truncate max-w-[100px] sm:max-w-[200px]">
                          {employerJobs?.find(j => j._id === selectedJobId)?.location}
                        </span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                        <Briefcase className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                        {employerJobs?.find(j => j._id === selectedJobId)?.employmentType.replace('-', ' ')}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                        <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                        Posted {new Date(employerJobs?.find(j => j._id === selectedJobId)?._creationTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white border border-neutral-border rounded-lg p-3 sm:p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-neutral-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by candidate name, email..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>
            {/* Sort */}
            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 border border-neutral-border rounded-md text-sm font-medium text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="font-semibold">
                  {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : sortBy === "match" ? "Best Match" : "Name (A-Z)"}
                </span>
              </button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-border rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => { setSortBy("newest"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${sortBy === "newest" ? "text-brand-orange font-medium" : "text-neutral-text"}`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => { setSortBy("oldest"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${sortBy === "oldest" ? "text-brand-orange font-medium" : "text-neutral-text"}`}
                    >
                      Oldest First
                    </button>
                    <button
                      onClick={() => { setSortBy("match"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${sortBy === "match" ? "text-brand-orange font-medium" : "text-neutral-text"}`}
                    >
                      Best Match
                    </button>
                    <button
                      onClick={() => { setSortBy("name"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${sortBy === "name" ? "text-brand-orange font-medium" : "text-neutral-text"}`}
                    >
                      Name (A-Z)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        {isLoading ? (
          /* Loading Skeletons */
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white border border-neutral-border rounded-lg overflow-hidden">
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
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {[1, 2, 3].map((i) => (
                <ApplicationMobileCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : sortedApplications.length === 0 ? (
          <div className="bg-white border border-neutral-border rounded-lg p-8 sm:p-12 text-center">
            <FileText className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-neutral-text-muted" />
            <h3 className="text-base sm:text-lg font-semibold text-neutral-text mb-2">
              {selectedJobId === "all" ? "Select a job to view applications" : (counts?.all === 0 ? "No applications yet" : "No matching applications")}
            </h3>
            <p className="text-sm sm:text-base text-neutral-text-secondary">
              {selectedJobId === "all"
                ? "Choose a job from the dropdown above to view its applications"
                : counts?.all === 0
                ? "Applications will appear here once candidates start applying to this job"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white border border-neutral-border rounded-lg overflow-hidden">
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
                    {sortedApplications.map((application) => (
                      <ApplicationRow
                        key={application._id}
                        application={application}
                        onStatusUpdate={handleStatusUpdate}
                        onScheduleInterview={(id, candidateName, jobTitle) =>
                          setInterviewModal({ applicationId: id, candidateName, jobTitle })
                        }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {sortedApplications.map((application) => (
              <ApplicationMobileCard
                key={application._id}
                application={application}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </>
        )}
      </div>

      {/* Interview Modal */}
      {interviewModal && (
        <InterviewModal
          isOpen={true}
          candidateName={interviewModal.candidateName}
          jobTitle={interviewModal.jobTitle}
          onClose={() => setInterviewModal(null)}
          onConfirm={handleInterviewConfirm}
          isLoading={isScheduling}
        />
      )}
    </EmployerDashboardLayout>
  );
}

function ApplicationRow({
  application,
  onStatusUpdate,
  onScheduleInterview,
}: {
  application: any;
  onStatusUpdate: (id: Id<"applications">, status: string) => void;
  onScheduleInterview: (id: Id<"applications">, candidateName: string, jobTitle: string) => void;
}) {
  const jobSeeker = application.jobSeeker;
  const job = application.job;

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
              {jobSeeker?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-text">{jobSeeker?.name || "Unknown"}</p>
            {jobSeeker?.skills && jobSeeker.skills.length > 0 && (
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
          {jobSeeker?.email && (
            <p className="text-xs text-neutral-text-secondary flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {jobSeeker.email}
            </p>
          )}
          {jobSeeker?.phone && (
            <p className="text-xs text-neutral-text-secondary flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {jobSeeker.phone}
            </p>
          )}
          {!jobSeeker?.email && !jobSeeker?.phone && (
            <p className="text-xs text-neutral-text-muted">No contact info</p>
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
                onClick={() => onScheduleInterview(application._id, application.jobSeeker?.name || "Candidate", application.job?.title || "Position")}
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

function ApplicationMobileCard({ application, onStatusUpdate }: { application: any; onStatusUpdate: (id: Id<"applications">, status: string) => void }) {
  const [showActions, setShowActions] = useState(false);
  
  const statusColors = {
    submitted: "bg-blue-50 text-blue-700",
    shortlisted: "bg-purple-50 text-purple-700",
    interview: "bg-orange-50 text-orange-700",
    rejected: "bg-red-50 text-red-700",
  };

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-text mb-1">{application.jobSeeker?.name || "Unknown"}</h3>
          <div className="flex items-center gap-2 text-xs text-neutral-text-secondary">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{application.jobSeeker?.email}</span>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${statusColors[application.status as keyof typeof statusColors]}`}>
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </span>
      </div>

      {/* Match Score */}
      {application.matchScore !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-neutral-text-secondary">Match Score</span>
            <span className="font-semibold text-neutral-text">{application.matchScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-brand-orange h-1.5 rounded-full"
              style={{ width: `${application.matchScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Applied Date */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-text-secondary mb-3">
        <Calendar className="w-3 h-3" />
        <span>Applied {new Date(application._creationTime).toLocaleDateString()}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-neutral-border">
        <Link
          href={`/employer-dashboard/applications/${application._id}`}
          className="flex-1 px-3 py-2 text-xs font-medium text-center text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary"
        >
          View
        </Link>
        <button
          onClick={() => setShowActions(!showActions)}
          className="flex-1 px-3 py-2 text-xs font-medium text-center text-white bg-brand-orange rounded-md hover:bg-brand-orange/90"
        >
          Update Status
        </button>
      </div>

      {/* Status Actions Dropdown */}
      {showActions && (
        <div className="mt-2 p-2 bg-neutral-bg-secondary rounded-md space-y-1">
          {["shortlisted", "interview", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => {
                onStatusUpdate(application._id, status);
                setShowActions(false);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-left text-neutral-text hover:bg-white rounded transition-colors"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationMobileCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-border rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="mb-3">
        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
      <div className="flex items-center gap-2 pt-3 border-t border-neutral-border">
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
