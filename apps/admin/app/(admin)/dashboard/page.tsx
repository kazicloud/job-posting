"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Users, Briefcase, FileText, TrendingUp, UserCheck, UserX, Building2 } from "lucide-react";

export default function AdminDashboard() {
  const stats = useQuery(api.admin.getDashboardStats);

  if (!stats) {
    return (
      <div>
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-text mb-2">Dashboard Overview</h2>
          <p className="text-neutral-text-secondary">Monitor platform activity and key metrics</p>
        </div>

        {/* Today's Activity Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
              </div>
              <div className="h-9 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Main Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-neutral-border overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-9 w-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex items-center gap-4 pt-4 border-t border-neutral-border">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Health Skeleton */}
        <div className="mt-8 bg-white rounded-lg border border-neutral-border p-6 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 w-40 bg-gray-200 rounded mb-1"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Job Seekers",
      total: stats.jobSeekers.total,
      active: stats.jobSeekers.active,
      inactive: stats.jobSeekers.inactive,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Employers",
      total: stats.employers.total,
      active: stats.employers.active,
      inactive: stats.employers.inactive,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Jobs Posted",
      total: stats.jobs.total,
      active: stats.jobs.active,
      inactive: stats.jobs.inactive,
      icon: Briefcase,
      color: "text-brand-orange",
      bgColor: "bg-orange-50",
    },
    {
      title: "Applications",
      total: stats.applications.total,
      active: stats.applications.active,
      inactive: stats.applications.closed,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Dashboard Overview</h2>
        <p className="text-neutral-text-secondary">Monitor platform activity and key metrics</p>
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-text-secondary">New Users Today</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-neutral-text">{stats.recentActivity.newUsersToday}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-text-secondary">New Jobs Today</span>
            <TrendingUp className="w-5 h-5 text-brand-orange" />
          </div>
          <p className="text-3xl font-bold text-neutral-text">{stats.recentActivity.newJobsToday}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-text-secondary">New Applications Today</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-neutral-text">{stats.recentActivity.newApplicationsToday}</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-lg border border-neutral-border overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-neutral-text-secondary mb-2">{card.title}</h3>
                <p className="text-3xl font-bold text-neutral-text mb-4">{card.total}</p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-neutral-border">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-neutral-text-secondary">
                      <span className="font-semibold text-green-600">{card.active}</span> Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-neutral-text-muted" />
                    <span className="text-sm text-neutral-text-secondary">
                      <span className="font-semibold text-neutral-text-muted">{card.inactive}</span> Inactive
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Health */}
      <div className="mt-8 bg-white rounded-lg border border-neutral-border p-6">
        <h3 className="text-lg font-semibold text-neutral-text mb-4">Platform Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-neutral-text-secondary mb-1">Active Rate (Job Seekers)</p>
            <p className="text-2xl font-bold text-neutral-text">
              {stats.jobSeekers.total > 0 
                ? Math.round((stats.jobSeekers.active / stats.jobSeekers.total) * 100) 
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-text-secondary mb-1">Active Rate (Employers)</p>
            <p className="text-2xl font-bold text-neutral-text">
              {stats.employers.total > 0 
                ? Math.round((stats.employers.active / stats.employers.total) * 100) 
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-text-secondary mb-1">Jobs Fill Rate</p>
            <p className="text-2xl font-bold text-neutral-text">
              {stats.jobs.total > 0 
                ? Math.round((stats.jobs.inactive / stats.jobs.total) * 100) 
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-text-secondary mb-1">Application Close Rate</p>
            <p className="text-2xl font-bold text-neutral-text">
              {stats.applications.total > 0 
                ? Math.round((stats.applications.closed / stats.applications.total) * 100) 
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
