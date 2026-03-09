"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { Search, Eye, Briefcase, Calendar, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import Link from "next/link";

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "under_review" | "shortlisted" | "interview" | "rejected" | "accepted">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const data = useQuery(api.admin.getAllApplications, { 
    status: statusFilter,
    search: debouncedSearch,
    page: currentPage,
    pageSize,
  });

  const filteredApplications = data?.applications;

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </td>
    </tr>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-50 text-blue-700";
      case "under_review":
        return "bg-purple-50 text-purple-700";
      case "shortlisted":
        return "bg-yellow-50 text-yellow-700";
      case "interview":
        return "bg-orange-50 text-orange-700";
      case "accepted":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Applications Management</h2>
        <p className="text-neutral-text-secondary">Monitor and manage all job applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            >
              <option value="all">All Applications</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-neutral-border p-4">
          <p className="text-xs text-neutral-text-secondary mb-1">Total</p>
          <p className="text-2xl font-bold text-neutral-text">{data?.pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-4">
          <p className="text-xs text-neutral-text-secondary mb-1">Submitted</p>
          <p className="text-2xl font-bold text-blue-600">
            {data?.applications?.filter((a: any) => a.status === "submitted").length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-4">
          <p className="text-xs text-neutral-text-secondary mb-1">Under Review</p>
          <p className="text-2xl font-bold text-purple-600">
            {data?.applications?.filter((a: any) => a.status === "under_review").length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-4">
          <p className="text-xs text-neutral-text-secondary mb-1">Shortlisted</p>
          <p className="text-2xl font-bold text-yellow-600">
            {data?.applications?.filter((a: any) => a.status === "shortlisted").length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-4">
          <p className="text-xs text-neutral-text-secondary mb-1">Accepted</p>
          <p className="text-2xl font-bold text-green-600">
            {data?.applications?.filter((a: any) => a.status === "accepted").length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-4">
          <p className="text-xs text-neutral-text-secondary mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {data?.applications?.filter((a: any) => a.status === "rejected").length || 0}
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Candidate</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Job Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Applied Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border">
              {!data ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredApplications?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-text-secondary">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications?.map((application: any) => (
                  <tr key={application._id} className="hover:bg-neutral-bg-secondary transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {application.jobSeeker?.profilePhoto ? (
                          <img
                            src={application.jobSeeker.profilePhoto}
                            alt={application.jobSeeker.fullName || ""}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-semibold">
                            {application.jobSeeker?.fullName?.charAt(0) || 
                             application.jobSeeker?.email.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-neutral-text">
                            {application.jobSeeker?.fullName || "N/A"}
                          </div>
                          <div className="text-sm text-neutral-text-muted">
                            {application.jobSeeker?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-neutral-text-muted" />
                        <span className="text-neutral-text font-medium">
                          {application.job?.title || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-text">
                        {application.job?.companyName || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-text-secondary">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(application._creationTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {formatStatus(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/applications/${application._id}`}>
                          <button className="p-2 text-neutral-text-secondary hover:bg-neutral-bg-secondary rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        {application.resumeUrl && (
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-neutral-text-secondary hover:bg-neutral-bg-secondary rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-border flex items-center justify-between">
            <div className="text-sm text-neutral-text-secondary">
              Showing {((data.pagination.page - 1) * data.pagination.pageSize) + 1} to{" "}
              {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of{" "}
              {data.pagination.total} applications
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-neutral-border hover:bg-neutral-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-neutral-text px-4">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={currentPage === data.pagination.totalPages}
                className="p-2 rounded-lg border border-neutral-border hover:bg-neutral-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
