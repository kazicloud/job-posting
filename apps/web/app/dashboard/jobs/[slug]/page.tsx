"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { WishlistButton } from "@/components/wishlist-button";
import { ShareButton } from "@/components/share-button";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Briefcase,
  Clock,
  GraduationCap,
  Globe,
  Building2,
  Calendar,
  CheckCircle2,
  Award,
  Home,
  Laptop,
  ArrowRight,
  Sparkles,
  Users,
  Eye,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useState, use } from "react";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Detect whether `slug` is a URL slug (contains hyphens) or a raw Convex ID.
  // Slugs always contain hyphens; Convex IDs are alphanumeric-only.
  const isSlug = slug.includes("-");

  const jobBySlug = useQuery(
    api.jobs.getPublicBySlug,
    isSlug ? { slug } : "skip"
  );
  // For raw Convex IDs (backward-compat)
  const jobById = useQuery(
    api.jobs.get,
    !isSlug ? { id: slug as Id<"jobs"> } : "skip"
  );

  const job = isSlug ? jobBySlug : jobById;
  const jobId = job?._id;

  const hasApplied = useQuery(
    api.applications.hasApplied,
    jobId ? { jobId } : "skip"
  );
  const skillMatch = useQuery(
    api.matching.calculateSkillMatch,
    jobId ? { jobId } : "skip"
  );
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const jobAnalytics = useQuery(
    api.analytics.getJobAnalytics,
    jobId ? { jobId } : "skip"
  );
  const employerProfile = useQuery(
    api.profile.getEmployerProfile,
    job ? { userId: job.employerId as Id<"users"> } : "skip"
  );
  const similarJobs = useQuery(
    api.jobs.getSimilarJobs,
    jobId ? { jobId, limit: 3 } : "skip"
  );

  const trackView = useMutation(api.analytics.trackView);
  const [viewTracked, setViewTracked] = useState(false);
  const [activeTab, setActiveTab] = useState<"job" | "company">("job");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Track view once when job loads
  if (job && jobId && !viewTracked) {
    trackView({ jobId }).then(() => setViewTracked(true));
  }

  if (job === undefined) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white">
          <div className="border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-neutral-text mb-2">
              Job not found
            </h2>
            <p className="text-neutral-text-secondary mb-4">
              This job may have been removed or the link is invalid.
            </p>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Browse jobs
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const applyHref = job.slug
    ? `/dashboard/jobs/${job.slug}/apply`
    : `/dashboard/jobs/${jobId}/apply`;

  const formatSalary = () => {
    if (job.salaryDisclosure === "undisclosed") return "Salary undisclosed";
    if (job.salaryMin && job.salaryMax)
      return `${job.currency || "KES"} ${job.salaryMin.toLocaleString()} \u2013 ${job.salaryMax.toLocaleString()}`;
    if (job.salaryMin)
      return `${job.currency || "KES"} ${job.salaryMin.toLocaleString()}+`;
    return "Negotiable";
  };

  const getDaysAgo = () => {
    const days = Math.floor(
      (Date.now() - job.createdAt) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const getDeadline = () => {
    if (!job.applicationDeadline) return null;
    const daysLeft = Math.ceil(
      (new Date(job.applicationDeadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) return "Expired";
    if (daysLeft === 0) return "Closes today";
    return `${daysLeft} days left`;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Back Navigation */}
        <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to jobs
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                {/* Company + verified */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-orange to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-100 overflow-hidden">
                    {employerProfile?.companyLogo ? (
                      <img
                        src={employerProfile.companyLogo}
                        alt={`${job.companyName} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {job.companyName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {job.companyName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Posted {getDaysAgo()}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {job.title}
                </h1>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE4C4] text-orange-800 text-xs font-medium rounded-full capitalize">
                    <Clock className="w-3.5 h-3.5" />
                    {job.employmentType.replace(/-/g, " ")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F0FC] text-blue-800 text-xs font-medium rounded-full capitalize">
                    {job.workplaceType === "remote" ? (
                      <Home className="w-3.5 h-3.5" />
                    ) : job.workplaceType === "hybrid" ? (
                      <Laptop className="w-3.5 h-3.5" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5" />
                    )}
                    {job.workplaceType.replace(/-/g, " ")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {job.experienceLevel}
                  </span>
                  {job.department && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] text-green-800 text-xs font-medium rounded-full">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.department}
                    </span>
                  )}
                  {getDeadline() && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full">
                      <Calendar className="w-3.5 h-3.5" />
                      {getDeadline()}
                    </span>
                  )}
                </div>

                {/* Salary */}
                {job.salaryDisclosure !== "undisclosed" && (
                  <p className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
                    {formatSalary()}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      / month
                    </span>
                  </p>
                )}

                {/* CTA row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-5 border-t border-gray-100">
                  {hasApplied ? (
                    <div className="flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-semibold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      Applied
                    </div>
                  ) : (
                    <Link
                      href={applyHref}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange text-white font-semibold text-sm rounded-xl hover:bg-brand-orange/90 active:scale-[0.98] transition-all shadow-md shadow-orange-100"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <ShareButton
                    jobId={jobId as Id<"jobs">}
                    jobTitle={job.title}
                    jobSlug={job.slug}
                    className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  />
                  <WishlistButton
                    jobId={jobId as Id<"jobs">}
                    className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>

              {/* Mobile: stats + match */}
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Application stats
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        Applicants
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {jobAnalytics?.applicationCount ?? "\u2014"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Eye className="w-3.5 h-3.5" />
                        Views
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {jobAnalytics?.viewCount ?? "\u2014"}
                      </span>
                    </div>
                  </div>
                </div>
                {skillMatch && skillMatch.totalRequired > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <MatchCard skillMatch={skillMatch} />
                  </div>
                )}
              </div>

              {/* Job Details grid */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-5">
                  Job Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <DetailItem
                    icon={<MapPin className="w-4 h-4 text-gray-500" />}
                    label="Location"
                    value={`${job.location}${job.county ? `, ${job.county}` : ""}`}
                  />
                  <DetailItem
                    icon={<Briefcase className="w-4 h-4 text-gray-500" />}
                    label="Contract Type"
                    value={job.employmentType.replace(/-/g, " ")}
                    capitalize
                  />
                  <DetailItem
                    icon={<Building2 className="w-4 h-4 text-gray-500" />}
                    label="Workplace"
                    value={job.workplaceType.replace(/-/g, " ")}
                    capitalize
                  />
                  <DetailItem
                    icon={<GraduationCap className="w-4 h-4 text-gray-500" />}
                    label="Experience"
                    value={job.experienceLevel}
                    capitalize
                  />
                  {job.department && (
                    <DetailItem
                      icon={<Globe className="w-4 h-4 text-gray-500" />}
                      label="Department"
                      value={job.department}
                    />
                  )}
                  {job.salaryDisclosure !== "undisclosed" && (
                    <DetailItem
                      icon={<Award className="w-4 h-4 text-gray-500" />}
                      label="Salary"
                      value={formatSalary()}
                    />
                  )}
                </div>

                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-white border border-orange-200 text-orange-700 text-xs font-medium rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.preferredSkills && job.preferredSkills.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">
                      Nice to Have
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.preferredSkills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex border-b border-gray-200">
                  {(["job", "company"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3.5 text-sm font-semibold transition-colors ${
                        activeTab === tab
                          ? "text-brand-orange border-b-2 border-brand-orange -mb-px"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {tab === "job" ? "About the job" : "Company"}
                    </button>
                  ))}
                </div>

                <div className="p-6 sm:p-8">
                  {activeTab === "job" ? (
                    <div className="space-y-7">
                      <RichSection title="Description" content={job.description} />
                      <RichSection title="Responsibilities" content={job.responsibilities} />
                      <RichSection title="Requirements" content={job.requirements} />
                      {job.niceToHave && (
                        <RichSection title="Nice to Have" content={job.niceToHave} />
                      )}
                      {job.benefits && (
                        <RichSection title="Benefits & Perks" content={job.benefits} />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-gray-900">
                        About {job.companyName}
                      </h3>
                      {employerProfile ? (
                        <div className="space-y-3">
                          {employerProfile.companyDescription && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {employerProfile.companyDescription}
                            </p>
                          )}
                          {employerProfile.companyIndustries &&
                            employerProfile.companyIndustries.length > 0 && (
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-700">Industry: </span>
                                {employerProfile.companyIndustries.join(", ")}
                              </p>
                            )}
                          {employerProfile.companySize && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-700">Company size: </span>
                              {employerProfile.companySize}
                            </p>
                          )}
                          {employerProfile.website && (
                            <a
                              href={employerProfile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-brand-orange hover:underline"
                            >
                              Visit website <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {!employerProfile.companyDescription && !employerProfile.companySize && (
                            <p className="text-sm text-gray-400">
                              Company profile details are not yet available.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Loading company information…</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Similar Jobs */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-brand-orange" />
                  <h2 className="text-base font-bold text-gray-900">Similar Jobs</h2>
                </div>

                {similarJobs === undefined ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <SimilarJobSkeleton key={i} />
                    ))}
                  </div>
                ) : similarJobs.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-400">
                      No similar jobs found right now.
                    </p>
                    <Link
                      href="/dashboard/jobs"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-orange hover:underline"
                    >
                      Browse all jobs <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {similarJobs.map((sJob: any) => (
                      <SimilarJobCard key={sJob._id} job={sJob} />
                    ))}
                  </div>
                )}
              </div>

              {/* Report */}
              <div className="text-center pb-4">
                <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  🚩 Report this job
                </button>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="hidden lg:block space-y-5">
              {/* Apply card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-20">
                <h3 className="text-base font-bold text-gray-900 mb-1">Ready to apply?</h3>
                <p className="text-xs text-gray-400 mb-5">It only takes a few minutes</p>

                {hasApplied ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 font-semibold text-sm">Application Submitted</p>
                    <p className="text-xs text-gray-400 mt-1">
                      The employer will review your application
                    </p>
                  </div>
                ) : (
                  <Link
                    href={applyHref}
                    className="block w-full text-center py-3 bg-brand-orange text-white text-sm font-semibold rounded-xl hover:bg-brand-orange/90 transition-all shadow-md shadow-orange-100 active:scale-[0.98]"
                  >
                    Apply Now
                  </Link>
                )}

                <div className="mt-5 space-y-3 pt-5 border-t border-gray-100">
                  <SidebarFactRow
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="Location"
                    value={job.location}
                  />
                  <SidebarFactRow
                    icon={<Briefcase className="w-3.5 h-3.5" />}
                    label="Type"
                    value={job.employmentType.replace(/-/g, " ")}
                    capitalize
                  />
                  {job.salaryDisclosure !== "undisclosed" && (
                    <SidebarFactRow
                      icon={<Award className="w-3.5 h-3.5" />}
                      label="Salary"
                      value={formatSalary()}
                    />
                  )}
                  {getDeadline() && (
                    <SidebarFactRow
                      icon={<Calendar className="w-3.5 h-3.5" />}
                      label="Deadline"
                      value={getDeadline()!}
                    />
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Application stats
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Users className="w-3.5 h-3.5" /> Applicants
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {jobAnalytics?.applicationCount ?? "\u2014"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Eye className="w-3.5 h-3.5" /> Views
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {jobAnalytics?.viewCount ?? "\u2014"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skill match */}
              {skillMatch && skillMatch.totalRequired > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <MatchCard skillMatch={skillMatch} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-500 mb-6 text-sm">
                Your application for{" "}
                <span className="font-semibold text-gray-800">{job.title}</span>{" "}
                at {job.companyName} has been submitted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/dashboard/applications"
                  className="flex-1 py-2.5 bg-brand-orange text-white text-sm font-semibold rounded-xl hover:bg-brand-orange/90 transition-colors text-center"
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

// ─── Sub-components ────────────────────────────────────────────────────────────

function DetailItem({
  icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className={`text-sm font-medium text-gray-900 ${capitalize ? "capitalize" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function RichSection({ title, content }: { title: string; content: string }) {
  const lines = content
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => l.replace(/^[•\-]\s*/, ""));

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-3">{title}</h3>
      {lines.length <= 1 ? (
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
      ) : (
        <ul className="space-y-2">
          {lines.map((line, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-orange flex-shrink-0" />
              <span className="text-sm text-gray-600 leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MatchCard({
  skillMatch,
}: {
  skillMatch: {
    matchScore: number;
    matchedCount: number;
    totalRequired: number;
    matchPercentage: number;
    matchedSkills: string[];
  };
}) {
  const pct = skillMatch.matchPercentage;
  const color =
    pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-400" : "bg-gray-300";
  const textColor =
    pct >= 70 ? "text-green-600" : pct >= 40 ? "text-yellow-600" : "text-gray-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Your Match
        </p>
        <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mb-3">
        {skillMatch.matchedCount} of {skillMatch.totalRequired} skills matched
      </p>
      {skillMatch.matchedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skillMatch.matchedSkills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full"
            >
              {skill}
            </span>
          ))}
          {skillMatch.matchedSkills.length > 4 && (
            <span className="text-xs text-gray-400">
              +{skillMatch.matchedSkills.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function SidebarFactRow({
  icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
        {icon}
        {label}
      </span>
      <span
        className={`text-xs font-medium text-gray-700 text-right truncate ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Similar Job Card ───────────────────────────────────────────────────────────

const SJB_COLORS = [
  "bg-[#E8F5E3]",
  "bg-[#F3E8F8]",
  "bg-[#FCE8E8]",
  "bg-[#E8F0FC]",
  "bg-[#FFF9E6]",
];
const SJT_COLORS = [
  "text-[#4A7C3B]",
  "text-[#7B4A9E]",
  "text-[#C84A4A]",
  "text-[#4A6FA5]",
  "text-[#B8860B]",
];

function SimilarJobCard({ job }: { job: any }) {
  const colorIdx = job.companyName.length % SJB_COLORS.length;
  const href = job.slug
    ? `/dashboard/jobs/${job.slug}`
    : `/dashboard/jobs/${job._id}`;

  const salary =
    job.salaryDisclosure === "range" && job.salaryMin && job.salaryMax
      ? `${job.currency || "KES"} ${job.salaryMin.toLocaleString()} \u2013 ${job.salaryMax.toLocaleString()}`
      : job.salaryDisclosure === "exact" && job.salaryMin
      ? `${job.currency || "KES"} ${job.salaryMin.toLocaleString()}+`
      : null;

  const isNew = Date.now() - job._creationTime < 48 * 60 * 60 * 1000;
  const daysLeft =
    job.applicationDeadline
      ? Math.ceil(
          (new Date(job.applicationDeadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const matchPct = job.similarityScore > 0 ? job.similarityScore : null;

  return (
    <Link href={href} className="group block">
      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-orange/40 hover:shadow-md hover:shadow-orange-50 bg-white transition-all duration-200">
        {/* Logo block */}
        <div
          className={`w-12 h-12 ${SJB_COLORS[colorIdx]} rounded-xl flex items-center justify-center flex-shrink-0 border border-white shadow-sm`}
        >
          <span className={`text-lg font-bold ${SJT_COLORS[colorIdx]}`}>
            {job.companyName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-brand-orange transition-colors leading-tight truncate">
              {job.title}
            </h4>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isNew && (
                <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full">
                  New
                </span>
              )}
              {matchPct !== null && matchPct >= 30 && (
                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full">
                  {matchPct}%
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-2">{job.companyName}</p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFE4C4] text-orange-800 text-[11px] font-medium rounded-full capitalize">
              <Clock className="w-2.5 h-2.5" />
              {job.employmentType.replace(/-/g, " ")}
            </span>
            {job.workplaceType === "remote" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8F0FC] text-blue-800 text-[11px] font-medium rounded-full">
                <Home className="w-2.5 h-2.5" />
                Remote
              </span>
            )}
          </div>

          {(salary || (daysLeft !== null && daysLeft > 0 && daysLeft <= 14)) && (
            <div className="flex items-center justify-between gap-2 mt-2.5">
              {salary && (
                <span className="text-[11px] font-semibold text-gray-700">
                  {salary}
                </span>
              )}
              {daysLeft !== null && daysLeft > 0 && daysLeft <= 14 && (
                <span className="text-[11px] text-orange-600 font-medium">
                  {daysLeft}d left
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

function SimilarJobSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="flex gap-2">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-5 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}
