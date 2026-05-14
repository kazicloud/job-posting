"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { CheckCircle, XCircle, Search, Filter, Eye, ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import Link from "next/link";

export default function EmployersPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending">("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const industries = [
    "Technology & IT",
    "Marketing & Sales",
    "Finance & Accounting",
    "Engineering",
    "Healthcare",
    "Education & Training",
    "Hospitality & Tourism",
    "Agriculture",
    "Construction",
    "Logistics & Transport",
    "Creative & Design",
    "Customer Service",
    "Other",
  ];
  
  const data = useQuery(api.admin.getAllEmployers, { 
    status: statusFilter,
    search: debouncedSearch,
    page: currentPage,
    pageSize,
  });
  const allPendingEdits = useQuery(api.employerPendingEdits.getAllPendingEdits);

  // Build a Set of userIds that have pending profile edit requests
  const pendingEditUserIds = new Set(
    (allPendingEdits ?? []).map((e: any) => e.userId as string)
  );
  const verifyEmployer = useMutation(api.admin.verifyEmployer);
  const notifyVerified = useAction(api.emails.notifyEmployerVerified);
  const notifyRejected = useAction(api.emails.notifyEmployerRejected);

  const handleVerify = async (userId: any, verified: boolean) => {
    try {
      await verifyEmployer({ userId, verified });
      
      // Send email notification
      if (verified) {
        await notifyVerified({ employerId: userId });
        alert("Employer verified! Verification email sent.");
      } else {
        await notifyRejected({ employerId: userId });
        alert("Employer verification revoked. Notification email sent.");
      }
    } catch (error) {
      console.error("Failed to verify employer:", error);
      alert("Failed to update verification status");
    }
  };

  const filteredEmployers = (data?.employers?.filter((employer: any) => {
    const matchesIndustry = industryFilter === "all" || employer.profile?.industry === industryFilter;
    return matchesIndustry;
  }) || []).sort((a: any, b: any) => {
    // Priority: needs most action first
    // 0 = pending verification + pending edits (most urgent)
    // 1 = pending verification only
    // 2 = verified + pending edits
    // 3 = verified, nothing pending
    const priority = (emp: any) => {
      const hasPendingEdit = pendingEditUserIds.has(emp._id);
      const needsVerification = !emp.verified;
      if (needsVerification && hasPendingEdit) return 0;
      if (needsVerification) return 1;
      if (hasPendingEdit) return 2;
      return 3;
    };
    return priority(a) - priority(b);
  });

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Employers Management</h2>
        <p className="text-neutral-text-secondary">Manage and verify employer accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-neutral-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            >
              <option value="all">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-neutral-border p-5">
          <p className="text-xs text-neutral-text-secondary mb-1 font-medium uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-neutral-text">{data?.stats?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-5">
          <p className="text-xs text-neutral-text-secondary mb-1 font-medium uppercase tracking-wide">Verified</p>
          <p className="text-3xl font-bold text-green-600">{data?.stats?.verified ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-orange-200 bg-orange-50 p-5">
          <p className="text-xs text-orange-700 mb-1 font-medium uppercase tracking-wide">Pending Verification</p>
          <p className="text-3xl font-bold text-orange-600">{data?.stats?.pending ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-yellow-200 bg-yellow-50 p-5">
          <p className="text-xs text-yellow-700 mb-1 font-medium uppercase tracking-wide">Pending Edits</p>
          <p className="text-3xl font-bold text-yellow-600">{data?.stats?.pendingEdits ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="text-xs text-red-700 mb-1 font-medium uppercase tracking-wide">Rejected</p>
          <p className="text-3xl font-bold text-red-600">{data?.stats?.rejected ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-border p-5">
          <p className="text-xs text-neutral-text-secondary mb-1 font-medium uppercase tracking-wide">Suspended</p>
          <p className="text-3xl font-bold text-gray-500">{data?.stats?.suspended ?? 0}</p>
        </div>
      </div>

      {/* Employers Table */}
      <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Contact Person</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Location</th>
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
              ) : filteredEmployers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-text-secondary">
                    No employers found
                  </td>
                </tr>
              ) : (
                filteredEmployers.map((employer: any) => {
                  const hasPendingEdit = pendingEditUserIds.has(employer._id);
                  const needsVerification = !employer.verified;
                  const needsAction = hasPendingEdit || needsVerification;

                  return (
                  <tr
                    key={employer._id}
                    className={`transition-colors ${
                      needsAction
                        ? "bg-orange-50/60 hover:bg-orange-50"
                        : "hover:bg-neutral-bg-secondary"
                    }`}
                  >
                    <td className={`px-6 py-4 ${needsAction ? "border-l-4 border-brand-orange" : "border-l-4 border-transparent"}`}>
                      <div className="flex items-center gap-3">
                        {employer.profilePhoto ? (
                          <img
                            src={employer.profilePhoto}
                            alt={employer.profile?.companyName || ""}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-semibold">
                            {employer.profile?.companyName?.charAt(0) || employer.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-neutral-text">
                            {employer.profile?.companyName || "N/A"}
                          </div>
                          <div className="text-sm text-neutral-text-muted">
                            {employer.profile?.industry || "Not specified"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-text">{employer.fullName || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-text">{employer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-text">
                        {employer.profile?.headquarters || employer.country || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {employer.verified ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 w-fit">
                            <AlertCircle className="w-3 h-3" />
                            Pending Verification
                          </span>
                        )}
                        {hasPendingEdit && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 w-fit">
                            <Clock className="w-3 h-3" />
                            Pending Edits
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(employer._id, !employer.verified)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            employer.verified
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {employer.verified ? "Unverify" : "Verify"}
                        </button>
                        <Link href={`/employers/${employer._id}`}>
                          <button className="p-2 text-neutral-text-secondary hover:bg-neutral-bg-secondary rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                  );
                })
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
              {data.pagination.total} employers
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
