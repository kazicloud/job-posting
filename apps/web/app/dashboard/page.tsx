"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import Link from "next/link";
import { Briefcase, TrendingUp, Users, MapPin, Clock, Bookmark, ArrowRight, Sparkles, Target, /* Bell, */ Eye, CheckCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

export default function DashboardPage() {
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const stats = useQuery(api.dashboard.getJobSeekerStats);
  const recentActivity = useQuery(api.dashboard.getRecentActivity, { limit: 3 });
  
  // Use smart recommendations with seed for variety on refresh
  const [seed] = useState(() => Date.now());
  const recommendedJobs = useQuery(api.recommendations.getSmartRecommendations, { 
    limit: 3,
    seed: seed,
  });
  
  const isLoading = profile === undefined || stats === undefined;
  const userFirstName = profile?.fullName?.split(" ")[0] || "there";
  const userField = profile?.jobSeekerProfile?.interestedFields?.[0] || "Technology";
  const completeness = profile?.jobSeekerProfile?.profileCompleteness || 0;
  const isProfileComplete = profile !== undefined && completeness >= 100;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary">
        {/* Hero Section */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-text mb-2">
                  Welcome back, {userFirstName}! 👋
                </h1>
                <p className="text-sm sm:text-base text-neutral-text-secondary">
                  {profile?.jobSeekerProfile?.openToWork 
                    ? "You're open to work. Here are opportunities matched to your profile."
                    : "Explore opportunities that match your skills and interests."}
                </p>
              </div>
              {profile !== undefined && (
                <Link
                  href="/dashboard/profile"
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-brand-orange border border-brand-orange rounded-md hover:bg-brand-orange/5 transition-colors text-center"
                >
                  {isProfileComplete ? "View Profile" : "Complete Profile"}
                </Link>
              )}
            </div>

            {/* Quick Stats */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
                <StatCard 
                  icon={<Briefcase className="w-5 h-5" />} 
                  label="Jobs for you" 
                  value={stats?.jobsForYou?.toString() || "0"}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  href="/dashboard/jobs"
                />
                <StatCard 
                  icon={<CheckCircle className="w-5 h-5" />} 
                  label="Applications" 
                  value={stats?.applications?.toString() || "0"}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                  href="/dashboard/applications"
                />
                <StatCard 
                  icon={<Bookmark className="w-5 h-5" />} 
                  label="Saved jobs" 
                  value={stats?.savedJobs?.toString() || "0"}
                  iconBg="bg-orange-50"
                  iconColor="text-brand-orange"
                  href="/dashboard/wishlist"
                />
                <StatCard 
                  icon={<Clock className="w-5 h-5" />} 
                  label="Last applied" 
                  value={
                    stats?.daysSinceLastApplication !== null && stats?.daysSinceLastApplication !== undefined
                      ? `${stats.daysSinceLastApplication}d ago`
                      : stats?.hoursSinceLastApplication !== null && stats?.hoursSinceLastApplication !== undefined
                      ? stats.hoursSinceLastApplication === 0
                        ? "Just now"
                        : `${stats.hoursSinceLastApplication}h ago`
                      : "Never"
                  }
                  iconBg="bg-purple-50"
                  iconColor="text-purple-600"
                  href="/dashboard/applications"
                />
                <StatCard 
                  icon={<Target className="w-5 h-5" />} 
                  label="Profile strength" 
                  value={`${stats?.profileStrength || 0}%`}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                  href="/dashboard/profile"
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recommended Jobs Section */}
              <div className="bg-white rounded-lg border border-neutral-border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-neutral-text">
                    Recommended for you
                  </h2>
                  <Link
                    href="/dashboard/jobs"
                    className="text-sm font-medium text-brand-orange hover:text-brand-orange/80"
                  >
                    See all
                  </Link>
                </div>

                <div className="space-y-4">
                  {recommendedJobs === undefined ? (
                    <>
                      <JobCardSkeleton />
                      <JobCardSkeleton />
                    </>
                  ) : recommendedJobs.length === 0 ? (
                    <div className="text-center py-8 text-neutral-text-secondary">
                      <p className="mb-2">No matching jobs found</p>
                      <p className="text-sm">Complete your profile and add skills to get better recommendations</p>
                    </div>
                  ) : (
                    <>
                      {recommendedJobs.map((job) => (
                        <JobCard
                          key={job._id}
                          jobId={job._id}
                          company={job.companyName}
                          logo={job.companyName.charAt(0).toUpperCase()}
                          title={job.title}
                          location={job.location}
                          type={job.employmentType}
                          salary={
                            job.salaryDisclosure === "range" && job.salaryMin && job.salaryMax
                              ? `${job.currency || "KES"} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                              : job.salaryDisclosure === "exact" && job.salaryMin
                              ? `${job.currency || "KES"} ${job.salaryMin.toLocaleString()}`
                              : "Competitive"
                          }
                          postedTime={formatPostedTime(job.createdAt)}
                          matchScore={job.matchPercentage}
                        />
                      ))}
                    </>
                  )}
                </div>

                <Link
                  href="/dashboard/jobs"
                  className="block text-center py-3 mt-4 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors"
                >
                  Show all {userField} jobs
                </Link>
              </div>

              {/* Career Resources - Shown last on mobile */}
              <div className="bg-white rounded-lg border border-neutral-border p-4 sm:p-6 order-last lg:order-none">
                <h2 className="text-base sm:text-lg font-semibold text-neutral-text mb-4">
                  Career resources
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ResourceCard
                    icon={<Target className="w-5 h-5" />}
                    title="Resume tips"
                    description="Stand out to employers"
                  />
                  <ResourceCard
                    icon={<Users className="w-5 h-5" />}
                    title="Interview prep"
                    description="Ace your next interview"
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6 order-first lg:order-none">
              {/* Job Alerts - Commented out until alert system is implemented
                  Alternative professional features to consider:
                  - Companies in user's field recruiting actively/now
                  - Companies following you / Recruiter views
                  - Salary insights for your role/location
                  - Skills in demand / Trending skills
                  - Application response rate / Success metrics
                  - Upcoming job fairs / Networking events
              */}
              {/* <div className="bg-white rounded-lg border border-neutral-border p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-brand-orange" />
                  <h3 className="font-semibold text-neutral-text">Job alerts</h3>
                </div>
                <p className="text-sm text-neutral-text-secondary mb-4">
                  Get notified about new {userField} jobs in Nairobi
                </p>
                <button className="w-full py-2 text-sm font-medium text-brand-orange border border-brand-orange rounded-md hover:bg-brand-orange/5 transition-colors">
                  Set up alerts
                </button>
              </div> */}

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-neutral-border p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-text mb-4">Recent activity</h3>
                {recentActivity === undefined ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-neutral-text-secondary">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <ActivityItem
                        key={index}
                        action={activity.action}
                        target={activity.target}
                        time={formatTimeAgo(activity.timestamp)}
                        jobId={activity.jobId}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Strength */}
              <div className="bg-white rounded-lg border border-neutral-border p-6">
                <h3 className="font-semibold text-neutral-text mb-4">Profile strength</h3>
                <div className="space-y-3">
                  <StrengthItem label="Profile photo" completed />
                  <StrengthItem label="Work experience" completed />
                  <StrengthItem label="Skills" completed />
                  <StrengthItem label="Certifications" completed={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function formatPostedTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (days < 30) return `${Math.floor(days / 7)} ${Math.floor(days / 7) === 1 ? 'week' : 'weeks'} ago`;
  return `${Math.floor(days / 30)} ${Math.floor(days / 30) === 1 ? 'month' : 'months'} ago`;
}

function StatCard({ icon, label, value, iconBg, iconColor, href }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  iconBg: string;
  iconColor: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-semibold text-neutral-text mb-0.5 sm:mb-1">{value}</p>
      <p className="text-xs text-neutral-text-secondary font-medium">{label}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block bg-white rounded-lg border border-neutral-border p-3 sm:p-4 hover:shadow-md hover:border-brand-orange/30 transition-all cursor-pointer">
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-border p-3 sm:p-4 hover:shadow-sm transition-shadow">
      {content}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-border p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-7 bg-gray-200 rounded w-16 mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  );
}

function JobCard({ jobId, company, logo, title, location, type, salary, postedTime, matchScore }: any) {
  return (
    <Link href={`/dashboard/jobs/${jobId}`} className="block">
      <div className="flex gap-3 p-3 sm:p-4 border border-neutral-border rounded-lg hover:border-brand-orange/30 hover:bg-neutral-bg-secondary/50 transition-all cursor-pointer group">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
          <span className="text-base sm:text-lg font-bold text-neutral-text">{logo}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-text group-hover:text-brand-orange transition-colors text-sm sm:text-base mb-0.5 truncate">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-text-secondary mb-1.5 truncate">{company}</p>
          <div className="flex items-center gap-2 text-xs text-neutral-text-muted flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px] sm:max-w-none">{location}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{type}</span>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          {matchScore >= 70 && (
            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
              {matchScore}%
            </span>
          )}
          <span className="text-xs text-neutral-text-muted hidden sm:block">{postedTime}</span>
        </div>
      </div>
    </Link>
  );
}

function JobCardSkeleton() {
  return (
    <div className="flex gap-3 p-3 sm:p-4 border border-neutral-border rounded-lg animate-pulse">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 min-w-0">
        <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16 hidden sm:block"></div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <div className="h-5 bg-gray-200 rounded-full w-12"></div>
        <div className="h-3 bg-gray-200 rounded w-16 hidden sm:block"></div>
      </div>
    </div>
  );
}

function ResourceCard({ icon, title, description }: any) {
  return (
    <div className="p-3 sm:p-4 border border-neutral-border rounded-lg hover:border-brand-orange/30 hover:shadow-sm transition-all cursor-pointer">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
        <div className="text-brand-orange">{icon}</div>
      </div>
      <h4 className="text-sm sm:text-base font-medium text-neutral-text mb-1">{title}</h4>
      <p className="text-xs text-neutral-text-secondary">{description}</p>
    </div>
  );
}

function ActivityItem({ action, target, time, jobId }: { action: string; target: string; time: string; jobId?: any }) {
  return (
    <Link href={jobId ? `/dashboard/jobs/${jobId}` : "#"} className="block">
      <div className="flex items-start gap-3 hover:bg-neutral-bg-secondary p-2 -m-2 rounded-md transition-colors">
        <div className="w-2 h-2 bg-brand-orange rounded-full mt-1.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-text">
            <span className="text-neutral-text-secondary">{action}</span> {target}
          </p>
          <p className="text-xs text-neutral-text-muted mt-0.5">{time}</p>
        </div>
      </div>
    </Link>
  );
}

function StrengthItem({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-text">{label}</span>
      {completed ? (
        <span className="text-green-600 text-sm">✓</span>
      ) : (
        <span className="text-xs text-neutral-text-muted">Add</span>
      )}
    </div>
  );
}
