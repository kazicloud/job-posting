"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Building2, MapPin, Globe, Calendar, Users, Briefcase, 
  FileText, CheckCircle, XCircle, Mail, Phone, Linkedin, ExternalLink,
  Shield, AlertCircle, Trash2, Clock, Pencil
} from "lucide-react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { RejectionModal } from "../../../../components/rejection-modal";
import { DeleteUserModal } from "../../../../components/delete-user-modal";
import { useState } from "react";

export default function EmployerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employerId = params.id as Id<"users">;
  
  const data = useQuery(api.admin.getEmployerDetails, { userId: employerId });
  const verifyEmployer = useMutation(api.admin.verifyEmployer);
  const deleteUser = useMutation(api.admin.deleteUser);
  const notifyVerified = useAction(api.emails.notifyEmployerVerified);
  const notifyRejected = useAction(api.emails.notifyEmployerRejected);
  const notifyDeleted = useAction(api.emails.notifyUserDeleted);
  
  const changeRequests = useQuery(api.profileChangeRequests.getChangeRequestsForUser, { userId: employerId });
  const resolveChangeRequest = useMutation(api.profileChangeRequests.resolveChangeRequest);

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const handleVerify = async (verified: boolean) => {
    if (!verified) {
      setShowRejectionModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      await verifyEmployer({ userId: employerId, verified: true });
      await notifyVerified({ employerId });
      alert("Employer verified successfully! Verification email sent.");
    } catch (error) {
      console.error("Failed to verify employer:", error);
      alert("Failed to update verification status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason?: string) => {
    setIsProcessing(true);
    setShowRejectionModal(false);
    
    try {
      await verifyEmployer({ 
        userId: employerId, 
        verified: false,
        rejectionReason: reason,
      });
      await notifyRejected({ employerId, reason });
      alert("Employer verification rejected. Notification email sent.");
    } catch (error) {
      console.error("Failed to reject employer:", error);
      alert("Failed to update verification status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (reason: string) => {
    setIsProcessing(true);
    setShowDeleteModal(false);

    const email = data?.user?.email;
    const fullName = data?.user?.fullName || "User";

    try {
      await deleteUser({ userId: employerId, reason });
      if (email) {
        await notifyDeleted({ email, fullName, reason });
      }
      alert("User account deleted and notification email sent.");
      router.push("/employers");
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
            <div className="flex items-center gap-3">
              <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
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
            {/* Company Overview Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="mb-6">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Info Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 w-16 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Jobs Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-neutral-border">
                    <div className="flex-1">
                      <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-64 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6 animate-pulse">
            {/* Verification Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  </div>
                ))}
                <div className="pt-4 border-t border-neutral-border">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info Skeleton */}
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { user, profile, jobs, stats } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employers
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-neutral-text mb-2">
              {profile?.companyName || "Company Profile"}
            </h2>
            <p className="text-neutral-text-secondary">Review employer details and verification status</p>
          </div>
          <div className="flex items-center gap-3">
            {user.verified ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 font-medium">
                <CheckCircle className="w-5 h-5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 text-orange-700 font-medium">
                <AlertCircle className="w-5 h-5" />
                Pending Verification
              </span>
            )}
            <button
              onClick={() => handleVerify(!user.verified)}
              disabled={isProcessing}
              className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                user.verified
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-brand-orange text-white hover:bg-brand-orange/90"
              }`}
            >
              {isProcessing ? "Processing..." : user.verified ? "Revoke Verification" : "Verify Employer"}
            </button>
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

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectionModal}
        companyName={profile?.companyName || "this company"}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={handleReject}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        userName={user.fullName || profile?.companyName || "Unknown"}
        userEmail={user.email}
        userType="employer"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-blue-50">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-text-secondary">Total Jobs</p>
              <p className="text-2xl font-bold text-neutral-text">{stats.totalJobs}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-text-muted">{stats.activeJobs} active</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-green-50">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-text-secondary">Total Applications</p>
              <p className="text-2xl font-bold text-neutral-text">{stats.totalApplications}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-text-muted">Across all jobs</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-purple-50">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-text-secondary">Company Size</p>
              <p className="text-2xl font-bold text-neutral-text">{profile?.companySize || "N/A"}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-text-muted">Employees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Overview */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <div className="flex items-center gap-3 mb-6">
              {profile?.companyLogo ? (
                <img
                  src={profile.companyLogo}
                  alt={profile.companyName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-brand-orange" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-neutral-text">{profile?.companyName}</h3>
                <div className="flex items-center gap-4 text-sm text-neutral-text-secondary mt-1">
                  {profile?.headquarters && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.headquarters}, {profile.country || "Kenya"}
                    </span>
                  )}
                  {profile?.foundedYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Founded {profile.foundedYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile?.companyDescription && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-neutral-text mb-2">About Company</h4>
                <p className="text-neutral-text-secondary leading-relaxed">{profile.companyDescription}</p>
              </div>
            )}

            {profile?.companyIndustries && profile.companyIndustries.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-text mb-2">Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.companyIndustries.map((industry: any) => (
                    <span
                      key={industry}
                      className="px-3 py-1 rounded-full text-sm bg-neutral-bg-secondary text-neutral-text"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-neutral-text-muted mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-text-secondary">Email</p>
                  <p className="text-neutral-text font-medium">{user.email}</p>
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

              {profile?.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-neutral-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-text-secondary">Website</p>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-orange font-medium hover:underline flex items-center gap-1"
                    >
                      {profile.website}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {profile?.linkedInProfile && (
                <div className="flex items-start gap-3">
                  <Linkedin className="w-5 h-5 text-neutral-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-text-secondary">LinkedIn</p>
                    <a
                      href={profile.linkedInProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-orange font-medium hover:underline flex items-center gap-1"
                    >
                      View Profile
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Person */}
          {profile?.contactPersonName && (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <h3 className="text-lg font-semibold text-neutral-text mb-4">Contact Person</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-text-secondary">Name</p>
                  <p className="text-neutral-text font-medium">{profile.contactPersonName}</p>
                </div>
                {profile.contactPersonTitle && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary">Title</p>
                    <p className="text-neutral-text font-medium">{profile.contactPersonTitle}</p>
                  </div>
                )}
                {profile.contactPersonPhone && (
                  <div>
                    <p className="text-sm text-neutral-text-secondary">Phone</p>
                    <p className="text-neutral-text font-medium">{profile.contactPersonPhone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Jobs */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-text mb-4">Recent Job Postings</h3>
            {jobs.length === 0 ? (
              <p className="text-neutral-text-secondary text-center py-8">No jobs posted yet</p>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job: any) => (
                  <div
                    key={job._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-border hover:bg-neutral-bg-secondary transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-neutral-text">{job.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-neutral-text-secondary mt-1">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.applicationsCount} applications</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === "published"
                          ? "bg-green-50 text-green-700"
                          : job.status === "draft"
                          ? "bg-gray-50 text-gray-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Documents */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-brand-orange" />
              <h3 className="text-lg font-semibold text-neutral-text">Verification</h3>
            </div>
            <div className="space-y-4">
              {profile?.registrationNumber && (
                <div>
                  <p className="text-sm text-neutral-text-secondary">Registration Number</p>
                  <p className="text-neutral-text font-medium">{profile.registrationNumber}</p>
                </div>
              )}
              {profile?.kraPin && (
                <div>
                  <p className="text-sm text-neutral-text-secondary">KRA PIN</p>
                  <p className="text-neutral-text font-medium">{profile.kraPin}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-neutral-border">
                <p className="text-sm font-medium text-neutral-text mb-3">Documents</p>
                <div className="space-y-2">
                  {profile?.incorporationCertStorageId && (
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-bg-secondary">
                      <span className="text-sm text-neutral-text">Incorporation Certificate</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {profile?.kraCertStorageId && (
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-bg-secondary">
                      <span className="text-sm text-neutral-text">KRA Certificate</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {profile?.registrationDocStorageId && (
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-bg-secondary">
                      <span className="text-sm text-neutral-text">Registration Document</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {!profile?.incorporationCertStorageId && !profile?.kraCertStorageId && !profile?.registrationDocStorageId && (
                    <p className="text-sm text-neutral-text-muted">No documents uploaded</p>
                  )}
                </div>
              </div>

              {profile?.verificationStatus && (
                <div className="pt-4 border-t border-neutral-border">
                  <p className="text-sm text-neutral-text-secondary mb-2">Profile Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      profile.verificationStatus === "verified"
                        ? "bg-green-50 text-green-700"
                        : profile.verificationStatus === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {profile.verificationStatus.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Change Requests */}
          {changeRequests && changeRequests.length > 0 && (
            <div className="bg-white rounded-lg border border-neutral-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pencil className="w-5 h-5 text-brand-orange" />
                <h3 className="text-lg font-semibold text-neutral-text">Profile Edit Requests</h3>
              </div>
              <div className="space-y-4">
                {changeRequests.map((req: any) => (
                  <div key={req._id} className={`p-4 rounded-lg border ${
                    req.status === "pending" ? "border-yellow-200 bg-yellow-50" :
                    req.status === "approved" ? "border-green-200 bg-green-50" :
                    "border-red-200 bg-red-50"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        req.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        req.status === "approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {req.status === "pending" && <Clock className="w-3 h-3" />}
                        {req.status === "approved" && <CheckCircle className="w-3 h-3" />}
                        {req.status === "rejected" && <XCircle className="w-3 h-3" />}
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      <span className="text-xs text-neutral-text-muted">
                        {new Date(req._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-text mb-3">{req.reason}</p>
                    {req.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            setProcessingRequestId(req._id);
                            try {
                              await resolveChangeRequest({ requestId: req._id, status: "approved" });
                            } catch (e) { console.error(e); }
                            setProcessingRequestId(null);
                          }}
                          disabled={processingRequestId === req._id}
                          className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            const note = prompt("Reason for rejection (optional):");
                            setProcessingRequestId(req._id);
                            try {
                              await resolveChangeRequest({ requestId: req._id, status: "rejected", adminNote: note || undefined });
                            } catch (e) { console.error(e); }
                            setProcessingRequestId(null);
                          }}
                          disabled={processingRequestId === req._id}
                          className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {req.adminNote && (
                      <p className="text-xs text-neutral-text-muted mt-2 italic">Admin: {req.adminNote}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <p className="text-neutral-text font-medium">Employer</p>
              </div>
              <div>
                <p className="text-sm text-neutral-text-secondary">Onboarding</p>
                <p className="text-neutral-text font-medium">
                  {user.onboardingCompleted ? "Completed" : "Incomplete"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
