"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { Search, Eye, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import Link from "next/link";

export default function JobSeekersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const data = useQuery(api.admin.getAllJobSeekers, {
    search: debouncedSearch,
    page: currentPage,
    pageSize,
  });

  const filteredJobSeekers = data?.jobSeekers || [];

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
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
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </td>
    </tr>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Job Seekers Management</h2>
        <p className="text-neutral-text-secondary">Manage job seeker accounts and profiles</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-neutral-border p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or headline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <p className="text-sm text-neutral-text-secondary mb-1">Total Job Seekers</p>
          <p className="text-3xl font-bold text-neutral-text">{data?.pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <p className="text-sm text-neutral-text-secondary mb-1">With Complete Profiles</p>
          <p className="text-3xl font-bold text-blue-600">
            {data?.jobSeekers.filter((js: any) => js.onboardingCompleted).length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <p className="text-sm text-neutral-text-secondary mb-1">Open to Work</p>
          <p className="text-3xl font-bold text-green-600">
            {data?.jobSeekers.filter((js: any) => js.profile?.openToWork).length || 0}
          </p>
        </div>
      </div>

      {/* Job Seekers Table */}
      <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Location</th>
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
              ) : filteredJobSeekers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-text-secondary">
                    No job seekers found
                  </td>
                </tr>
              ) : (
                filteredJobSeekers.map((jobSeeker: any) => (
                  <tr key={jobSeeker._id} className="hover:bg-neutral-bg-secondary transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {jobSeeker.profilePhoto ? (
                          <img
                            src={jobSeeker.profilePhoto}
                            alt={jobSeeker.fullName || ""}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-semibold">
                            {jobSeeker.fullName?.charAt(0) || jobSeeker.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="font-medium text-neutral-text">
                          {jobSeeker.fullName || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-text">{jobSeeker.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-text">
                        {jobSeeker.county || jobSeeker.country || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-text-muted" />
                        <span className="text-neutral-text font-medium">
                          {jobSeeker.applicationsCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {jobSeeker.profile?.openToWork ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          Open to Work
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
                          Not Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/job-seekers/${jobSeeker._id}`}>
                        <button className="p-2 text-neutral-text-secondary hover:bg-neutral-bg-secondary rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
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
              {data.pagination.total} job seekers
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
