"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";
import { Search, Headphones, Eye } from "lucide-react";
import Link from "next/link";

const SERVICE_TYPES = {
  ats_cv: "ATS CV Review",
  cv_revamp: "CV Revamp", 
  job_search_support: "Job Search Support",
  career_coaching: "Career Coaching"
};

const STATUS_COLORS = {
  pending: "bg-yellow-50 text-yellow-700",
  in_progress: "bg-blue-50 text-blue-700", 
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700"
};

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "completed" | "cancelled">("all");
  
  const orders = useQuery(api.serviceOrders.getAll);
  const updateStatus = useMutation(api.serviceOrders.updateStatus);

  const handleStatusUpdate = async (orderId: Id<"serviceOrders">, status: string, order: any) => {
    await updateStatus({ orderId, status: status as any });
    
    // Send email notification if user details are available
    if (order.user && status !== "pending") {
      try {
        await fetch("/api/emails/service-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: order.user.fullName || "Customer",
            customerEmail: order.user.email,
            serviceType: order.serviceType,
            status,
          }),
        });
      } catch (error) {
        console.error("Failed to send email:", error);
      }
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>
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
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
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

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = !searchQuery || 
      SERVICE_TYPES[order.serviceType].toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Candidate Services</h2>
        <p className="text-neutral-text-secondary">Manage and track candidate service orders</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-neutral-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
            <input
              type="text"
              placeholder="Search by service, customer name, or email..."
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
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
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
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-border">
              {!orders ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-neutral-bg-secondary rounded-full flex items-center justify-center mb-4">
                        <Headphones className="w-8 h-8 text-neutral-text-muted" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-text mb-1">No service orders found</h3>
                      <p className="text-neutral-text-secondary">
                        {searchQuery || statusFilter !== "all" 
                          ? "Try adjusting your search or filters" 
                          : "Service orders will appear here once customers make purchases"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-bg-secondary transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-text">
                        {SERVICE_TYPES[order.serviceType]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-text">
                        {order.user?.fullName || "Unknown User"}
                      </div>
                      <div className="text-xs text-neutral-text-secondary">
                        {order.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-text">
                        {order.currency} {order.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status]}`}>
                        {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-text-secondary">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/services/${order._id}`}
                          className="p-1.5 text-neutral-text-secondary hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value, order)}
                          className="px-3 py-1.5 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
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
