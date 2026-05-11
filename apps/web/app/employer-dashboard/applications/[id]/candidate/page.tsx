"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Download,
  FileText,
  Award,
  Building2,
  Globe,
  Linkedin,
  Languages,
  DollarSign,
  Target,
  CheckCircle2,
  ExternalLink,
  User,
  Clock,
} from "lucide-react";

function calculateDuration(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0)
    return `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
  if (remainingMonths === 0)
    return `${years} ${years === 1 ? "year" : "years"}`;
  return `${years} ${years === 1 ? "year" : "years"} ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
}

function ResumeButton({
  storageId,
  label,
  badge,
}: {
  storageId: string;
  label: string;
  badge?: string;
}) {
  const url = useQuery(api.serviceOrders.getFileUrl, { storageId });
  if (!url) return null;
  return (
    <div className="flex gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-orange text-white text-sm font-semibold rounded-xl hover:bg-brand-orange/90 transition-colors shadow-sm"
      >
        <FileText className="w-4 h-4" />
        {label}
        {badge && (
          <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </a>
      <a
        href={url}
        download
        className="inline-flex items-center gap-2 px-3 py-2.5 border border-neutral-border text-neutral-text text-sm font-medium rounded-xl hover:bg-neutral-bg-secondary transition-colors"
        title="Download"
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  );
}

export default function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const applicationId = id as Id<"applications">;

  const application = useQuery(api.applications.getApplicationById, {
    applicationId,
  });

  if (application === undefined) {
    return (
      <EmployerDashboardLayout>
        <div className="min-h-screen bg-neutral-bg-secondary flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-3xl px-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  if (!application || !application.jobSeeker) {
    return (
      <EmployerDashboardLayout>
        <div className="min-h-screen bg-neutral-bg-secondary flex items-center justify-center">
          <p className="text-neutral-text-secondary">Application not found.</p>
        </div>
      </EmployerDashboardLayout>
    );
  }

  const { jobSeeker } = application;
  const applicationResumeStorageId = (application as any)
    .applicationResumeStorageId as string | undefined;
  const hasCustomResume = !!applicationResumeStorageId;

  return (
    <EmployerDashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary">
        {/* Top bar */}
        <div className="bg-white border-b border-neutral-border sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <Link
              href={`/employer-dashboard/applications/${id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-text-secondary hover:text-neutral-text transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Application
            </Link>
            <p className="text-sm font-semibold text-neutral-text hidden sm:block">
              Candidate Profile
            </p>
            <div className="w-24" /> {/* spacer */}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* ── Hero card ── */}
          <div className="bg-white border border-neutral-border rounded-2xl overflow-hidden">
            <div className="px-6 sm:px-8 pt-6 pb-7">
              {/* Avatar */}
              <div className="mb-4">
                {jobSeeker.profilePhoto ? (
                  <img
                    src={jobSeeker.profilePhoto}
                    alt={jobSeeker.name || "Candidate"}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-brand-orange to-orange-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-md">
                    {jobSeeker.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2) || "?"}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-text">
                      {jobSeeker.name}
                    </h1>
                    {jobSeeker.openToWork && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Open to Work
                      </span>
                    )}
                    {application.matchScore > 0 && (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                          application.matchScore >= 80
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : application.matchScore >= 60
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {application.matchScore}% Match
                      </span>
                    )}
                  </div>

                  {jobSeeker.headline && (
                    <p className="text-base text-neutral-text-secondary font-medium mb-3">
                      {jobSeeker.headline}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-text-muted">
                    {jobSeeker.email && (
                      <a
                        href={`mailto:${jobSeeker.email}`}
                        className="flex items-center gap-1.5 hover:text-brand-orange transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {jobSeeker.email}
                      </a>
                    )}
                    {jobSeeker.phone && (
                      <a
                        href={`tel:${jobSeeker.phone}`}
                        className="flex items-center gap-1.5 hover:text-brand-orange transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {jobSeeker.phone}
                      </a>
                    )}
                    {jobSeeker.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {jobSeeker.location}
                      </span>
                    )}
                    {jobSeeker.yearsOfExperience !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {jobSeeker.yearsOfExperience}{" "}
                        {jobSeeker.yearsOfExperience === 1 ? "yr" : "yrs"}{" "}
                        experience
                      </span>
                    )}
                  </div>
                </div>

                {/* Resume buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {hasCustomResume && (
                    <ResumeButton
                      storageId={applicationResumeStorageId!}
                      label="View Application Resume"
                      badge="custom"
                    />
                  )}
                  {jobSeeker.resumeStorageId && (
                    <ResumeButton
                      storageId={jobSeeker.resumeStorageId}
                      label={
                        hasCustomResume
                          ? "View Profile Resume"
                          : "View Resume"
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              {jobSeeker.about && (
                <div className="bg-white border border-neutral-border rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-neutral-text-muted uppercase tracking-wider mb-3">
                    About
                  </h2>
                  <p className="text-sm text-neutral-text-secondary leading-relaxed">
                    {jobSeeker.about}
                  </p>
                </div>
              )}

              {/* Work Experience */}
              <div className="bg-white border border-neutral-border rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-neutral-text-muted uppercase tracking-wider mb-5">
                  Work Experience
                </h2>
                {jobSeeker.workExperience &&
                jobSeeker.workExperience.length > 0 ? (
                  <div className="space-y-6">
                    {jobSeeker.workExperience.map((exp: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex gap-4 ${
                          idx < jobSeeker.workExperience.length - 1
                            ? "pb-6 border-b border-neutral-border"
                            : ""
                        }`}
                      >
                        <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-text">
                            {exp.jobTitle}
                          </h3>
                          <p className="text-sm text-neutral-text-secondary">
                            {exp.company}
                          </p>
                          <p className="text-xs text-neutral-text-muted mt-1">
                            {exp.startDate
                              ? new Date(exp.startDate).toLocaleDateString(
                                  "en-US",
                                  { month: "short", year: "numeric" }
                                )
                              : "N/A"}{" "}
                            —{" "}
                            {exp.currentlyWorking
                              ? "Present"
                              : exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString(
                                  "en-US",
                                  { month: "short", year: "numeric" }
                                )
                              : "N/A"}
                            {exp.startDate &&
                              (exp.currentlyWorking || exp.endDate) && (
                                <span className="ml-2">
                                  ·{" "}
                                  {calculateDuration(
                                    exp.startDate,
                                    exp.currentlyWorking
                                      ? new Date().toISOString()
                                      : exp.endDate
                                  )}
                                </span>
                              )}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-neutral-text-secondary mt-2 leading-relaxed whitespace-pre-wrap">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-text-muted">
                    No work experience listed
                  </p>
                )}
              </div>

              {/* Education */}
              <div className="bg-white border border-neutral-border rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-neutral-text-muted uppercase tracking-wider mb-5">
                  Education
                </h2>
                {jobSeeker.education && jobSeeker.education.length > 0 ? (
                  <div className="space-y-6">
                    {jobSeeker.education.map((edu: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex gap-4 ${
                          idx < jobSeeker.education.length - 1
                            ? "pb-6 border-b border-neutral-border"
                            : ""
                        }`}
                      >
                        <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-text capitalize">
                            {edu.qualificationLevel}
                            {edu.fieldOfStudy
                              ? ` in ${edu.fieldOfStudy}`
                              : ""}
                          </h3>
                          <p className="text-sm text-neutral-text-secondary">
                            {edu.institution}
                          </p>
                          <p className="text-xs text-neutral-text-muted mt-1">
                            {edu.startYear} — {edu.endYear}
                          </p>
                          {edu.grade && (
                            <p className="text-xs text-neutral-text-secondary mt-1">
                              Grade: {edu.grade}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-text-muted">
                    No education listed
                  </p>
                )}
              </div>

              {/* Certifications */}
              {jobSeeker.certifications &&
                jobSeeker.certifications.length > 0 && (
                  <div className="bg-white border border-neutral-border rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-text-muted uppercase tracking-wider mb-5">
                      Certifications
                    </h2>
                    <div className="space-y-4">
                      {jobSeeker.certifications.map(
                        (cert: any, idx: number) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 ${
                              idx < jobSeeker.certifications.length - 1
                                ? "pb-4 border-b border-neutral-border"
                                : ""
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-neutral-text">
                                {cert.name}
                              </h3>
                              <p className="text-sm text-neutral-text-secondary">
                                {cert.issuingOrganization}
                              </p>
                              <p className="text-xs text-neutral-text-muted mt-1">
                                Issued{" "}
                                {cert.issueDate
                                  ? new Date(
                                      cert.issueDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "N/A"}
                                {cert.doesNotExpire
                                  ? " · No expiry"
                                  : cert.expiryDate
                                  ? ` · Expires ${new Date(
                                      cert.expiryDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      year: "numeric",
                                    })}`
                                  : ""}
                              </p>
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-brand-orange hover:underline mt-1 inline-flex items-center gap-1"
                                >
                                  View credential{" "}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-6">
              {/* Skills */}
              {jobSeeker.skills && jobSeeker.skills.length > 0 && (
                <div className="bg-white border border-neutral-border rounded-2xl p-5">
                  <h2 className="text-sm font-semibold text-neutral-text-muted uppercase tracking-wider mb-4">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {jobSeeker.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-neutral-bg-secondary text-neutral-text text-xs font-medium rounded-lg border border-neutral-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidate Preferences */}
              {(jobSeeker.desiredJobTitle ||
                jobSeeker.salaryMin ||
                jobSeeker.profileAvailability ||
                jobSeeker.currentStatus) && (
                <div className="bg-white border border-neutral-border rounded-2xl p-5">
                  <h2 className="text-sm font-semibold text-neutral-text-muted uppercase tracking-wider mb-4">
                    Preferences
                  </h2>
                  <div className="space-y-3">
                    {jobSeeker.desiredJobTitle && (
                      <div>
                        <p className="text-xs text-neutral-text-muted mb-0.5">
                          Desired Role
                        </p>
                        <p className="text-sm font-medium text-neutral-text">
                          {jobSeeker.desiredJobTitle}
                        </p>
                      </div>
                    )}
                    {jobSeeker.salaryMin && (
                      <div>
                        <p className="text-xs text-neutral-text-muted mb-0.5">
                          Expected Salary
                        </p>
                        <p className="text-sm font-medium text-neutral-text">
                          {jobSeeker.salaryCurrency || "KES"}{" "}
                          {jobSeeker.salaryMin.toLocaleString()}+
                        </p>
                      </div>
                    )}
                    {jobSeeker.profileAvailability && (
                      <div>
                        <p className="text-xs text-neutral-text-muted mb-0.5">
                          Availability
                        </p>
                        <p className="text-sm font-medium text-neutral-text">
                          {jobSeeker.profileAvailability === "immediate"
                            ? "Immediately available"
                            : jobSeeker.profileAvailability === "1_month"
                            ? "1 month notice"
                            : jobSeeker.profileAvailability === "2_months"
                            ? "2 months notice"
                            : "3 months notice"}
                        </p>
                      </div>
                    )}
                    {jobSeeker.currentStatus && (
                      <div>
                        <p className="text-xs text-neutral-text-muted mb-0.5">
                          Current Status
                        </p>
                        <p className="text-sm font-medium text-neutral-text capitalize">
                          {jobSeeker.currentStatus}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Languages */}
              {jobSeeker.languages && jobSeeker.languages.length > 0 && (
                <div className="bg-white border border-neutral-border rounded-2xl p-5">
                  <h2 className="text-sm font-semibold text-neutral-text-muted uppercase tracking-wider mb-4">
                    Languages
                  </h2>
                  <div className="space-y-2">
                    {jobSeeker.languages.map((lang: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b border-neutral-border last:border-0"
                      >
                        <span className="text-sm font-medium text-neutral-text">
                          {lang.language}
                        </span>
                        <span className="text-xs text-neutral-text-muted capitalize px-2 py-0.5 bg-neutral-bg-secondary rounded-full border border-neutral-border">
                          {lang.proficiency || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}
