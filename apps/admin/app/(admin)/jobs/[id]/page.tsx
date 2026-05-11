"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import {
  ArrowLeft, Star, StarOff, Flag, FlagOff, Clock, Trash2,
  Upload, XCircle, Archive, CheckCircle2, AlertTriangle,
  MapPin, Briefcase, Building2, Calendar, Users, DollarSign,
  ExternalLink, ClipboardCopy, Eye, TrendingUp, FileText,
  ChevronRight, Shield,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type CustomQuestion = {
  question: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "file";
  required: boolean;
  options?: string[];
};

type ApplicationSettings = {
  requireResume: boolean;
  requireCoverLetter: boolean;
  requirePortfolio: boolean;
  requireLinkedIn: boolean;
  requireAvailability: boolean;
  requireSalaryExpectations: boolean;
  requireWorkAuthorization: boolean;
  requireWillingToRelocate: boolean;
  customQuestions?: CustomQuestion[];
};

type Job = {
  _id: string;
  _creationTime: number;
  title: string;
  companyName: string;
  location: string;
  status: string;
  applicationsCount: number;
  viewsCount: number;
  companyLogoUrl?: string;
  employerCompanyName?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  featured?: boolean;
  flagged?: boolean;
  flagReason?: string;
  postedByAdmin?: boolean;
  adminNote?: string;
  department?: string;
  employmentType: string;
  workplaceType: string;
  description: string;
  responsibilities: string;
  requirements: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  niceToHave?: string;
  benefits?: string;
  salaryDisclosure: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  salaryPeriod?: string;
  applicationDeadline?: string;
  positions: number;
  experienceLevel: string;
  applicationSettings?: ApplicationSettings;
  slug?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusColor(status: string) {
  switch (status) {
    case "published": return "bg-green-50 text-green-700 border-green-200";
    case "draft": return "bg-gray-100 text-gray-600 border-gray-200";
    case "closed": return "bg-red-50 text-red-700 border-red-200";
    case "archived": return "bg-neutral-100 text-neutral-500 border-neutral-200";
    case "expired": return "bg-orange-50 text-orange-700 border-orange-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function formatSalary(job: Job) {
  if (job.salaryDisclosure !== "range" || !job.salaryMin || !job.salaryMax) {
    return "Salary not disclosed";
  }
  const periodLabel: Record<string, string> = {
    year: "/yr",
    month: "/mo",
    hour: "/hr",
  };
  const period = job.salaryPeriod ? periodLabel[job.salaryPeriod] ?? "" : "";
  const range = `${job.currency ?? "KES"} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`;
  return period ? `${range} ${period}` : range;
}

// ─── Question Preview Renderer ────────────────────────────────────────────────
function QuestionPreview({
  question,
  type,
  required,
  options = [],
  index,
  badge,
}: {
  question: string;
  type: string;
  required: boolean;
  options?: string[];
  index: number;
  badge?: "predefined" | "custom";
}) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">
              {question}
              {required && <span className="ml-1 text-red-500 text-xs font-normal">*required</span>}
            </p>
            {badge === "predefined" && (
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded border border-blue-100 uppercase tracking-wide">
                Standard
              </span>
            )}
            {badge === "custom" && (
              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded border border-purple-100 uppercase tracking-wide">
                Custom
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Input Preview */}
      <div className="ml-9">
        {type === "text" && (
          <input
            readOnly
            disabled
            placeholder="Applicant's answer…"
            className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-400 cursor-not-allowed"
          />
        )}
        {type === "textarea" && (
          <textarea
            readOnly
            disabled
            rows={3}
            placeholder="Applicant's answer…"
            className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-400 cursor-not-allowed resize-none"
          />
        )}
        {type === "select" && (
          <select
            disabled
            className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-400 cursor-not-allowed"
          >
            <option value="">Select an option…</option>
            {options.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        )}
        {type === "radio" && (
          <div className="space-y-2">
            {options.length > 0 ? (
              options.map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-not-allowed">
                  <input type="radio" disabled className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-gray-600">{opt}</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No options defined</p>
            )}
          </div>
        )}
        {type === "checkbox" && (
          <div className="space-y-2">
            {options.length > 0 ? (
              options.map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-not-allowed">
                  <input type="checkbox" disabled className="w-4 h-4 accent-orange-500 rounded" />
                  <span className="text-sm text-gray-600">{opt}</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No options defined</p>
            )}
          </div>
        )}
        {type === "file" && (
          <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 bg-gray-50 rounded-lg">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">File upload field</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  title, message, confirmLabel, danger,
  onConfirm, onCancel,
  showInput, inputLabel, inputValue, onInputChange,
}: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
  showInput?: boolean; inputLabel?: string; inputValue?: string; onInputChange?: (v: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${danger ? "text-red-500" : "text-orange-500"}`} />
          <div>
            <h3 className="font-semibold text-neutral-text">{title}</h3>
            <p className="text-sm text-neutral-text-secondary mt-1">{message}</p>
          </div>
        </div>
        {showInput && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-text mb-1">{inputLabel}</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange?.(e.target.value)}
              placeholder="e.g. Spam, misleading content, policy violation…"
              className="w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              autoFocus
            />
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-orange hover:bg-brand-orange/90"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminJobPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const job = useQuery(
    api.admin.adminGetJob,
    jobId ? { jobId: jobId as Id<"jobs"> } : "skip"
  ) as Job | undefined | null;

  const [confirm, setConfirm] = useState<{ action: string; inputValue?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const forcePublishJob = useMutation(api.admin.forcePublishJob);
  const closeJob = useMutation(api.admin.adminCloseJob);
  const archiveJob = useMutation(api.admin.adminArchiveJob);
  const featureJob = useMutation(api.admin.adminFeatureJob);
  const flagJob = useMutation(api.admin.adminFlagJob);
  const extendExpiry = useMutation(api.admin.adminExtendJobExpiry);
  const deleteJob = useMutation(api.admin.adminDeleteJob);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const executeAction = async (action: string, extra?: { input?: string }) => {
    if (!job) return;
    setLoading(true);
    try {
      const id = job._id as Id<"jobs">;
      if (action === "publish") { await forcePublishJob({ jobId: id }); showToast(`"${job.title}" published`); }
      else if (action === "close") { await closeJob({ jobId: id }); showToast(`"${job.title}" closed`); }
      else if (action === "archive") { await archiveJob({ jobId: id }); showToast(`"${job.title}" archived`); }
      else if (action === "feature") { await featureJob({ jobId: id, featured: true }); showToast(`Marked as featured`); }
      else if (action === "unfeature") { await featureJob({ jobId: id, featured: false }); showToast(`Featured status removed`); }
      else if (action === "flag") { await flagJob({ jobId: id, reason: extra?.input || "Policy violation" }); showToast(`"${job.title}" flagged and closed`); }
      else if (action === "unflag") { await flagJob({ jobId: id, clear: true }); showToast(`Flag cleared`); }
      else if (action === "extend") { await extendExpiry({ jobId: id, days: 30 }); showToast(`"${job.title}" extended by 30 days`); }
      else if (action === "delete") {
        await deleteJob({ jobId: id });
        showToast(`"${job.title}" deleted`);
        setTimeout(() => router.push("/jobs"), 1200);
        return;
      }
    } catch (e: any) {
      showToast(e?.message ?? "Action failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string) => {
    if (["delete", "flag", "close", "archive"].includes(action)) {
      setConfirm({ action, inputValue: "" });
    } else {
      executeAction(action);
    }
  };

  // ── Loading / Error States ───────────────────────────────────────────────
  if (job === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-6">
          <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
          <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
          <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
          <div className="w-48 h-4 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Header bar */}
        <div className="bg-white border border-neutral-border rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-64 h-6 bg-gray-200 animate-pulse rounded" />
                <div className="w-16 h-5 bg-gray-200 animate-pulse rounded-full" />
              </div>
              <div className="w-36 h-4 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-7 bg-gray-200 animate-pulse rounded-lg" />
              <div className="w-24 h-7 bg-gray-200 animate-pulse rounded-lg" />
              <div className="w-28 h-7 bg-gray-200 animate-pulse rounded-lg" />
            </div>
          </div>
          {/* Action buttons row */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-border">
            {[80, 64, 96, 72, 88, 80, 96, 72].map((w, i) => (
              <div key={i} style={{ width: w }} className="h-7 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>

        {/* Body: 2-column */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-6">

          {/* Left column */}
          <div className="space-y-6">

            {/* Company header card */}
            <div className="bg-white border border-neutral-border rounded-xl overflow-hidden">
              <div className="h-2 bg-gray-200 animate-pulse" />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-16 h-16 bg-gray-200 animate-pulse rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-2/3 h-7 bg-gray-200 animate-pulse rounded" />
                    <div className="w-1/3 h-5 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
                {/* Meta chips */}
                <div className="flex flex-wrap gap-2">
                  {[96, 80, 88, 80, 72].map((w, i) => (
                    <div key={i} style={{ width: w }} className="h-8 bg-gray-200 animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
            </div>

            {/* Compensation card */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="w-24 h-3 bg-green-200 animate-pulse rounded mb-2" />
              <div className="w-48 h-7 bg-green-200 animate-pulse rounded" />
            </div>

            {/* Description sections — About / Responsibilities / Requirements */}
            {[
              { title: 140, lines: [260, 240, 220, 260, 200, 240] },
              { title: 120, lines: [260, 220, 240, 200, 260, 220, 200] },
              { title: 100, lines: [260, 220, 260, 200, 240] },
            ].map((sec, si) => (
              <div key={si} className="bg-white border border-neutral-border rounded-xl p-6">
                <div style={{ width: sec.title }} className="h-5 bg-gray-200 animate-pulse rounded mb-3" />
                <div className="space-y-2">
                  {sec.lines.map((w, li) => (
                    <div key={li} style={{ maxWidth: w }} className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                  ))}
                </div>
              </div>
            ))}

            {/* Skills card */}
            <div className="bg-white border border-neutral-border rounded-xl p-6 space-y-4">
              <div>
                <div className="w-28 h-4 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="flex flex-wrap gap-2">
                  {[64, 80, 56, 72, 64].map((w, i) => (
                    <div key={i} style={{ width: w }} className="h-7 bg-gray-200 animate-pulse rounded-full" />
                  ))}
                </div>
              </div>
              <div>
                <div className="w-28 h-4 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="flex flex-wrap gap-2">
                  {[56, 72, 64, 80].map((w, i) => (
                    <div key={i} style={{ width: w }} className="h-7 bg-gray-200 animate-pulse rounded-full" />
                  ))}
                </div>
              </div>
            </div>

            {/* Application requirements card */}
            <div className="bg-white border border-neutral-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="w-44 h-5 bg-gray-200 animate-pulse rounded" />
                <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="mb-4">
                <div className="w-36 h-3 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="flex gap-2 flex-wrap">
                  {[88, 96, 80].map((w, i) => (
                    <div key={i} style={{ width: w }} className="h-7 bg-gray-200 animate-pulse rounded-full" />
                  ))}
                </div>
              </div>
              <div className="w-36 h-3 bg-gray-200 animate-pulse rounded mb-3" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-6 h-6 bg-gray-200 animate-pulse rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded" />
                        <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="ml-9 h-9 bg-gray-200 animate-pulse rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Metrics */}
            <div className="bg-white border border-neutral-border rounded-xl p-5">
              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded mb-3" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center p-3 bg-neutral-bg-secondary rounded-lg border border-neutral-border">
                    <div className="w-10 h-6 bg-gray-200 animate-pulse rounded mx-auto mb-1" />
                    <div className="w-8 h-3 bg-gray-200 animate-pulse rounded mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-neutral-border rounded-xl p-5">
              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="w-20 h-3 bg-gray-200 animate-pulse rounded" />
                    <div className="w-24 h-3 bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white border border-neutral-border rounded-xl p-5">
              <div className="w-14 h-4 bg-gray-200 animate-pulse rounded mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="w-20 h-3 bg-gray-200 animate-pulse rounded" />
                    <div className="w-24 h-3 bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-neutral-text mb-2">Job Not Found</h2>
        <p className="text-neutral-text-secondary mb-6">This job may have been deleted.</p>
        <button onClick={() => router.push("/jobs")} className="px-6 py-2.5 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90">
          Back to Jobs
        </button>
      </div>
    );
  }

  // ── Build predefined questions ────────────────────────────────────────────
  const predefinedQuestions: (CustomQuestion & { key: string })[] = [];
  if (job.applicationSettings?.requireAvailability) {
    predefinedQuestions.push({ key: "availability", question: "When are you available to start?", type: "text", required: true });
  }
  if (job.applicationSettings?.requireSalaryExpectations) {
    predefinedQuestions.push({ key: "salary", question: "What are your salary expectations for this role?", type: "text", required: true });
  }
  if (job.applicationSettings?.requireWorkAuthorization) {
    predefinedQuestions.push({ key: "workauth", question: "Are you currently authorized to work in Kenya?", type: "radio", required: true, options: ["Yes", "No"] });
  }
  if (job.applicationSettings?.requireWillingToRelocate) {
    predefinedQuestions.push({ key: "relocate", question: "Are you willing to relocate for this position?", type: "radio", required: true, options: ["Yes", "No", "Open to discussion"] });
  }

  const customQuestions = job.applicationSettings?.customQuestions ?? [];
  const allQuestions = [...predefinedQuestions, ...customQuestions.map((q) => ({ ...q, key: undefined as any }))];

  // ── Required documents ────────────────────────────────────────────────────
  const reqDocs = (
    [
      [job.applicationSettings?.requireResume, "Resume / CV"],
      [job.applicationSettings?.requireCoverLetter, "Cover Letter"],
      [job.applicationSettings?.requirePortfolio, "Portfolio"],
      [job.applicationSettings?.requireLinkedIn, "LinkedIn Profile"],
    ] as [boolean | undefined, string][]
  ).filter(([v]) => v).map(([, l]) => l);

  const canPublish = ["draft", "closed", "expired", "archived"].includes(job.status);
  const canClose = job.status === "published";
  const canExtend = ["published", "expired"].includes(job.status);
  const canArchive = job.status !== "archived";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}>
          {toast.type === "error" ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          title={
            confirm.action === "delete" ? "Delete this job permanently?" :
            confirm.action === "flag" ? "Flag this job for review?" :
            confirm.action === "close" ? "Close this job posting?" : "Archive this job?"
          }
          message={
            confirm.action === "delete"
              ? `This will permanently delete "${job.title}" and all its applications. This cannot be undone.`
              : confirm.action === "flag"
              ? `"${job.title}" will be closed and flagged for review. You can optionally add a reason.`
              : confirm.action === "close"
              ? `"${job.title}" will be removed from public listings. The employer can re-publish it.`
              : `"${job.title}" will be moved to archived.`
          }
          confirmLabel={
            confirm.action === "delete" ? "Delete permanently" :
            confirm.action === "flag" ? "Flag & close" :
            confirm.action === "close" ? "Close job" : "Archive"
          }
          danger={confirm.action === "delete"}
          showInput={confirm.action === "flag"}
          inputLabel="Reason (optional)"
          inputValue={confirm.inputValue}
          onInputChange={(v) => setConfirm((c) => c ? { ...c, inputValue: v } : c)}
          onConfirm={() => {
            const c = confirm;
            setConfirm(null);
            executeAction(c.action, { input: c.inputValue });
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-neutral-text-secondary py-6">
        <button onClick={() => router.push("/jobs")} className="hover:text-neutral-text flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Jobs
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-neutral-text font-medium truncate max-w-xs">{job.title}</span>
      </div>

      {/* ── Header Bar ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-neutral-border rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Title + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-neutral-text truncate">{job.title}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
              {job.featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500" /> Featured
                </span>
              )}
              {job.flagged && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                  <Flag className="w-3 h-3" /> Flagged{job.flagReason ? `: ${job.flagReason}` : ""}
                </span>
              )}
              {job.postedByAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                  <Shield className="w-3 h-3" /> Admin post
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-text-secondary">{job.companyName}</p>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {job.slug && (
              <>
                <a
                  href={`${process.env.NEXT_PUBLIC_WEB_URL ?? ""}/jobs/${job.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View live
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_WEB_URL ?? ""}/jobs/${job.slug}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-text border border-neutral-border bg-white rounded-lg hover:bg-neutral-bg-secondary"
                >
                  <ClipboardCopy className="w-3.5 h-3.5" /> Copy link
                </button>
              </>
            )}
            <a
              href={`/applications?jobId=${job._id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-text border border-neutral-border bg-white rounded-lg hover:bg-neutral-bg-secondary"
            >
              <Users className="w-3.5 h-3.5" /> {job.applicationsCount} applications
            </a>
          </div>
        </div>

        {/* ── Action Buttons ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-border">
          {canPublish && (
            <button
              disabled={loading}
              onClick={() => handleAction("publish")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" /> Publish
            </button>
          )}
          {canClose && (
            <button
              disabled={loading}
              onClick={() => handleAction("close")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" /> Close
            </button>
          )}
          {canExtend && (
            <button
              disabled={loading}
              onClick={() => handleAction("extend")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" /> Extend +30 days
            </button>
          )}
          {canArchive && (
            <button
              disabled={loading}
              onClick={() => handleAction("archive")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-text bg-neutral-bg-secondary border border-neutral-border rounded-lg hover:bg-neutral-border disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" /> Archive
            </button>
          )}

          <div className="h-5 w-px bg-neutral-border mx-0.5" />

          {!job.featured ? (
            <button
              disabled={loading}
              onClick={() => handleAction("feature")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50"
            >
              <Star className="w-3.5 h-3.5" /> Mark Featured
            </button>
          ) : (
            <button
              disabled={loading}
              onClick={() => handleAction("unfeature")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-text bg-neutral-bg-secondary border border-neutral-border rounded-lg hover:bg-neutral-border disabled:opacity-50"
            >
              <StarOff className="w-3.5 h-3.5" /> Remove Featured
            </button>
          )}
          {!job.flagged ? (
            <button
              disabled={loading}
              onClick={() => handleAction("flag")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              <Flag className="w-3.5 h-3.5" /> Flag for Review
            </button>
          ) : (
            <button
              disabled={loading}
              onClick={() => handleAction("unflag")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-text bg-neutral-bg-secondary border border-neutral-border rounded-lg hover:bg-neutral-border disabled:opacity-50"
            >
              <FlagOff className="w-3.5 h-3.5" /> Clear Flag
            </button>
          )}

          <div className="h-5 w-px bg-neutral-border mx-0.5" />

          <button
            disabled={loading}
            onClick={() => handleAction("delete")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* ── Body: 2-column layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-6">

        {/* ─── LEFT: Job Preview ─────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Company header */}
          <div className="bg-white border border-neutral-border rounded-xl overflow-hidden">
            {/* Brand stripe */}
            <div className="h-2 bg-gradient-to-r from-brand-orange to-orange-400" />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {job.companyLogoUrl ? (
                    <img
                      src={job.companyLogoUrl}
                      alt={job.employerCompanyName ?? job.companyName}
                      className="w-16 h-16 rounded-xl object-contain border border-neutral-border bg-white p-1 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-orange-600 rounded-xl flex items-center justify-center shadow-sm shadow-orange-100">
                      <span className="text-2xl font-bold text-white">
                        {(job.employerCompanyName ?? job.companyName)?.charAt(0)?.toUpperCase() ?? "C"}
                      </span>
                    </div>
                  )}
                </div>
                {/* Title block */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-neutral-text leading-tight">{job.title}</h2>
                  <p className="text-base text-neutral-text-secondary mt-0.5 font-medium">
                    {job.employerCompanyName ?? job.companyName}
                  </p>
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2.5">
                {([
                  [MapPin, job.location],
                  [Briefcase, job.employmentType.replace(/-/g, " ")],
                  [Building2, job.workplaceType],
                  [TrendingUp, job.experienceLevel],
                ] as [any, string][]).map(([Icon, val]) => (
                  <div key={val} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-bg-secondary rounded-lg text-sm text-neutral-text-secondary capitalize border border-neutral-border">
                    <Icon className="w-3.5 h-3.5 text-neutral-text-muted" /> {val}
                  </div>
                ))}
                {job.positions > 1 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-bg-secondary rounded-lg text-sm text-neutral-text-secondary border border-neutral-border">
                    <Users className="w-3.5 h-3.5 text-neutral-text-muted" /> {job.positions} openings
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Compensation</p>
            <p className="text-xl font-bold text-green-800">{formatSalary(job)}</p>
            {job.applicationDeadline && (
              <p className="text-sm text-green-700 mt-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Application deadline: {new Date(job.applicationDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>

          {/* Description sections */}
          {(
            [
              ["About the Role", job.description],
              ["Responsibilities", job.responsibilities],
              ["Requirements", job.requirements],
              ["Nice to Have", job.niceToHave],
              ["Benefits & Perks", job.benefits],
            ] as [string, string | undefined][]
          ).filter(([, c]) => c).map(([title, content]) => (
            <div key={title} className="bg-white border border-neutral-border rounded-xl p-6">
              <h3 className="text-base font-bold text-neutral-text mb-3">{title}</h3>
              <p className="text-sm text-neutral-text-secondary whitespace-pre-line leading-relaxed">{content}</p>
            </div>
          ))}

          {/* Skills */}
          {((job.requiredSkills?.length ?? 0) > 0 || (job.preferredSkills?.length ?? 0) > 0) && (
            <div className="bg-white border border-neutral-border rounded-xl p-6 space-y-4">
              {job.requiredSkills?.length ? (
                <div>
                  <h3 className="text-sm font-bold text-neutral-text mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200 font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {job.preferredSkills?.length ? (
                <div>
                  <h3 className="text-sm font-bold text-neutral-text mb-2">Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-neutral-bg-secondary text-neutral-text-secondary text-xs rounded-full border border-neutral-border font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Application Requirements & Questions */}
          {(reqDocs.length > 0 || allQuestions.length > 0) && (
            <div className="bg-white border border-neutral-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-neutral-text">Application Requirements</h3>
                <span className="text-xs text-neutral-text-muted">{allQuestions.length} question{allQuestions.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Required documents */}
              {reqDocs.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-neutral-text-secondary uppercase tracking-wide mb-2">Required Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {reqDocs.map((d) => (
                      <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* All questions */}
              {allQuestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-neutral-text-secondary uppercase tracking-wide mb-2">Screening Questions</p>
                  {predefinedQuestions.map((q, i) => (
                    <QuestionPreview
                      key={q.key}
                      index={i}
                      question={q.question}
                      type={q.type}
                      required={q.required}
                      options={q.options}
                      badge="predefined"
                    />
                  ))}
                  {customQuestions.map((q, i) => (
                    <QuestionPreview
                      key={`custom-${i}`}
                      index={predefinedQuestions.length + i}
                      question={q.question}
                      type={q.type}
                      required={q.required}
                      options={q.options}
                      badge="custom"
                    />
                  ))}
                </div>
              )}

              {allQuestions.length === 0 && reqDocs.length === 0 && (
                <p className="text-sm text-neutral-text-muted italic text-center py-4">No additional requirements configured</p>
              )}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Admin Sidebar ──────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Metrics */}
          <div className="bg-white border border-neutral-border rounded-xl p-5">
            <h4 className="text-sm font-bold text-neutral-text mb-3">Metrics</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-neutral-bg-secondary rounded-lg border border-neutral-border">
                <p className="text-xl font-bold text-neutral-text">{job.viewsCount ?? 0}</p>
                <p className="text-xs text-neutral-text-muted flex items-center justify-center gap-1 mt-0.5">
                  <Eye className="w-3 h-3" /> Views
                </p>
              </div>
              <div className="text-center p-3 bg-neutral-bg-secondary rounded-lg border border-neutral-border">
                <p className="text-xl font-bold text-neutral-text">{job.applicationsCount}</p>
                <p className="text-xs text-neutral-text-muted flex items-center justify-center gap-1 mt-0.5">
                  <Users className="w-3 h-3" /> Applied
                </p>
              </div>
              <div className="text-center p-3 bg-neutral-bg-secondary rounded-lg border border-neutral-border">
                <p className="text-xl font-bold text-neutral-text">{job.positions}</p>
                <p className="text-xs text-neutral-text-muted flex items-center justify-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3" /> Positions
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-neutral-border rounded-xl p-5">
            <h4 className="text-sm font-bold text-neutral-text mb-3">Timeline</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-text-secondary">
                <span>Posted</span>
                <span className="font-medium text-neutral-text">{new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              {job.expiresAt && (
                <div className="flex justify-between text-neutral-text-secondary">
                  <span>Expires</span>
                  <span className={`font-medium ${job.expiresAt < Date.now() ? "text-red-600" : "text-neutral-text"}`}>
                    {new Date(job.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
              {job.applicationDeadline && (
                <div className="flex justify-between text-neutral-text-secondary">
                  <span>Deadline</span>
                  <span className="font-medium text-neutral-text">{new Date(job.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-text-secondary">
                <span>Last updated</span>
                <span className="font-medium text-neutral-text">{new Date(job.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {job.adminNote && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <h4 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Admin Note
              </h4>
              <p className="text-sm text-yellow-700 whitespace-pre-line">{job.adminNote}</p>
            </div>
          )}

          {/* Flag details */}
          {job.flagged && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                <Flag className="w-4 h-4" /> Flagged for Review
              </h4>
              {job.flagReason && <p className="text-sm text-red-600">{job.flagReason}</p>}
              <button
                disabled={loading}
                onClick={() => handleAction("unflag")}
                className="mt-3 text-xs font-semibold text-red-700 underline hover:no-underline disabled:opacity-50"
              >
                Clear flag
              </button>
            </div>
          )}

          {/* Job details */}
          <div className="bg-white border border-neutral-border rounded-xl p-5">
            <h4 className="text-sm font-bold text-neutral-text mb-3">Details</h4>
            <div className="space-y-2 text-sm">
              {([
                ["Department", job.department],
                ["Employment", job.employmentType?.replace(/-/g, " ")],
                ["Workplace", job.workplaceType],
                ["Experience", job.experienceLevel],
                ["Positions", String(job.positions)],
              ] as [string, string | undefined][]).filter(([, v]) => v).map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-neutral-text-secondary capitalize">{label}</span>
                  <span className="font-medium text-neutral-text capitalize">{val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
