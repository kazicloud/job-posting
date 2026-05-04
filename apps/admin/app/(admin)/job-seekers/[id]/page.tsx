"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, User, MapPin, Mail, Phone, Calendar, Briefcase, 
  FileText, CheckCircle, Globe, Award, Languages, Target, Clock, Trash2
} from "lucide-react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { DeleteUserModal } from "../../../../components/delete-user-modal";
import { useState } from "react";

function ResumeLink({ storageId }: { storageId: string }) {
  const url = useQuery(api.serviceOrders.getFileUrl, { storageId });
  if (!url) return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-100 text-neutral-text-muted text-sm">
      <FileText className="w-5 h-5" />
      Resume loading...
    </div>
  );
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-orange text-white hover:bg-brand-orange/90 transition-colors"
    >
      <FileText className="w-5 h-5" />
      View Resume
    </a>
  );
}

export default function JobSeekerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobSeekerId = params.id as Id<"users">;
  
  const data = useQuery(api.admin.getJobSeekerDetails, { userId: jobSeekerId });
  const deleteUser = useMutation(api.admin.deleteUser);
  const notifyDeleted = useAction(api.emails.notifyUserDeleted);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeleteUser = async (reason: string) => {
    setIsProcessing(true);
    setShowDeleteModal(false);

    const email = data?.user?.email;
    const fullName = data?.user?.fullName || "User";

    try {
      await deleteUser({ userId: jobSeekerId, reason });
      if (email) {
        await notifyDeleted({ email, fullName, reason });
      }
      alert("User account deleted and notification email sent.");
      router.push("/job-seekers");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user account");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!data) {
    return (
      <div>
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="h-9 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6 animate-pulse">
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job Seekers
        </button>
        <div className="bg-white rounded-lg border border-neutral-border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-neutral-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-text mb-2">Job Seeker Not Found</h3>
          <p className="text-neutral-text-secondary">This profile may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const { user, profile, applications, stats, resumeStorageId } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-50 text-blue-700";
      case "under_review": return "bg-purple-50 text-purple-700";
      case "shortlisted": return "bg-yellow-50 text-yellow-700";
      case "interview": return "bg-orange-50 text-orange-700";
      case "accepted": return "bg-green-50 text-green-700";
      case "rejected": return "bg-red-50 text-red-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  const formatStatus = (status: string) => {
    return status.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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
          Back to Job Seekers
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-neutral-text mb-2">
              {user.fullName || "Job Seeker Profile"}
            </h2>
            <p className="text-neutral-text-secondary">{profile?.headline || "No headline provided"}</p>
          </div>
          <div className="flex items-center gap-3">
            {profile?.openToWork && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 font-medium">
                <CheckCircle className="w-5 h-5" />
                Open to Work
              </span>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        userName={user.fullName || "Unknown"}
        userEmail={user.email}
        userType="job_seeker"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-blue-50">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-text-secondary">Total Applications</p>
              <p className="text-2xl font-bold text-neutral-text">{stats.totalApplications}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-text-muted">{stats.activeApplications} active</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-text-secondary">Accepted</p>
              <p className="text-2xl font-bold text-neutral-text">{stats.acceptedApplications}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-text-muted">Job offers</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-purple-50">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-text-secondary">Experience</p>
              <p className="text-2xl font-bold text-neutral-text">
                {profile?.yearsOfExperience || 0} {profile?.yearsOfExperience === 1 ? "year" : "years"}
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-text-muted">{profile?.currentStatus || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Overview */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <div className="flex items-center gap-4 mb-6">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.fullName || ""}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-brand-orange text-white flex items-center justify-center text-2xl font-bold">
                  {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-text">{user.fullName}</h3>
                <p className="text-neutral-text-secondary">{profile?.headline}</p>
                <div className="flex items-center gap-4 text-sm text-neutral-text-muted mt-2">
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </span>
                  )}
                  {profile?.availability && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Available: {formatStatus(profile.availability)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile?.about && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-neutral-text mb-2">About</h4>
                <p className="text-neutral-text-secondary leading-relaxed">{profile.about}</p>
              </div>
            )}

            {profile?.careerSummary && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-neutral-text mb-2">Career Summary</h4>
                <p className="text-neutral-text-secondary leading-relaxed">{profile.careerSummary}</p>
              </div>
            )}

            {profile?.interestedFields && profile.interestedFields.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-text mb-2">Interested Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interestedFields.map((field: any) => (
                    <span
                      key={field}
                      className="px-3 py-1 rounded-full text-sm bg-neutral-bg-secondary text-neutral-text"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Preferences */}
          {(profile?.desiredJobTitle || profile?.desiredIndustries || profile?.jobTypes) && (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-brand-orange" />
                <h3 className="text-lg font-semibold text-neutral-text">Job Preferences</h3>
              </div>
              <div className="space-y-4">
                {profile.desiredJobTitle && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary mb-1">Desired Job Title</p>
                    <p className="text-neutral-text font-medium">{profile.desiredJobTitle}</p>
                  </div>
                )}
                {profile.desiredIndustries && profile.desiredIndustries.length > 0 && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary mb-2">Desired Industries</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.desiredIndustries.map((industry: any) => (
                        <span
                          key={industry}
                          className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.jobTypes && profile.jobTypes.length > 0 && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary mb-2">Job Types</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.jobTypes.map((type: any) => (
                        <span
                          key={type}
                          className="px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.salaryMin && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary mb-1">Expected Salary</p>
                    <p className="text-neutral-text font-medium">
                      {profile.salaryCurrency || "KES"} {profile.salaryMin.toLocaleString()}+
                    </p>
                  </div>
                )}
                {profile.willingToRelocate !== undefined && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary mb-1">Willing to Relocate</p>
                    <p className="text-neutral-text font-medium">
                      {profile.willingToRelocate ? "Yes" : "No"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Languages */}
          {profile?.languages && profile.languages.length > 0 && (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-brand-orange" />
                <h3 className="text-lg font-semibold text-neutral-text">Languages</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {profile.languages.map((lang: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-neutral-bg-secondary">
                    <span className="text-neutral-text font-medium">{lang.language}</span>
                    <span className="text-sm text-neutral-text-secondary capitalize">
                      {lang.proficiency || "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Applications */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Recent Applications</h3>
            {applications.length === 0 ? (
              <p className="text-neutral-text-secondary text-center py-8">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app: any) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-border hover:bg-neutral-bg-secondary transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-text">{app.job?.title || "N/A"}</h4>
                      <div className="flex items-center gap-3 text-sm text-neutral-text-secondary mt-1">
                        <span>{app.job?.companyName || "N/A"}</span>
                        <span>•</span>
                        <span>
                          {new Date(app._creationTime).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {formatStatus(app.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resume */}
          {resumeStorageId && (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Resume</h3>
              <ResumeLink storageId={resumeStorageId} />
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-neutral-text-muted mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-text-secondary">Email</p>
                  <p className="text-neutral-text font-medium break-all">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-neutral-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-text-secondary">Phone</p>
                    <p className="text-neutral-text font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-neutral-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-text-secondary">Location</p>
                    <p className="text-neutral-text font-medium">{user.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-text-secondary">Member Since</p>
                <p className="text-neutral-text font-medium">
                  {new Date(user._creationTime).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-text-secondary">Account Type</p>
                <p className="text-neutral-text font-medium">Job Seeker</p>
              </div>
              <div>
                <p className="text-sm text-neutral-text-secondary">Onboarding</p>
                <p className="text-neutral-text font-medium">
                  {user.onboardingCompleted ? "Completed" : "Incomplete"}
                </p>
              </div>
              {profile?.profileCompleteness !== undefined && (
                <div>
                  <p className="text-sm text-neutral-text-secondary mb-2">Profile Completeness</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-orange rounded-full"
                        style={{ width: `${profile.profileCompleteness}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-neutral-text">
                      {profile.profileCompleteness}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
