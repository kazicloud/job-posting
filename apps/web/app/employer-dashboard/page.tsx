"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Briefcase, Users, Eye, CheckCircle, Clock, XCircle, AlertCircle, Plus, MapPin, TrendingUp } from "lucide-react";
import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import Link from "next/link";

export default function EmployerDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const employerAnalytics = useQuery(api.analytics.getEmployerAnalytics, {});
  const allJobsResult = useQuery(api.jobs.list, { paginationOpts: { numItems: 50, cursor: null }, sortBy: "newest" });

  const allJobs = allJobsResult?.page || [];
  const publishedJobs = allJobs.filter((j) => j.status === "published");
  const recentActiveJobs = publishedJobs.slice(0, 3);

  const isLoading = profile === undefined || employerAnalytics === undefined || allJobsResult === undefined;

  // Calculate employer profile completeness
  const calculateProfileCompleteness = () => {
    if (!profile?.employerProfile) return 0;
    
    const fields = [
      profile.employerProfile.companyName,
      profile.employerProfile.companySize,
      profile.employerProfile.companyIndustries?.length,
      profile.employerProfile.companyDescription,
      profile.employerProfile.website,
      profile.employerProfile.headquarters,
      profile.employerProfile.contactPersonName,
      profile.employerProfile.contactPersonPhone,
      profile.employerProfile.companyLogo || profile.employerProfile.companyLogoStorageId,
      profile.email,
    ];
    
    const filledFields = fields.filter(field => field).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = calculateProfileCompleteness();
  const isProfileComplete = completeness >= 100;

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  if (isLoading) {
    return (
      <EmployerDashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="w-full sm:w-auto">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-full sm:w-96 mb-2 animate-pulse"></div>
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-48 sm:w-64 animate-pulse"></div>
            </div>
            <div className="h-10 sm:h-11 bg-gray-200 rounded w-full sm:w-40 animate-pulse"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <JobsSectionSkeleton />
              <ApplicationsSectionSkeleton />
            </div>
            <div className="space-y-4 sm:space-y-6">
              <ProfileCardSkeleton />
              <QuickActionsSkeleton />
            </div>
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

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
  const activeJobs = publishedJobs.length;
  const totalApplications = employerAnalytics?.totalApplications || 0;
  const totalViews = employerAnalytics?.totalViews || 0;

  return (
    <EmployerDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Verification Status Banner */}
        {!isVerified && (
          <div className={`mb-4 sm:mb-6 p-4 sm:p-5 rounded-lg border ${
            verificationStatus === "under_review"
              ? "bg-blue-50 border-blue-200"
              : verificationStatus === "rejected"
              ? "bg-red-50 border-red-200"
              : "bg-yellow-50 border-yellow-200"
          }`}>
            <div className="flex items-start gap-2 sm:gap-3">
              {verificationStatus === "under_review" ? (
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              ) : verificationStatus === "rejected" ? (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-neutral-text mb-1">
                  {verificationStatus === "under_review"
                    ? "Verification in Progress"
                    : verificationStatus === "rejected"
                    ? "Verification Failed"
                    : "Verification Pending"}
                </p>
                <p className="text-xs sm:text-sm text-neutral-text-secondary leading-relaxed">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-text mb-1 sm:mb-2">
              Welcome back, {profile.employerProfile?.companyName}!
            </h1>
            <p className="text-sm sm:text-base text-neutral-text-secondary">
              Here's what's happening with your job postings
            </p>
          </div>
          {isVerified && (
            <Link
              href="/employer-dashboard/jobs/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Post New Job</span>
              <span className="sm:hidden">New Job</span>
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard 
            icon={<Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />} 
            label="Active Jobs" 
            value={activeJobs.toString()}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard 
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />} 
            label="Total Applications" 
            value={totalApplications.toString()}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard 
            icon={<Eye className="w-4 h-4 sm:w-5 sm:h-5" />} 
            label="Total Views" 
            value={totalViews.toString()}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard 
            icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />} 
            label="Conversion Rate" 
            value={`${employerAnalytics?.overallConversionRate || 0}%`}
            iconBg="bg-orange-50"
            iconColor="text-brand-orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Jobs & Applications */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Active Jobs */}
            <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-neutral-text">Active Jobs</h2>
                    <p className="text-xs sm:text-sm text-neutral-text-secondary mt-0.5">
                      {activeJobs} {activeJobs === 1 ? 'job' : 'jobs'} currently published
                    </p>
                  </div>
                  {isVerified && (
                    <Link
                      href="/employer-dashboard/jobs/new"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Post Job
                    </Link>
                  )}
                </div>
              </div>
              {/* Active jobs list or empty states */}
              {recentActiveJobs.length > 0 ? (
                <div className="divide-y divide-neutral-border">
                  {recentActiveJobs.map((job) => {
                    const jobStats = employerAnalytics?.jobAnalytics?.find(
                      (a) => a.jobId === job._id
                    );
                    return (
                      <ActiveJobMiniCard
                        key={job._id}
                        jobId={job._id}
                        title={job.title}
                        location={job.location}
                        employmentType={job.employmentType}
                        postedAt={job.createdAt}
                        views={jobStats?.viewCount || 0}
                        applications={jobStats?.applicationCount || 0}
                        conversionRate={jobStats?.conversionRate || 0}
                      />
                    );
                  })}
                  {publishedJobs.length > 3 && (
                    <div className="px-4 sm:px-6 py-4">
                      <Link
                        href="/employer-dashboard/jobs"
                        className="text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors"
                      >
                        View all {publishedJobs.length} active jobs →
                      </Link>
                    </div>
                  )}
                </div>
              ) : isVerified ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-neutral-bg-secondary rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-neutral-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-text mb-2">No active jobs yet</h3>
                  <p className="text-neutral-text-secondary mb-6 max-w-sm mx-auto">
                    Start attracting top talent by posting your first job opening
                  </p>
                  <Link
                    href="/employer-dashboard/jobs/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-text mb-2">Verification Required</h3>
                  <p className="text-neutral-text-secondary max-w-sm mx-auto">
                    Complete verification to start posting jobs and attracting candidates
                  </p>
                </div>
              )}
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-text">Recent Applications</h2>
                    <p className="text-sm text-neutral-text-secondary mt-0.5">
                      Latest candidates who applied to your jobs
                    </p>
                  </div>
                  <Link
                    href="/employer-dashboard/applications"
                    className="text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-neutral-bg-secondary rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-neutral-text-muted" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-text mb-2">No applications yet</h3>
                <p className="text-neutral-text-secondary max-w-sm mx-auto">
                  Applications will appear here once candidates start applying to your jobs
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Company Profile */}
            <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-border">
                <h3 className="font-semibold text-neutral-text">Company Profile</h3>
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-neutral-text-muted uppercase tracking-wide mb-1">
                      Company Name
                    </dt>
                    <dd className="text-sm text-neutral-text font-medium">
                      {profile.employerProfile?.companyName || "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-neutral-text-muted uppercase tracking-wide mb-1">
                      Industry
                    </dt>
                    <dd className="text-sm text-neutral-text font-medium">
                      {profile.employerProfile?.companyIndustries?.[0] || "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-neutral-text-muted uppercase tracking-wide mb-1">
                      Company Size
                    </dt>
                    <dd className="text-sm text-neutral-text font-medium">
                      {profile.employerProfile?.companySize || "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-neutral-text-muted uppercase tracking-wide mb-1">
                      Location
                    </dt>
                    <dd className="text-sm text-neutral-text font-medium">
                      {profile.employerProfile?.headquarters || profile.employerProfile?.country || "Not set"}
                    </dd>
                  </div>
                </dl>
                <Link
                  href="/employer-dashboard/settings"
                  className="block mt-6 text-sm text-brand-orange hover:text-brand-orange/80 font-medium transition-colors"
                >
                  Edit Profile →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-border">
                <h3 className="font-semibold text-neutral-text">Quick Actions</h3>
              </div>
              <div className="p-3">
                <Link
                  href="/employer-dashboard/jobs"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors group"
                >
                  <Briefcase className="w-4 h-4 text-neutral-text-muted group-hover:text-brand-orange transition-colors" />
                  <span className="font-medium">View All Jobs</span>
                </Link>
                <Link
                  href="/employer-dashboard/applications"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors group"
                >
                  <Users className="w-4 h-4 text-neutral-text-muted group-hover:text-brand-orange transition-colors" />
                  <span className="font-medium">View Applications</span>
                </Link>
                <Link
                  href="/employer-dashboard/analytics"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors group"
                >
                  <Eye className="w-4 h-4 text-neutral-text-muted group-hover:text-brand-orange transition-colors" />
                  <span className="font-medium">View Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

function ActiveJobMiniCard({
  jobId,
  title,
  location,
  employmentType,
  postedAt,
  views,
  applications,
  conversionRate,
}: {
  jobId: string;
  title: string;
  location: string;
  employmentType: string;
  postedAt: number;
  views: number;
  applications: number;
  conversionRate: number;
}) {
  const daysAgo = Math.floor((Date.now() - postedAt) / (1000 * 60 * 60 * 24));
  const postedLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

  return (
    <div className="px-4 sm:px-6 py-4 hover:bg-neutral-bg-secondary/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-neutral-text truncate">{title}</h4>
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700">
              Active
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{location}</span>
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {employmentType}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {postedLabel}
            </span>
          </div>
        </div>
        {/* Eye button → applications */}
        <Link
          href={`/employer-dashboard/applications?jobId=${jobId}`}
          className="flex-shrink-0 p-2 rounded-md border border-neutral-border text-neutral-text-secondary hover:text-brand-orange hover:border-brand-orange hover:bg-orange-50 transition-colors"
          title="View applications"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>
      {/* Stats row */}
      <div className="mt-3 flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-1.5 text-xs">
          <Eye className="w-3.5 h-3.5 text-neutral-text-muted" />
          <span className="font-semibold text-neutral-text">{views}</span>
          <span className="text-neutral-text-secondary">views</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Users className="w-3.5 h-3.5 text-neutral-text-muted" />
          <span className="font-semibold text-neutral-text">{applications}</span>
          <span className="text-neutral-text-secondary">applicants</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingUp className="w-3.5 h-3.5 text-neutral-text-muted" />
          <span className="font-semibold text-neutral-text">{conversionRate}%</span>
          <span className="text-neutral-text-secondary">conversion</span>
        </div>
        <Link
          href={`/employer-dashboard/jobs/${jobId}/preview`}
          className="ml-auto text-xs font-medium text-neutral-text-secondary hover:text-brand-orange transition-colors"
        >
          Preview
        </Link>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  iconBg,
  iconColor
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-neutral-border p-4 sm:p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-neutral-text mb-1">{value}</p>
      <p className="text-xs sm:text-sm text-neutral-text-secondary font-medium">{label}</p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-border p-4 sm:p-6 animate-pulse">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-7 sm:h-9 bg-gray-200 rounded w-16 sm:w-20 mb-1"></div>
      <div className="h-4 sm:h-5 bg-gray-200 rounded w-24 sm:w-32"></div>
    </div>
  );
}

function JobsSectionSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-border animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-9 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
      <div className="p-8 text-center animate-pulse">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full"></div>
        <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-6"></div>
        <div className="h-11 bg-gray-200 rounded w-48 mx-auto"></div>
      </div>
    </div>
  );
}

function ApplicationsSectionSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-border animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="p-8 text-center animate-pulse">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full"></div>
        <div className="h-6 bg-gray-200 rounded w-40 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
      </div>
    </div>
  );
}

function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-border animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="p-6 animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
          ))}
        </div>
        <div className="h-5 bg-gray-200 rounded w-28 mt-6"></div>
      </div>
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-border animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-28"></div>
      </div>
      <div className="p-3 animate-pulse space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

