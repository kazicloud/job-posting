"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";

export default function JobsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "closed" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const data = useQuery(api.admin.getAllJobs, {
    status: statusFilter,
    search: debouncedSearch,
    page: currentPage,
    pageSize,
  });

  const filteredJobs = data?.jobs || [];

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-8 bg-gray-200 rounded"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </td>
    </tr>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-50 text-green-700";
      case "draft":
        return "bg-gray-50 text-gray-700";
      case "closed":
        return "bg-red-50 text-red-700";
      case "archived":
        return "bg-neutral-bg-secondary text-neutral-text-muted";
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Jobs Management</h2>
        <p className="text-neutral-text-secondary">Manage and monitor all job postings</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-neutral-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
            <input
              type="text"
              placeholder="Search by title, company, or location..."
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
              <option value="all">All Jobs</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <p className="text-sm text-neutral-text-secondary mb-1">Total Jobs</p>
          <p className="text-3xl font-bold text-neutral-text">{data?.pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <p className="text-sm text-neutral-text-secondary mb-1">Published</p>
          <p className="text-3xl font-bold text-green-600">
            {data?.jobs?.filter((j: any) => j.status === "published").length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <p className="text-sm text-neutral-text-secondary mb-1">Draft</p>
          <p className="text-3xl font-bold text-gray-600">
            {data?.jobs?.filter((j: any) => j.status === "draft").length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <p className="text-sm text-neutral-text-secondary mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-blue-600">
            {data?.jobs?.reduce((sum: number, j: any) => sum + (j.applicationsCount || 0), 0) || 0}
          </p>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Job Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Posted</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Applications</th>
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
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-text-secondary">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job: any) => (
                  <tr key={job._id} className="hover:bg-neutral-bg-secondary transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-text">{job.title}</div>
                      <div className="text-sm text-neutral-text-secondary">{job.companyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-text">{job.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-text">{formatDate(job.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-text-muted" />
                        <span className="text-neutral-text font-medium">
                          {job.applicationsCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-neutral-text-secondary hover:bg-neutral-bg-secondary rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
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
              {data.pagination.total} jobs
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
