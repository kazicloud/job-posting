"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { Search, CreditCard } from "lucide-react";

const PLAN_NAMES = {
  free: "Starter (Free)",
  basic: "Basic",
  growth: "Growth",
  enterprise: "Enterprise"
};

const STATUS_COLORS = {
  active: "bg-green-50 text-green-700",
  expired: "bg-red-50 text-red-700",
  cancelled: "bg-gray-50 text-gray-700"
};

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "cancelled">("all");
  
  const subscriptions = useQuery(api.billing.getAllSubscriptions);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-40 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
    </tr>
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredSubscriptions = subscriptions?.filter(sub => {
    const matchesSearch = !searchQuery || 
      sub.user?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Employer Subscriptions</h2>
        <p className="text-neutral-text-secondary">Track and manage all employer subscription plans</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-neutral-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
            <input
              type="text"
              placeholder="Search by company, email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-border">
            <thead className="bg-neutral-bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Company / User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Jobs Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-border">
              {!subscriptions ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-neutral-bg-secondary rounded-full flex items-center justify-center mb-4">
                        <CreditCard className="w-8 h-8 text-neutral-text-muted" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-text mb-1">No subscriptions found</h3>
                      <p className="text-neutral-text-secondary">
                        {searchQuery || statusFilter !== "all" 
                          ? "Try adjusting your search or filters" 
                          : "Subscriptions will appear here once employers sign up"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-neutral-bg-secondary transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-text">
                        {sub.user?.companyName || "Unknown Company"}
                      </div>
                      <div className="text-xs text-neutral-text-secondary">
                        {sub.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-text">
                        {PLAN_NAMES[sub.plan]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[sub.status]}`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-text">
                      {sub.jobPostingsRemaining === -1 ? "Unlimited" : sub.jobPostingsRemaining}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-text-secondary">
                      {formatDate(sub.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-text-secondary">
                      {sub.endDate ? formatDate(sub.endDate) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
