"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import Link from "next/link";
import { Briefcase, TrendingUp, Users, MapPin, Clock, Bookmark, ArrowRight, Sparkles, Target, Bell } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function DashboardPage() {
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const stats = useQuery(api.dashboard.getJobSeekerStats);
  const recommendedJobs = useQuery(api.dashboard.getRecommendedJobs, { limit: 3 });
  
  const userFirstName = profile?.fullName?.split(" ")[0] || "there";
  const userField = profile?.jobSeekerProfile?.interestedFields?.[0] || "Technology";
  const completeness = profile?.jobSeekerProfile?.profileCompleteness || 0;
  const isProfileComplete = profile !== undefined && completeness >= 100;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary">
        {/* Hero Section */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-neutral-text mb-2">
                  Welcome back, {userFirstName}! 👋
                </h1>
                <p className="text-neutral-text-secondary">
                  {profile?.jobSeekerProfile?.openToWork 
                    ? "You're open to work. Here are opportunities matched to your profile."
                    : "Explore opportunities that match your skills and interests."}
                </p>
              </div>
              {profile !== undefined && (
                <Link
                  href="/dashboard/profile"
                  className="px-4 py-2 text-sm font-medium text-brand-orange border border-brand-orange rounded-md hover:bg-brand-orange/5 transition-colors"
                >
                  {isProfileComplete ? "View Profile" : "Complete Profile"}
                </Link>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <StatCard 
                icon={<Briefcase className="w-5 h-5" />} 
                label="Jobs for you" 
                value={stats?.jobsForYou?.toString() || "0"} 
              />
              <StatCard 
                icon={<TrendingUp className="w-5 h-5" />} 
                label="Response rate" 
                value={`${stats?.responseRate || 0}%`}
              />
              <StatCard 
                icon={<Users className="w-5 h-5" />} 
                label="Applications" 
                value={stats?.applications?.toString() || "0"} 
              />
              <StatCard 
                icon={<Bookmark className="w-5 h-5" />} 
                label="Saved jobs" 
                value={stats?.savedJobs?.toString() || "0"} 
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recommended Jobs Section */}
              <div className="bg-white rounded-lg border border-neutral-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-text">
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
                    <div className="text-center py-8 text-neutral-text-secondary">
                      Loading recommendations...
                    </div>
                  ) : recommendedJobs.length === 0 ? (
                    <div className="text-center py-8 text-neutral-text-secondary">
                      <p className="mb-2">No matching jobs found</p>
                      <p className="text-sm">Complete your profile and add skills to get better recommendations</p>
                    </div>
                  ) : (
                    recommendedJobs.map((job) => (
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
                    ))
                  )}
                </div>

                <Link
                  href="/dashboard/jobs"
                  className="block text-center py-3 mt-4 text-sm font-medium text-neutral-text border border-neutral-border rounded-md hover:bg-neutral-bg-secondary transition-colors"
                >
                  Show all {userField} jobs
                </Link>
              </div>

              {/* Career Resources */}
              <div className="bg-white rounded-lg border border-neutral-border p-6">
                <h2 className="text-lg font-semibold text-neutral-text mb-4">
                  Career resources
                </h2>
                <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-6">
              {/* Job Alerts - Commented out until alert system is implemented
                  Alternative professional features to consider:
                  - Companies in user's field recruiting actively/now
                  - Companies following you / Recruiter views
                  - Salary insights for your role/location
                  - Skills in demand / Trending skills
                  - Application response rate / Success metrics
                  - Upcoming job fairs / Networking events
              */}
              {/* <div className="bg-white rounded-lg border border-neutral-border p-6">
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
              <div className="bg-white rounded-lg border border-neutral-border p-6">
                <h3 className="font-semibold text-neutral-text mb-4">Recent activity</h3>
                <div className="space-y-4">
                  <ActivityItem
                    action="Applied to"
                    target="Backend Developer at Andela"
                    time="2 hours ago"
                  />
                  <ActivityItem
                    action="Saved"
                    target="Product Manager at Jumia"
                    time="1 day ago"
                  />
                  <ActivityItem
                    action="Viewed"
                    target="Data Analyst at Cellulant"
                    time="3 days ago"
                  />
                </div>
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

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend?: string }) {
  return (
    <div className="bg-neutral-bg-secondary rounded-lg p-4">
      <div className="flex items-center gap-2 text-neutral-text-secondary mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-neutral-text">{value}</span>
        {trend && <span className="text-xs font-medium text-green-600">{trend}</span>}
      </div>
    </div>
  );
}

function JobCard({ jobId, company, logo, title, location, type, salary, postedTime, matchScore }: any) {
  return (
    <Link href={`/dashboard/jobs/${jobId}`}>
      <div className="flex gap-4 p-4 border border-neutral-border rounded-lg hover:border-brand-orange/30 hover:shadow-sm transition-all cursor-pointer">
        <div className="w-12 h-12 bg-neutral-bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-neutral-text">{logo}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-neutral-text hover:text-brand-orange transition-colors">
              {title}
            </h3>
            {matchScore >= 80 && (
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                {matchScore}% match
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-text-secondary mb-2">{company}</p>
          <div className="flex items-center gap-3 text-xs text-neutral-text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
            <span>•</span>
            <span>{type}</span>
            <span>•</span>
            <span className="font-medium text-neutral-text">{salary}</span>
          </div>
          <p className="text-xs text-neutral-text-muted mt-2">{postedTime}</p>
        </div>
      </div>
    </Link>
  );
}

function ResourceCard({ icon, title, description }: any) {
  return (
    <div className="p-4 border border-neutral-border rounded-lg hover:border-brand-orange/30 hover:shadow-sm transition-all cursor-pointer">
      <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-3">
        <div className="text-brand-orange">{icon}</div>
      </div>
      <h4 className="font-medium text-neutral-text mb-1">{title}</h4>
      <p className="text-xs text-neutral-text-secondary">{description}</p>
    </div>
  );
}

function ActivityItem({ action, target, time }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 bg-brand-orange rounded-full mt-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-text">
          <span className="text-neutral-text-secondary">{action}</span> {target}
        </p>
        <p className="text-xs text-neutral-text-muted mt-0.5">{time}</p>
      </div>
    </div>
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
