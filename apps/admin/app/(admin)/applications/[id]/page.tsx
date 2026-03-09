"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, User, Briefcase, Building2, MapPin, Mail, Phone, 
  Calendar, FileText, ExternalLink, Globe, Linkedin, DollarSign,
  Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as Id<"applications">;
  
  const data = useQuery(api.admin.getApplicationDetails, { applicationId });

  if (!data) {
    return (
      <div>
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="h-9 w-96 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6 animate-pulse">
            {/* Job Info Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-5 w-48 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cover Letter Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Application Details Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-64 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6 animate-pulse">
            {/* Candidate Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Employer Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { application, job, jobSeeker, jobSeekerProfile, employer, notes } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-50 text-blue-700 border-blue-200";
      case "under_review": return "bg-purple-50 text-purple-700 border-purple-200";
      case "shortlisted": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "interview": return "bg-orange-50 text-orange-700 border-orange-200";
      case "accepted": return "bg-green-50 text-green-700 border-green-200";
      case "rejected": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="w-5 h-5" />;
      case "rejected": return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-neutral-text mb-2">
              Application Details
            </h2>
            <p className="text-neutral-text-secondary">
              {jobSeeker?.fullName || "Candidate"} applied for {job?.title || "Position"}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${getStatusColor(application.status)}`}>
            {getStatusIcon(application.status)}
            {formatStatus(application.status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Job Information</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-neutral-text-muted mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-text-secondary">Position</p>
                    <p className="text-lg font-semibold text-neutral-text">{job?.title}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-neutral-text-muted mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-text-secondary">Company</p>
                  <p className="text-neutral-text font-medium">{job?.companyName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neutral-text-muted mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-text-secondary">Location</p>
                  <p className="text-neutral-text font-medium">{job?.location}</p>
                </div>
              </div>

              {job?.salaryDisclosure === "show_range" && job.salaryMin && job.salaryMax && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-neutral-text-muted mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-text-secondary">Salary Range</p>
                    <p className="text-neutral-text font-medium">
                      {job.currency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-neutral-border">
                <span className="px-3 py-1 rounded-full text-sm bg-neutral-bg-secondary text-neutral-text">
                  {job?.employmentType}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-neutral-bg-secondary text-neutral-text">
                  {job?.experienceLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Cover Letter</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-neutral-text-secondary leading-relaxed whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            </div>
          )}

          {/* Application Details */}
          {(application.availability || application.salaryExpectations || application.workAuthorization || 
            application.willingToRelocate !== undefined || application.portfolioUrl || application.linkedInUrl) ? (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Application Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {application.availability && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary mb-1">Availability</p>
                    <p className="text-neutral-text font-medium">{application.availability}</p>
                  </div>
                )}

                {application.salaryExpectations && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary mb-1">Salary Expectations</p>
                    <p className="text-neutral-text font-medium">{application.salaryExpectations}</p>
                  </div>
                )}

                {application.workAuthorization && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary mb-1">Work Authorization</p>
                    <p className="text-neutral-text font-medium">{application.workAuthorization}</p>
                  </div>
                )}

                {application.willingToRelocate !== undefined && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary mb-1">Willing to Relocate</p>
                    <p className="text-neutral-text font-medium">
                      {application.willingToRelocate ? "Yes" : "No"}
                    </p>
                  </div>
                )}

                {application.portfolioUrl && (
                  <div className="col-span-2">
                    <p className="text-sm text-neutral-text-secondary mb-1">Portfolio</p>
                    <a
                      href={application.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-orange font-medium hover:underline flex items-center gap-1"
                    >
                      {application.portfolioUrl}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {application.linkedInUrl && (
                  <div className="col-span-2">
                    <p className="text-sm text-neutral-text-secondary mb-1">LinkedIn Profile</p>
                    <a
                      href={application.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-orange font-medium hover:underline flex items-center gap-1"
                    >
                      {application.linkedInUrl}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Custom Questions & Answers */}
          {application.customAnswers && application.customAnswers.length > 0 && job?.applicationSettings?.customQuestions && (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Additional Questions</h3>
              <div className="space-y-6">
                {application.customAnswers.map((answer: any, idx: number) => {
                  const question = job.applicationSettings?.customQuestions?.[answer.questionIndex];
                  if (!question) return null;

                  return (
                    <div key={idx} className="pb-6 border-b border-neutral-border last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-neutral-text mb-2">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      {answer.fileUrl ? (
                        <a
                          href={answer.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-bg-secondary text-neutral-text hover:bg-gray-200 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          View Uploaded File
                        </a>
                      ) : Array.isArray(answer.answer) ? (
                        <div className="flex flex-wrap gap-2">
                          {answer.answer.map((item: any, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-text-secondary">{answer.answer}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  {application.firstActionAt && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-neutral-text">Application Submitted</p>
                  <p className="text-sm text-neutral-text-secondary">{formatDate(application._creationTime)}</p>
                </div>
              </div>

              {application.firstActionAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-text">Status Updated</p>
                    <p className="text-sm text-neutral-text-secondary">{formatDate(application.firstActionAt)}</p>
                    <p className="text-sm text-neutral-text-muted mt-1">
                      Changed to: {formatStatus(application.status)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Information */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Candidate</h3>
            <div className="flex items-center gap-3 mb-4">
              {jobSeeker?.profilePhoto ? (
                <img
                  src={jobSeeker.profilePhoto}
                  alt={jobSeeker.fullName || ""}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-orange text-white flex items-center justify-center text-xl font-bold">
                  {jobSeeker?.fullName?.charAt(0) || jobSeeker?.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-neutral-text">{jobSeeker?.fullName || "N/A"}</p>
                <p className="text-sm text-neutral-text-secondary">{jobSeekerProfile?.headline || "Job Seeker"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-neutral-text-muted mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-text break-all">{jobSeeker?.email}</p>
                </div>
              </div>

              {jobSeeker?.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-neutral-text-muted mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-text">{jobSeeker.phone}</p>
                  </div>
                </div>
              )}

              {jobSeeker?.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neutral-text-muted mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-text">{jobSeeker.location}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-border">
              <a
                href={`/job-seekers/${jobSeeker?._id}`}
                className="text-brand-orange text-sm font-medium hover:underline"
              >
                View Full Profile →
              </a>
            </div>
          </div>

          {/* Resume */}
          {application.resumeUrl && (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Resume</h3>
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-orange text-white hover:bg-brand-orange/90 transition-colors"
              >
                <FileText className="w-5 h-5" />
                View Resume
              </a>
            </div>
          )}

          {/* Employer Information */}
          {employer && (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Employer</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-text-secondary">Company</p>
                  <p className="text-neutral-text font-medium">{job?.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-text-secondary">Contact</p>
                  <p className="text-neutral-text font-medium">{employer.fullName || "N/A"}</p>
                  <p className="text-sm text-neutral-text-muted">{employer.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {jobSeekerProfile?.yearsOfExperience !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-text-secondary">Experience</span>
                  <span className="text-sm font-medium text-neutral-text">
                    {jobSeekerProfile.yearsOfExperience} years
                  </span>
                </div>
              )}
              {jobSeekerProfile?.currentStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-text-secondary">Status</span>
                  <span className="text-sm font-medium text-neutral-text capitalize">
                    {jobSeekerProfile.currentStatus}
                  </span>
                </div>
              )}
              {jobSeekerProfile?.openToWork !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-text-secondary">Open to Work</span>
                  <span className={`text-sm font-medium ${jobSeekerProfile.openToWork ? "text-green-600" : "text-gray-600"}`}>
                    {jobSeekerProfile.openToWork ? "Yes" : "No"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
