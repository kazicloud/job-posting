"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Briefcase, Users, Eye, CheckCircle, Clock, XCircle, AlertCircle, Plus } from "lucide-react";
import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import Link from "next/link";

export default function EmployerDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const employerAnalytics = useQuery(api.analytics.getEmployerAnalytics);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-text">Loading...</div>
      </div>
    );
  }

  const verificationStatus = profile.employerProfile?.verificationStatus || "pending";
  const isVerified = verificationStatus === "verified";

  // Get stats from analytics
  const activeJobs = employerAnalytics?.totalJobs || 0;
  const totalApplications = employerAnalytics?.totalApplications || 0;
  const totalViews = employerAnalytics?.totalViews || 0;

  return (
    <EmployerDashboardLayout>
      <div className="p-8">
        {/* Verification Status Banner */}
        {!isVerified && (
          <div className={`mb-6 p-4 rounded-lg border ${
            verificationStatus === "under_review"
              ? "bg-blue-50 border-blue-200"
              : verificationStatus === "rejected"
              ? "bg-red-50 border-red-200"
              : "bg-yellow-50 border-yellow-200"
          }`}>
            <div className="flex items-start gap-3">
              {verificationStatus === "under_review" ? (
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              ) : verificationStatus === "rejected" ? (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-neutral-text mb-1">
                  {verificationStatus === "under_review"
                    ? "Verification in Progress"
                    : verificationStatus === "rejected"
                    ? "Verification Failed"
                    : "Verification Pending"}
                </p>
                <p className="text-sm text-neutral-text-secondary">
                  {verificationStatus === "under_review"
                    ? "We're reviewing your documents. You'll be able to post jobs once verified (typically 24-48 hours)."
                    : verificationStatus === "rejected"
                    ? `Reason: ${profile.employerProfile?.rejectionReason || "Please contact support for details."}`
                    : "Your account is pending verification. You'll be notified once approved."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-text mb-2">
            Welcome back, {profile.employerProfile?.companyName}!
          </h1>
          <p className="text-neutral-text-secondary">
            Here's what's happening with your job postings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<Briefcase className="w-5 h-5" />} 
            label="Active Jobs" 
            value={activeJobs.toString()}
            trend="+0 this week"
            trendUp={false}
          />
          <StatCard 
            icon={<Users className="w-5 h-5" />} 
            label="Total Applications" 
            value={totalApplications.toString()}
            trend="+0 this week"
            trendUp={false}
          />
          <StatCard 
            icon={<Eye className="w-5 h-5" />} 
            label="Total Views" 
            value={totalViews.toString()}
            trend="+0 this week"
            trendUp={false}
          />
          <StatCard 
            icon={<CheckCircle className="w-5 h-5" />} 
            label="Conversion Rate" 
            value={`${employerAnalytics?.overallConversionRate || 0}%`}
            trend="Views to applications"
            trendUp={false}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Jobs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Jobs */}
            <div className="bg-white rounded-lg border border-neutral-border">
              <div className="p-6 border-b border-neutral-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-text">Active Jobs</h2>
                  {isVerified && (
                    <Link
                      href="/employer-dashboard/jobs/new"
                      className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90"
                    >
                      <Plus className="w-4 h-4" />
                      Post Job
                    </Link>
                  )}
                </div>
              </div>
              <div className="p-12 text-center">
                {isVerified ? (
                  <>
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-neutral-text-muted" />
                    <p className="text-neutral-text-secondary mb-4">No active jobs yet</p>
                    <Link
                      href="/employer-dashboard/jobs/new"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90"
                    >
                      <Plus className="w-4 h-4" />
                      Post Your First Job
                    </Link>
                  </>
                ) : (
                  <>
                    <Clock className="w-12 h-12 mx-auto mb-3 text-neutral-text-muted" />
                    <p className="text-neutral-text-secondary">Complete verification to start posting jobs</p>
                  </>
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg border border-neutral-border">
              <div className="p-6 border-b border-neutral-border">
                <h2 className="text-lg font-semibold text-neutral-text">Recent Applications</h2>
              </div>
              <div className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-neutral-text-muted" />
                <p className="text-neutral-text-secondary">No applications yet</p>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Company Profile */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <h3 className="font-semibold text-neutral-text mb-4">Company Profile</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-neutral-text-secondary mb-1">Company Name</dt>
                  <dd className="text-neutral-text font-medium">
                    {profile.employerProfile?.companyName || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-text-secondary mb-1">Industry</dt>
                  <dd className="text-neutral-text font-medium">
                    {profile.employerProfile?.companyIndustries?.[0] || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-text-secondary mb-1">Company Size</dt>
                  <dd className="text-neutral-text font-medium">
                    {profile.employerProfile?.companySize || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-text-secondary mb-1">Location</dt>
                  <dd className="text-neutral-text font-medium">
                    {profile.employerProfile?.headquarters || profile.employerProfile?.country || "Not set"}
                  </dd>
                </div>
              </dl>
              <Link
                href="/employer-dashboard/settings"
                className="block mt-4 text-sm text-brand-orange hover:underline font-medium"
              >
                Edit Profile →
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <h3 className="font-semibold text-neutral-text mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/employer-dashboard/jobs"
                  className="block px-4 py-2.5 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
                >
                  View All Jobs
                </Link>
                <Link
                  href="/employer-dashboard/applications"
                  className="block px-4 py-2.5 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
                >
                  View Applications
                </Link>
                <Link
                  href="/employer-dashboard/analytics"
                  className="block px-4 py-2.5 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
                >
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  trend, 
  trendUp 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-neutral-border p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center text-brand-orange">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-neutral-text mb-1">{value}</p>
      <p className="text-sm text-neutral-text-secondary">{label}</p>
      <p className={`text-xs mt-2 ${trendUp ? "text-green-600" : "text-neutral-text-muted"}`}>
        {trend}
      </p>
    </div>
  );
}

