"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Building2, MapPin, Globe, Calendar, Users, Briefcase, 
  FileText, CheckCircle, XCircle, Mail, Phone, Linkedin, ExternalLink,
  Shield, AlertCircle, Trash2, Clock, Pencil, GitCompare
} from "lucide-react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { RejectionModal } from "../../../../components/rejection-modal";
import { DeleteUserModal } from "../../../../components/delete-user-modal";
import { useState } from "react";

function DocumentLink({ storageId, label }: { storageId: string; label: string }) {
  const url = useQuery(api.serviceOrders.getFileUrl, { storageId });
  return (
    <div className="flex items-center justify-between p-2 rounded bg-neutral-bg-secondary">
      <span className="text-sm text-neutral-text">{label}</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-brand-orange hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View
        </a>
      ) : (
        <CheckCircle className="w-4 h-4 text-green-600" />
      )}
    </div>
  );
}

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
  const pendingEdits = useQuery(api.employerPendingEdits.getPendingEditsForUser, { userId: employerId });
  const approvePendingEdits = useMutation(api.employerPendingEdits.approvePendingEdits);
  const rejectPendingEdits = useMutation(api.employerPendingEdits.rejectPendingEdits);

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [processingEdits, setProcessingEdits] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectNoteInput, setShowRejectNoteInput] = useState(false);
  const [showEditsModal, setShowEditsModal] = useState(false);

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

  if (data === null) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employers
        </button>
        <div className="bg-white rounded-lg border border-neutral-border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-neutral-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-text mb-2">Employer Not Found</h3>
          <p className="text-neutral-text-secondary">This employer may have been deleted or the link is invalid.</p>
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
            <Link
              href={`/employers/${employerId}/post-job`}
              className="px-4 py-2 rounded-lg font-medium bg-brand-orange text-white hover:bg-brand-orange/90 transition-colors flex items-center gap-2 shadow-sm shadow-brand-orange/20"
            >
              <Briefcase className="w-4 h-4" />
              Post Job for Employer
            </Link>
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

      {/* ── Pending Profile Edits Modal ─────────────────────────────────── */}
      {showEditsModal && pendingEdits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditsModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-border">
              <GitCompare className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-neutral-text">Pending Profile Changes</h2>
                <p className="text-xs text-neutral-text-muted mt-0.5">
                  Submitted {new Date(pendingEdits.submittedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  {" · "}{Object.keys(pendingEdits.changes as object).length} field{Object.keys(pendingEdits.changes as object).length !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={() => setShowEditsModal(false)} className="p-1.5 rounded-lg hover:bg-neutral-bg-secondary text-neutral-text-muted hover:text-neutral-text transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable diff list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {(() => {
                const FIELD_LABELS: Record<string, string> = {
                  companyName: "Company Name", companyLogo: "Logo",
                  companySize: "Company Size", companyIndustries: "Industries",
                  website: "Website", foundedYear: "Founded Year",
                  linkedInProfile: "LinkedIn", companyDescription: "Description",
                  headquarters: "Headquarters", country: "Country",
                  isKenyaBased: "Kenya Based", contactPersonName: "Contact Name",
                  contactPersonTitle: "Contact Title", contactPersonPhone: "Contact Phone",
                };
                const fmt = (key: string, v: any) => {
                  if (v === null || v === undefined || v === "") return <span className="italic text-neutral-text-muted">No value</span>;
                  if (Array.isArray(v)) return <span>{v.join(", ")}</span>;
                  if (key === "companyLogo") return <a href={String(v)} target="_blank" rel="noopener noreferrer" className="text-brand-orange underline break-all">View logo ↗</a>;
                  if (typeof v === "boolean") return <span>{v ? "Yes" : "No"}</span>;
                  return <span className="break-words">{String(v)}</span>;
                };
                return Object.entries(pendingEdits.changes as Record<string, any>)
                  .filter(([key, proposed]) => JSON.stringify((profile as any)?.[key]) !== JSON.stringify(proposed))
                  .map(([key, proposed]) => {
                  const current = (profile as any)?.[key];
                  const label = FIELD_LABELS[key] || key;
                  return (
                    <div key={key} className="rounded-lg border border-amber-200 overflow-hidden">
                      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide bg-amber-50 text-amber-800 border-b border-amber-200">
                        {label}
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-neutral-border">
                        <div className="px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-text-muted mb-1">Current</p>
                          <p className="text-sm text-neutral-text-secondary leading-relaxed">{fmt(key, current)}</p>
                        </div>
                        <div className="px-4 py-3 bg-amber-50/60">
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1 text-amber-700">Proposed</p>
                          <p className="text-sm leading-relaxed font-medium text-amber-900">{fmt(key, proposed)}</p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer: reject note + actions */}
            <div className="px-6 py-4 border-t border-neutral-border space-y-3">
              {showRejectNoteInput && (
                <div>
                  <label className="block text-xs font-medium text-neutral-text mb-1.5">Rejection note (optional)</label>
                  <input
                    type="text"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Reason for rejection…"
                    className="w-full px-3 py-2.5 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setProcessingEdits(true);
                    try {
                      await approvePendingEdits({ editId: pendingEdits._id });
                      setShowEditsModal(false);
                      alert("Profile changes approved and applied successfully.");
                    } catch (e) { console.error(e); alert("Failed to approve changes."); }
                    setProcessingEdits(false);
                  }}
                  disabled={processingEdits}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Approve & Apply
                </button>
                {!showRejectNoteInput ? (
                  <button
                    onClick={() => setShowRejectNoteInput(true)}
                    disabled={processingEdits}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    Reject
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setProcessingEdits(true);
                      try {
                        await rejectPendingEdits({ editId: pendingEdits._id, adminNote: rejectNote || undefined });
                        setShowRejectNoteInput(false);
                        setRejectNote("");
                        setShowEditsModal(false);
                        alert("Profile changes rejected.");
                      } catch (e) { console.error(e); alert("Failed to reject changes."); }
                      setProcessingEdits(false);
                    }}
                    disabled={processingEdits}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    Confirm Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending changes banner */}
      {pendingEdits && (
        <button
          onClick={() => setShowEditsModal(true)}
          className="w-full mb-6 flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors text-left"
        >
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <GitCompare className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-amber-900">
            {Object.entries(pendingEdits.changes as Record<string, any>).filter(([k, v]) => JSON.stringify((profile as any)?.[k]) !== JSON.stringify(v)).length} profile field{Object.entries(pendingEdits.changes as Record<string, any>).filter(([k, v]) => JSON.stringify((profile as any)?.[k]) !== JSON.stringify(v)).length !== 1 ? "s" : ""} pending approval
          </span>
          <span className="text-xs text-amber-700 font-medium">Review →</span>
        </button>
      )}

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-text">Recent Job Postings</h3>
              <Link
                href={`/employers/${employerId}/post-job`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange/10 text-brand-orange text-sm font-medium hover:bg-brand-orange/20 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Post Job
              </Link>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-text-secondary mb-3">No jobs posted yet</p>
                <Link
                  href={`/employers/${employerId}/post-job`}
                  className="px-4 py-2 rounded-lg bg-brand-orange text-white text-sm font-medium hover:bg-brand-orange/90 transition-colors inline-block"
                >
                  Post their first job
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job: any) => (
                  <div
                    key={job._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-border hover:bg-neutral-bg-secondary transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-neutral-text">{job.title}</h4>
                        {job.postedByAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold tracking-wide">
                            ADMIN
                          </span>
                        )}
                      </div>
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
                    <DocumentLink storageId={profile.incorporationCertStorageId} label="Incorporation Certificate" />
                  )}
                  {profile?.kraCertStorageId && (
                    <DocumentLink storageId={profile.kraCertStorageId} label="KRA Certificate" />
                  )}
                  {profile?.registrationDocStorageId && (
                    <DocumentLink storageId={profile.registrationDocStorageId} label="Registration Document" />
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
