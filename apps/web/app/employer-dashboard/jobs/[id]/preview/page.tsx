"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Eye,
  MapPin,
  Briefcase,
  Clock,
  Users,
  Globe,
  Building2,
  CheckCircle2,
  Star,
  DollarSign,
  CalendarDays,
  Share2,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export default function JobPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as Id<"jobs">;

  const job = useQuery(api.jobs.getWithApplicationCount, { id: jobId });
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const analytics = useQuery(api.analytics.getJobAnalytics, { jobId });

  const isLoading = job === undefined || profile === undefined;

  if (isLoading) {
    return (
      <EmployerDashboardLayout>
        <PreviewSkeleton />
      </EmployerDashboardLayout>
    );
  }

  if (!job) {
    return (
      <EmployerDashboardLayout>
        <div className="p-6 text-center text-neutral-text-secondary">Job not found.</div>
      </EmployerDashboardLayout>
    );
  }

  const companyName = profile?.employerProfile?.companyName || "Your Company";
  const companyLogo = profile?.employerProfile?.companyLogo;
  const companySize = profile?.employerProfile?.companySize;
  const companyIndustry = profile?.employerProfile?.companyIndustries?.[0];

  const salaryLabel =
    job.salaryDisclosure === "range" && job.salaryMin && job.salaryMax
      ? `${job.currency || "KES"} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()} / ${job.salaryPeriod || "year"}`
      : job.salaryDisclosure === "negotiable"
      ? "Competitive salary"
      : "Salary not disclosed";

  const daysPosted = Math.floor((Date.now() - job.createdAt) / (1000 * 60 * 60 * 24));
  const postedLabel =
    daysPosted === 0 ? "Today" : daysPosted === 1 ? "Yesterday" : `${daysPosted} days ago`;

  const statusConfig: Record<string, { label: string; className: string }> = {
    published: { label: "Active", className: "bg-green-50 text-green-700 border-green-200" },
    draft: { label: "Draft", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    closed: { label: "Closed", className: "bg-gray-50 text-gray-600 border-gray-200" },
    archived: { label: "Archived", className: "bg-slate-100 text-slate-600 border-slate-200" },
    expired: { label: "Expired", className: "bg-red-50 text-red-600 border-red-200" },
  };
  const statusInfo = statusConfig[job.status] ?? { label: job.status, className: "bg-gray-50 text-gray-600 border-gray-200" };

  const views = analytics?.viewCount ?? 0;
  const applications = analytics?.applicationCount ?? 0;
  const conversionRate = analytics?.conversionRate ?? 0;

  return (
    <EmployerDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md border border-neutral-border hover:bg-neutral-bg-secondary transition-colors text-neutral-text-secondary"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-text">Job Preview</h1>
              <p className="text-xs text-neutral-text-secondary">This is how candidates see your listing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href={`/employer-dashboard/jobs/${jobId}/edit`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-border rounded-md text-sm font-medium text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit Job
            </Link>
            <Link
              href={`/employer-dashboard/applications?jobId=${jobId}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-orange text-white rounded-md text-sm font-medium hover:bg-brand-orange/90 transition-colors"
            >
              <Users className="w-4 h-4" />
              Applications
            </Link>
          </div>
        </div>

        {/* Draft / flagged notice */}
        {job.status === "draft" && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">This job is a draft</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                It is not yet visible to candidates. Publish it to start receiving applications.
              </p>
            </div>
            <Link
              href={`/employer-dashboard/jobs/${jobId}/edit`}
              className="ml-auto flex-shrink-0 px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-md hover:bg-yellow-700 transition-colors"
            >
              Publish
            </Link>
          </div>
        )}

        {job.flagged && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Flagged for admin review</p>
              {job.flagReason && <p className="text-xs text-red-700 mt-0.5">{job.flagReason}</p>}
            </div>
          </div>
        )}

        {/* Analytics strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Views", value: views, icon: Eye },
            { label: "Applicants", value: applications, icon: Users },
            { label: "Conversion", value: `${conversionRate}%`, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white border border-neutral-border rounded-lg p-3 sm:p-4 text-center">
              <Icon className="w-4 h-4 mx-auto mb-1 text-neutral-text-muted" />
              <p className="text-xl font-bold text-neutral-text">{value}</p>
              <p className="text-xs text-neutral-text-secondary">{label}</p>
            </div>
          ))}
        </div>

        {/* ─────────── Candidate-facing preview ─────────── */}
        <div className="bg-white border border-neutral-border rounded-xl overflow-hidden shadow-sm">
          {/* Hero header */}
          <div className="p-6 sm:p-8 border-b border-neutral-border">
            <div className="flex items-start gap-4">
              {/* Company logo */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-neutral-border flex items-center justify-center bg-neutral-bg-secondary flex-shrink-0 overflow-hidden">
                {companyLogo ? (
                  <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-neutral-text-muted" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-text mb-1">{job.title}</h2>
                <p className="text-base font-medium text-neutral-text-secondary mb-3">{companyName}</p>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2">
                  <Chip icon={<MapPin className="w-3.5 h-3.5" />} label={job.location} />
                  <Chip icon={<Briefcase className="w-3.5 h-3.5" />} label={job.employmentType} />
                  <Chip icon={<Globe className="w-3.5 h-3.5" />} label={job.workplaceType} />
                  <Chip icon={<Star className="w-3.5 h-3.5" />} label={`${job.experienceLevel} level`} />
                  {job.positions > 1 && (
                    <Chip icon={<Users className="w-3.5 h-3.5" />} label={`${job.positions} openings`} />
                  )}
                </div>
              </div>

              {/* Status badge */}
              <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full border ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Salary & deadline row */}
            <div className="mt-4 pt-4 border-t border-neutral-border flex flex-wrap gap-4 text-sm text-neutral-text-secondary">
              <span className="flex items-center gap-1.5 font-medium text-neutral-text">
                {salaryLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Posted {postedLabel}
              </span>
              {job.applicationDeadline && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  Deadline: {job.applicationDeadline}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {job.description && (
                <Section title="About the Role">
                  <RichText content={job.description} />
                </Section>
              )}

              {job.responsibilities && (
                <Section title="Key Responsibilities">
                  <RichText content={job.responsibilities} />
                </Section>
              )}

              {job.requirements && (
                <Section title="Requirements">
                  <RichText content={job.requirements} />
                </Section>
              )}

              {(job.requiredSkills?.length || job.preferredSkills?.length) && (
                <Section title="Skills">
                  {job.requiredSkills?.length ? (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-neutral-text-muted uppercase tracking-wide mb-2">Required</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((s) => (
                          <SkillBadge key={s} label={s} required />
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {job.preferredSkills?.length ? (
                    <div>
                      <p className="text-xs font-semibold text-neutral-text-muted uppercase tracking-wide mb-2">Nice to have</p>
                      <div className="flex flex-wrap gap-2">
                        {job.preferredSkills.map((s) => (
                          <SkillBadge key={s} label={s} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </Section>
              )}

              {job.niceToHave && (
                <Section title="Nice to Have">
                  <RichText content={job.niceToHave} />
                </Section>
              )}

              {job.benefits && (
                <Section title="Benefits & Perks">
                  <RichText content={job.benefits} />
                </Section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Job details */}
              <aside className="bg-neutral-bg-secondary rounded-xl p-5">
                <h3 className="text-sm font-semibold text-neutral-text mb-4">Job Details</h3>
                <div className="space-y-3 text-sm text-neutral-text-secondary">
                  <InfoRow icon={<Briefcase className="w-4 h-4" />} label={`${job.employmentType} · ${job.workplaceType}`} />
                  <InfoRow icon={<Star className="w-4 h-4" />} label={`${job.experienceLevel} experience`} />
                  {job.department && <InfoRow icon={<Building2 className="w-4 h-4" />} label={job.department} />}
                  <InfoRow icon={<Users className="w-4 h-4" />} label={`${job.positions} open position${job.positions > 1 ? "s" : ""}`} />
                  {job.applicationDeadline && (
                    <InfoRow icon={<CalendarDays className="w-4 h-4" />} label={`Closes ${job.applicationDeadline}`} />
                  )}
                </div>
              </aside>

              {/* Application requirements */}
              {job.applicationSettings && (
                <aside className="bg-neutral-bg-secondary rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-neutral-text mb-4">Application Requirements</h3>
                  <ul className="space-y-2 text-sm text-neutral-text-secondary">
                    {(
                      [
                        ["Resume / CV", job.applicationSettings.requireResume],
                        ["Cover Letter", job.applicationSettings.requireCoverLetter],
                        ["Portfolio", job.applicationSettings.requirePortfolio],
                        ["LinkedIn Profile", job.applicationSettings.requireLinkedIn],
                        ["Availability", job.applicationSettings.requireAvailability],
                        ["Salary Expectations", job.applicationSettings.requireSalaryExpectations],
                        ["Work Authorisation", job.applicationSettings.requireWorkAuthorization],
                        ["Willing to Relocate", job.applicationSettings.requireWillingToRelocate],
                      ] as [string, boolean][]
                    )
                      .filter(([, required]) => required)
                      .map(([label]) => (
                        <li key={label} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          {label}
                        </li>
                      ))}
                  </ul>
                  {job.applicationSettings.customQuestions?.length ? (
                    <div className="mt-3 pt-3 border-t border-neutral-border">
                      <p className="text-xs font-semibold text-neutral-text-muted uppercase tracking-wide mb-2">
                        Screening Questions ({job.applicationSettings.customQuestions.length})
                      </p>
                      <ul className="space-y-1.5 text-xs text-neutral-text-secondary">
                        {job.applicationSettings.customQuestions.map((q, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-neutral-text-muted flex-shrink-0" />
                            {q.question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </aside>
              )}

              {/* Employer actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/employer-dashboard/jobs/${jobId}/edit`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-border rounded-lg text-sm font-medium text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit this job
                </Link>
                <Link
                  href={`/employer-dashboard/applications?jobId=${jobId}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-brand-orange/90 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  View {applications} Application{applications !== 1 ? "s" : ""}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

// ─────────── Sub-components ───────────

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-bg-secondary border border-neutral-border rounded-full text-xs text-neutral-text-secondary font-medium">
      {icon}
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-bold text-neutral-text mb-3 pb-2 border-b border-neutral-border">{title}</h3>
      {children}
    </div>
  );
}

function RichText({ content }: { content: string }) {
  // Render markdown-style line breaks and preserve paragraphs
  return (
    <div className="text-sm text-neutral-text leading-relaxed space-y-2">
      {content.split("\n").map((line, i) =>
        line.trim() === "" ? <br key={i} /> : <p key={i}>{line}</p>
      )}
    </div>
  );
}

function SkillBadge({ label, required }: { label: string; required?: boolean }) {
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
        required
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-neutral-bg-secondary text-neutral-text-secondary border-neutral-border"
      }`}
    >
      {label}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-2 text-sm">
      <span className="text-neutral-text-muted flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
      {href && <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />}
    </span>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors block">
      {content}
    </a>
  ) : (
    <div>{content}</div>
  );
}

function Sk({ w, h, rounded }: { w: string; h: string; rounded?: string }) {
  return <div className={`bg-gray-200 animate-pulse ${w} ${h} ${rounded ?? "rounded"}`} />;
}

function PreviewSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* back button */}
          <div className="w-9 h-9 bg-gray-200 animate-pulse rounded-md flex-shrink-0" />
          <div>
            <Sk w="w-32" h="h-5" />
            <Sk w="w-52" h="h-3" rounded="rounded mt-1.5" />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Sk w="flex-1 sm:w-28" h="h-10" rounded="rounded-md" />
          <Sk w="flex-1 sm:w-32" h="h-10" rounded="rounded-md" />
        </div>
      </div>

      {/* ── Analytics strip ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-neutral-border rounded-lg p-3 sm:p-4 flex flex-col items-center gap-1.5">
            <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
            <Sk w="w-10" h="h-6" />
            <Sk w="w-14" h="h-3" />
          </div>
        ))}
      </div>

      {/* ── Candidate-facing card ── */}
      <div className="bg-white border border-neutral-border rounded-xl overflow-hidden shadow-sm">

        {/* Hero header */}
        <div className="p-6 sm:p-8 border-b border-neutral-border">
          <div className="flex items-start gap-4">
            {/* Company logo */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 animate-pulse rounded-xl flex-shrink-0" />

            <div className="flex-1 min-w-0 space-y-2">
              {/* Job title */}
              <Sk w="w-2/3" h="h-7" />
              {/* Company name */}
              <Sk w="w-1/3" h="h-5" />
              {/* Meta chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {["w-28", "w-24", "w-20", "w-24"].map((w, i) => (
                  <div key={i} className={`bg-gray-200 animate-pulse h-7 ${w} rounded-full`} />
                ))}
              </div>
            </div>

            {/* Status badge */}
            <div className="w-14 h-6 bg-gray-200 animate-pulse rounded-full flex-shrink-0" />
          </div>

          {/* Salary & deadline row */}
          <div className="mt-4 pt-4 border-t border-neutral-border flex flex-wrap gap-4">
            <Sk w="w-48" h="h-4" />
            <Sk w="w-28" h="h-4" />
            <Sk w="w-36" h="h-4" />
          </div>

          {/* CTA row */}
          <div className="mt-5 flex gap-3">
            <div className="w-32 h-11 bg-gray-200 animate-pulse rounded-lg" />
            <div className="w-24 h-11 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>

        {/* Body — 2-col layout */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About the Role section */}
            <div>
              <div className="pb-2 border-b border-neutral-border mb-3">
                <Sk w="w-36" h="h-5" />
              </div>
              <div className="space-y-2">
                <Sk w="w-full" h="h-4" />
                <Sk w="w-11/12" h="h-4" />
                <Sk w="w-4/5" h="h-4" />
                <Sk w="w-full" h="h-4" />
                <Sk w="w-3/4" h="h-4" />
              </div>
            </div>

            {/* Key Responsibilities */}
            <div>
              <div className="pb-2 border-b border-neutral-border mb-3">
                <Sk w="w-44" h="h-5" />
              </div>
              <div className="space-y-2">
                {["w-full", "w-11/12", "w-5/6", "w-full", "w-4/6", "w-5/6"].map((w, i) => (
                  <Sk key={i} w={w} h="h-4" />
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <div className="pb-2 border-b border-neutral-border mb-3">
                <Sk w="w-28" h="h-5" />
              </div>
              <div className="space-y-2">
                {["w-full", "w-5/6", "w-full", "w-4/5", "w-11/12"].map((w, i) => (
                  <Sk key={i} w={w} h="h-4" />
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="pb-2 border-b border-neutral-border mb-3">
                <Sk w="w-16" h="h-5" />
              </div>
              <div className="mb-2">
                <Sk w="w-20" h="h-3" rounded="rounded mb-2" />
                <div className="flex flex-wrap gap-2">
                  {["w-20", "w-16", "w-24", "w-18", "w-20"].map((w, i) => (
                    <div key={i} className={`bg-gray-200 animate-pulse h-7 ${w} rounded-full`} />
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <Sk w="w-24" h="h-3" rounded="rounded mb-2" />
                <div className="flex flex-wrap gap-2">
                  {["w-16", "w-20", "w-24"].map((w, i) => (
                    <div key={i} className={`bg-gray-200 animate-pulse h-7 ${w} rounded-full`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Job Details card */}
            <div className="bg-neutral-bg-secondary rounded-xl p-5">
              <Sk w="w-24" h="h-4" rounded="rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 animate-pulse rounded flex-shrink-0" />
                    <Sk w="w-3/4" h="h-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Application Requirements card */}
            <div className="bg-neutral-bg-secondary rounded-xl p-5">
              <Sk w="w-40" h="h-4" rounded="rounded mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full flex-shrink-0" />
                    <Sk w="w-2/3" h="h-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <div className="h-11 bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-11 bg-gray-200 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
