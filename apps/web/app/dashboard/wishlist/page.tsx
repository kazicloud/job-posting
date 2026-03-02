"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { WishlistButton } from "@/components/wishlist-button";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { MapPin, Briefcase, Clock, Calendar, Building2, Home, Laptop, Award } from "lucide-react";

export default function WishlistPage() {
  const savedJobs = useQuery(api.wishlist.getUserWishlist);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-text mb-2">My Wishlist</h1>
            <p className="text-neutral-text-secondary">
              {savedJobs === undefined ? (
                "Loading..."
              ) : (
                `${savedJobs.length} job${savedJobs.length !== 1 ? 's' : ''} in your wishlist`
              )}
            </p>
          </div>

          {savedJobs === undefined ? (
            <div className="text-center py-12 text-neutral-text-secondary">
              Loading your wishlist...
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="bg-white border border-neutral-border rounded-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-neutral-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-neutral-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-text mb-2">Your wishlist is empty</h3>
                <p className="text-neutral-text-secondary mb-6">
                  Start adding jobs to your wishlist to easily find them later
                </p>
                <Link
                  href="/dashboard/jobs"
                  className="inline-block px-6 py-3 bg-brand-orange text-white font-medium rounded-lg hover:bg-brand-orange/90 transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJobs.filter(job => job !== null).map((job) => (
                <WishlistJobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function WishlistJobCard({ job }: { job: any }) {
  // Fetch employer profile for logo
  const employerProfile = useQuery(api.profile.getEmployerProfile, { userId: job.employerId as any });

  const getWorkplaceIcon = () => {
    switch (job.workplaceType?.toLowerCase()) {
      case 'remote':
        return <Home className="w-4 h-4" />;
      case 'hybrid':
        return <Laptop className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const formatExperience = (level: string) => {
    const map: Record<string, string> = {
      entry: "Entry Level",
      mid: "Mid Level",
      senior: "Senior",
      lead: "Lead",
      executive: "Executive"
    };
    return map[level] || level;
  };

  const getDaysLeft = () => {
    if (!job.applicationDeadline) return null;
    const deadline = new Date(job.applicationDeadline).getTime();
    const daysLeft = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : null;
  };

  const daysLeft = getDaysLeft();
  const isNew = Date.now() - job.createdAt < 48 * 60 * 60 * 1000;

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6 hover:shadow-md transition-all">
      <div className="flex gap-6">
        {/* Company Logo */}
        <div className="w-16 h-16 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {employerProfile?.companyLogo ? (
            <img 
              src={employerProfile.companyLogo} 
              alt={`${job.companyName} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-brand-orange">
              {job.companyName.charAt(0)}
            </span>
          )}
        </div>

        {/* Job Content */}
        <div className="flex-1 min-w-0">
          {/* Top Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 text-xs font-medium rounded-md bg-orange-50 text-orange-700 capitalize">
                {job.employmentType}
              </span>
              {job.department && (
                <span className="px-3 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700">
                  {job.department}
                </span>
              )}
              {isNew && <span className="px-2 py-1 text-xs font-semibold text-red-500">New</span>}
            </div>
            <div className="flex items-center gap-2">
              {daysLeft !== null && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-md">
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">
                    {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                  </span>
                </div>
              )}
              <WishlistButton jobId={job._id} />
            </div>
          </div>

          {/* Title and Company */}
          <Link href={`/dashboard/jobs/${job._id}`}>
            <h3 className="text-xl font-semibold text-neutral-text hover:text-brand-orange mb-1">
              {job.title}
            </h3>
          </Link>
          <p className="text-sm text-neutral-text-secondary mb-3">{job.companyName}</p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-neutral-text-secondary mb-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            {job.workplaceType && (
              <div className="flex items-center gap-1.5">
                {getWorkplaceIcon()}
                <span className="capitalize">{job.workplaceType}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>{formatExperience(job.experienceLevel)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Saved: {new Date(job.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {job.requiredSkills.slice(0, 5).map((skill: string, index: number) => (
                <span key={index} className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Action Button */}
          <Link
            href={`/dashboard/jobs/${job._id}`}
            className="inline-block px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-black/90 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
