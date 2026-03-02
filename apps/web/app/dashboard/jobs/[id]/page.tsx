"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { WishlistButton } from "@/components/wishlist-button";
import { ShareButton } from "@/components/share-button";
import Link from "next/link";
import { ChevronLeft, MapPin, Briefcase, Clock, GraduationCap, Globe, Building2, Calendar, Share2, Bookmark, CheckCircle2, Flag } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useState, use } from "react";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const jobId = id as Id<"jobs">;
  const job = useQuery(api.jobs.get, { id: jobId });
  const hasApplied = useQuery(api.applications.hasApplied, { jobId });
  const skillMatch = useQuery(api.matching.calculateSkillMatch, { jobId });
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const jobAnalytics = useQuery(api.analytics.getJobAnalytics, { jobId });
  const employerProfile = useQuery(api.profile.getEmployerProfile, 
    job ? { userId: job.employerId as any } : "skip"
  );
  const apply = useMutation(api.applications.apply);
  const trackView = useMutation(api.analytics.trackView);
  
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState<"job" | "company">("job");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  // Track view once when job loads
  if (job && !viewTracked) {
    trackView({ jobId }).then(() => setViewTracked(true));
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const checkProfileCompleteness = () => {
    if (!profile) return { complete: false, missing: ["Profile not loaded"] };
    
    const missing = [];
    if (!profile.jobSeekerProfile?.about) missing.push("About/Bio");
    if (!profile.phone) missing.push("Phone number");
    
    return { complete: missing.length === 0, missing };
  };

  const formatSalary = () => {
    if (job.salaryDisclosure === "undisclosed") return "Salary undisclosed";
    if (job.salaryMin && job.salaryMax) {
      return `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
    }
    return "Negotiable";
  };

  const getDaysAgo = () => {
    const days = Math.floor((Date.now() - job.createdAt) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const getDeadline = () => {
    if (!job.applicationDeadline) return null;
    const deadline = new Date(job.applicationDeadline);
    const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return "Expired";
    if (daysLeft === 0) return "Today";
    return `${daysLeft} days left to apply`;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Back Navigation */}
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base font-medium">Back to jobs</span>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Job Header */}
              <div className="bg-white">
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-orange to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200 overflow-hidden">
                    {employerProfile?.companyLogo ? (
                      <img 
                        src={employerProfile.companyLogo} 
                        alt={`${job.companyName} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-bold text-white">
                        {job.companyName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-600 truncate">
                        {job.companyName}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Verified</span>
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight break-words">
                      {job.title}
                    </h1>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{job.location}</span>
                      </div>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                      </div>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="capitalize">{job.workplaceType}</span>
                      </div>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span>Posted {getDaysAgo()}</span>
                      </div>
                    </div>

                    {/* Deadline Badge */}
                    {getDeadline() && (
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                        <span className="text-xs sm:text-sm font-medium text-orange-700">{getDeadline()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-100">
                  {hasApplied ? (
                    <div className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-50 text-green-700 rounded-lg font-semibold">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Applied</span>
                    </div>
                  ) : (
                    <Link
                      href={`/dashboard/jobs/${jobId}/apply`}
                      className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-orange text-white font-semibold rounded-lg hover:bg-brand-orange/90 transition-all hover:shadow-lg hover:shadow-orange-200"
                    >
                      Apply Now
                    </Link>
                  )}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ShareButton 
                      jobId={jobId} 
                      jobTitle={job.title} 
                      className="p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    />
                    <WishlistButton jobId={jobId} className="p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Mobile: Show Stats & Match Cards Here */}
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Application Stats */}
                <div className="bg-white border border-neutral-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-neutral-text mb-3">Application Stats</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-text-secondary">Applicants</span>
                      <span className="text-sm font-medium text-neutral-text">
                        {jobAnalytics?.applicationCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-text-secondary">Your position</span>
                      <span className="text-sm font-medium text-green-600">
                        Top 20%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Score Card */}
                {skillMatch && skillMatch.totalRequired > 0 && (
                  <div className="bg-white border border-neutral-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-neutral-text mb-3">Your Match</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <CheckCircle2
                            key={i}
                            className={`w-4 h-4 ${
                              i < skillMatch.matchScore
                                ? 'text-green-500 fill-green-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-bold text-neutral-text">{skillMatch.matchScore}/5</span>
                    </div>
                    <p className="text-xs text-neutral-text-secondary mb-3">
                      {skillMatch.matchedCount} of {skillMatch.totalRequired} skills ({skillMatch.matchPercentage}%)
                    </p>
                    {skillMatch.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {skillMatch.matchedSkills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {skillMatch.matchedSkills.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-neutral-text-muted">
                            +{skillMatch.matchedSkills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Job Details Grid */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Job Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{job.location}{job.county && `, ${job.county}`}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contract Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{job.employmentType.replace('-', ' ')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Workplace</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{job.workplaceType.replace('-', ' ')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Experience</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{job.experienceLevel}</p>
                    </div>
                  </div>

                  {job.department && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Department</p>
                        <p className="text-sm font-medium text-gray-900">{job.department}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Salary</p>
                      <p className="text-sm font-medium text-gray-900">{formatSalary()}</p>
                    </div>
                  </div>
                </div>

                {/* Required Skills */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-white border border-orange-200 text-orange-700 text-sm rounded-lg font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
                <div className="border-b border-neutral-border">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("job")}
                      className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === "job"
                          ? "text-brand-orange border-b-2 border-brand-orange"
                          : "text-neutral-text-secondary hover:text-neutral-text"
                      }`}
                    >
                      About the job
                    </button>
                    <button
                      onClick={() => setActiveTab("company")}
                      className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === "company"
                          ? "text-brand-orange border-b-2 border-brand-orange"
                          : "text-neutral-text-secondary hover:text-neutral-text"
                      }`}
                    >
                      Company
                    </button>
                  </div>
                </div>

                {/* Content with subtle gradient overlay */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-bg-secondary/5 to-transparent pointer-events-none"></div>
                  <div className="relative p-6">
                    {activeTab === "job" ? (
                      <div className="space-y-6">
                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-text mb-3">Description</h3>
                          <p className="text-neutral-text-secondary leading-relaxed whitespace-pre-line">
                            {job.description}
                          </p>
                        </div>

                        {/* Responsibilities */}
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-text mb-3">Responsibilities</h3>
                          <ul className="space-y-2">
                            {job.responsibilities.split('\n').filter(line => line.trim()).map((line, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-brand-orange mt-1 flex-shrink-0">•</span>
                                <span className="text-neutral-text-secondary">{line.replace(/^[•\-]\s*/, '')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Requirements */}
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-text mb-3">Requirements</h3>
                          <ul className="space-y-2">
                            {job.requirements.split('\n').filter(line => line.trim()).map((line, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-brand-orange mt-1 flex-shrink-0">•</span>
                                <span className="text-neutral-text-secondary">{line.replace(/^[•\-]\s*/, '')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Nice to Have */}
                        {job.niceToHave && (
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-text mb-3">Nice to Have</h3>
                            <ul className="space-y-2">
                              {job.niceToHave.split('\n').filter(line => line.trim()).map((line, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="text-brand-orange mt-1 flex-shrink-0">•</span>
                                  <span className="text-neutral-text-secondary">{line.replace(/^[•\-]\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Benefits */}
                        {job.benefits && (
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-text mb-3">Benefits & Perks</h3>
                            <ul className="space-y-2">
                              {job.benefits.split('\n').filter(line => line.trim()).map((line, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="text-brand-orange mt-1 flex-shrink-0">•</span>
                                  <span className="text-neutral-text-secondary">{line.replace(/^[•\-]\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-text mb-2">About {job.companyName}</h3>
                          <p className="text-neutral-text-secondary">
                            Company information will be displayed here once employer profiles are fully integrated.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Similar Jobs Section */}
              <div className="bg-white border border-neutral-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-text mb-4">Similar Jobs</h3>
                <div className="space-y-3">
                  <p className="text-sm text-neutral-text-secondary">
                    More jobs matching your profile will appear here
                  </p>
                </div>
              </div>

              {/* Report Job */}
              <div className="text-center">
                <button className="text-sm text-neutral-text-muted hover:text-neutral-text-secondary transition-colors">
                  🚩 Report this job
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6 hidden lg:block">
              {/* Application Stats */}
              <div className="bg-white border border-neutral-border rounded-lg p-6">
                <h3 className="text-sm font-semibold text-neutral-text mb-3">Application Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-text-secondary">Applicants</span>
                    <span className="text-sm font-medium text-neutral-text">
                      {jobAnalytics?.applicationCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-text-secondary">Your position</span>
                    <span className="text-sm font-medium text-green-600">
                      Top 20%
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Score Card */}
              {skillMatch && skillMatch.totalRequired > 0 && (
                <div className="bg-white border border-neutral-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-text mb-4">Your Match</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <CheckCircle2
                          key={i}
                          className={`w-5 h-5 ${
                            i < skillMatch.matchScore
                              ? 'text-green-500 fill-green-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-bold text-neutral-text">{skillMatch.matchScore}/5</span>
                  </div>
                  <p className="text-sm text-neutral-text-secondary mb-4">
                    You match {skillMatch.matchedCount} of {skillMatch.totalRequired} required skills ({skillMatch.matchPercentage}%)
                  </p>
                  {skillMatch.matchedSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-neutral-text mb-2">Matched Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {skillMatch.matchedSkills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Apply Card */}
              <div className="bg-white border border-neutral-border rounded-lg p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-neutral-text mb-4">Ready to apply?</h3>
                
                {/* Quick Apply Toggle */}
                {!hasApplied && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="quickApply"
                        className="mt-1"
                      />
                      <label htmlFor="quickApply" className="text-sm text-blue-900">
                        <span className="font-medium">Quick Apply</span>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Apply instantly with your profile
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {hasApplied ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">Application Submitted</p>
                    <p className="text-sm text-neutral-text-secondary mt-1">
                      The employer will review your application
                    </p>
                  </div>
                ) : (
                  <Link
                    href={`/dashboard/jobs/${jobId}/apply`}
                    className="block w-full py-2.5 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 transition-colors text-center"
                  >
                    Apply Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-text mb-2">Application Submitted!</h2>
              <p className="text-neutral-text-secondary mb-6">
                Your application for <span className="font-medium">{job.title}</span> at {job.companyName} has been successfully submitted.
              </p>
              <p className="text-sm text-neutral-text-muted mb-6">
                The employer will review your application and contact you if you're a good fit.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-2.5 border border-neutral-border text-neutral-text text-sm font-medium rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/dashboard/applications"
                  className="flex-1 py-2.5 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 transition-colors text-center"
                >
                  View Applications
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
