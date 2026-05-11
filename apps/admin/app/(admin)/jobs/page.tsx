"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Eye, ChevronLeft, ChevronRight, FileText, Upload,
  MoreVertical, Star, StarOff, Flag, FlagOff, Clock, Trash2,
  CheckCircle2, AlertTriangle, ExternalLink, ClipboardCopy,
  TrendingUp, XCircle, Archive, Users,
} from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { Id } from "../../../../../convex/_generated/dataModel";

type Job = {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  status: string;
  applicationsCount: number;
  createdAt: number;
  expiresAt?: number;
  featured?: boolean;
  flagged?: boolean;
  flagReason?: string;
  postedByAdmin?: boolean;
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
  applicationDeadline?: string;
  positions: number;
  experienceLevel: string;
  applicationSettings?: {
    requireResume: boolean;
    requireCoverLetter: boolean;
    requirePortfolio: boolean;
    requireLinkedIn: boolean;
    requireAvailability: boolean;
    requireSalaryExpectations: boolean;
    requireWorkAuthorization: boolean;
    requireWillingToRelocate: boolean;
    customQuestions?: Array<{ question: string; type: string; required: boolean; options?: string[] }>;
  };
  slug?: string;
};

function getStatusColor(status: string) {
  switch (status) {
    case "published": return "bg-green-50 text-green-700";
    case "draft": return "bg-gray-100 text-gray-600";
    case "closed": return "bg-red-50 text-red-700";
    case "archived": return "bg-neutral-bg-secondary text-neutral-text-muted";
    case "expired": return "bg-orange-50 text-orange-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

function ActionDropdown({ job, onPreview, onAction }: {
  job: Job;
  onPreview: () => void;
  onAction: (action: string, job: Job) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const canPublish = ["draft", "closed", "expired", "archived"].includes(job.status);
  const canClose = job.status === "published";
  const canArchive = job.status !== "archived";
  const canExtend = ["published", "expired"].includes(job.status);

  const Item = ({ icon: Icon, label, onClick, color }: {
    icon: any; label: string; onClick: () => void; color?: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-bg-secondary text-sm ${color ?? "text-neutral-text"}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg hover:bg-neutral-bg-secondary text-neutral-text-secondary transition-colors"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-52 bg-white border border-neutral-border rounded-xl shadow-xl py-1 text-sm overflow-hidden">
          <Item icon={Eye} label="Preview job" onClick={() => { setOpen(false); onPreview(); }} color="text-blue-600" />
          {job.slug && (
            <Item
              icon={ClipboardCopy}
              label="Copy job link"
              onClick={() => {
                navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_WEB_URL ?? ""}/jobs/${job.slug}`);
                setOpen(false);
              }}
              color="text-neutral-text-secondary"
            />
          )}
          <a
            href={`/applications?jobId=${job._id}`}
            className="flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-bg-secondary text-neutral-text"
            onClick={() => setOpen(false)}
          >
            <Users className="w-4 h-4" /> View applications ({job.applicationsCount})
          </a>

          <div className="border-t border-neutral-border my-1" />

          {canPublish && <Item icon={Upload} label="Publish" onClick={() => { setOpen(false); onAction("publish", job); }} color="text-green-700" />}
          {canClose && <Item icon={XCircle} label="Close / unpublish" onClick={() => { setOpen(false); onAction("close", job); }} color="text-orange-700" />}
          {canExtend && <Item icon={Clock} label="Extend +30 days" onClick={() => { setOpen(false); onAction("extend", job); }} color="text-blue-700" />}
          {canArchive && <Item icon={Archive} label="Archive" onClick={() => { setOpen(false); onAction("archive", job); }} color="text-neutral-text-secondary" />}

          <div className="border-t border-neutral-border my-1" />

          {!job.featured
            ? <Item icon={Star} label="Mark as featured" onClick={() => { setOpen(false); onAction("feature", job); }} color="text-amber-600" />
            : <Item icon={StarOff} label="Remove featured" onClick={() => { setOpen(false); onAction("unfeature", job); }} color="text-neutral-text-secondary" />
          }
          {!job.flagged
            ? <Item icon={Flag} label="Flag for review" onClick={() => { setOpen(false); onAction("flag", job); }} color="text-red-600" />
            : <Item icon={FlagOff} label="Clear flag" onClick={() => { setOpen(false); onAction("unflag", job); }} color="text-neutral-text-secondary" />
          }

          <div className="border-t border-neutral-border my-1" />

          <button
            onClick={() => { setOpen(false); onAction("delete", job); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-red-600 text-sm"
          >
            <Trash2 className="w-4 h-4" /> Delete job
          </button>
        </div>
      )}
    </div>
  );
}

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
              placeholder="e.g. Spam, misleading content, policy violation..."
              className="w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
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

export default function JobsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "closed" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [confirm, setConfirm] = useState<{ action: string; job: Job; inputValue?: string } | null>(null);
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const forcePublishJob = useMutation(api.admin.forcePublishJob);
  const closeJob = useMutation(api.admin.adminCloseJob);
  const archiveJob = useMutation(api.admin.adminArchiveJob);
  const featureJob = useMutation(api.admin.adminFeatureJob);
  const flagJob = useMutation(api.admin.adminFlagJob);
  const extendExpiry = useMutation(api.admin.adminExtendJobExpiry);
  const deleteJob = useMutation(api.admin.adminDeleteJob);

  const data = useQuery(api.admin.getAllJobs, {
    status: statusFilter,
    search: debouncedSearch,
    page: currentPage,
    pageSize,
  });

  const filteredJobs: Job[] = (data?.jobs ?? []) as Job[];

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const executeAction = async (action: string, job: Job, extra?: { input?: string }) => {
    setLoadingJobId(job._id);
    try {
      const id = job._id as Id<"jobs">;
      if (action === "publish") { await forcePublishJob({ jobId: id }); showToast(`"${job.title}" published`); }
      else if (action === "close") { await closeJob({ jobId: id }); showToast(`"${job.title}" closed`); }
      else if (action === "archive") { await archiveJob({ jobId: id }); showToast(`"${job.title}" archived`); }
      else if (action === "feature") { await featureJob({ jobId: id, featured: true }); showToast(`"${job.title}" featured`); }
      else if (action === "unfeature") { await featureJob({ jobId: id, featured: false }); showToast(`Featured removed`); }
      else if (action === "flag") { await flagJob({ jobId: id, reason: extra?.input || "Policy violation" }); showToast(`"${job.title}" flagged & closed`); }
      else if (action === "unflag") { await flagJob({ jobId: id, clear: true }); showToast(`Flag cleared`); }
      else if (action === "extend") { await extendExpiry({ jobId: id, days: 30 }); showToast(`"${job.title}" extended 30 days`); }
      else if (action === "delete") { await deleteJob({ jobId: id }); showToast(`"${job.title}" deleted`); }
    } catch (e: any) {
      showToast(e?.message ?? "Action failed", "error");
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleAction = (action: string, job: Job) => {
    if (["delete", "flag", "close", "archive"].includes(action)) {
      setConfirm({ action, job, inputValue: "" });
    } else {
      executeAction(action, job);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-6 py-4"><div className="h-4 w-full bg-gray-200 rounded" /></td>
      ))}
    </tr>
  );

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const totalApps = filteredJobs.reduce((s, j) => s + (j.applicationsCount ?? 0), 0);

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}>
          {toast.type === "error" ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={
            confirm.action === "delete" ? "Delete this job permanently?" :
            confirm.action === "flag" ? "Flag this job for review?" :
            confirm.action === "close" ? "Close this job?" : "Archive this job?"
          }
          message={
            confirm.action === "delete"
              ? `This will permanently remove "${confirm.job.title}" and all its applications. This cannot be undone.`
              : confirm.action === "flag"
              ? `"${confirm.job.title}" will be closed and flagged. Optionally provide a reason.`
              : confirm.action === "close"
              ? `"${confirm.job.title}" will be removed from public listings. The employer can re-publish it.`
              : `"${confirm.job.title}" will be archived.`
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
            executeAction(c.action, c.job, { input: c.inputValue });
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Jobs Management</h2>
        <p className="text-neutral-text-secondary">Monitor, moderate and manage all job postings</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-neutral-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-muted" />
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
            className="px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          >
            <option value="all">All Jobs</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Jobs", value: data?.pagination.total ?? 0, color: "text-neutral-text" },
          { label: "Published", value: filteredJobs.filter((j) => j.status === "published").length, color: "text-green-600" },
          { label: "Draft", value: filteredJobs.filter((j) => j.status === "draft").length, color: "text-gray-500" },
          { label: "Total Applications", value: totalApps, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg border border-neutral-border p-5">
            <p className="text-sm text-neutral-text-secondary mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Job</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Posted</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Apps</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border">
              {!data ? (
                <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-text-secondary">No jobs found</td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr
                    key={job._id}
                    className={`hover:bg-neutral-bg-secondary/40 transition-colors ${loadingJobId === job._id ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-neutral-text">{job.title}</span>
                        {job.featured && <span title="Featured"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" /></span>}
                        {job.flagged && <span title={job.flagReason ?? "Flagged"}><Flag className="w-3.5 h-3.5 text-red-500 flex-shrink-0" /></span>}
                      </div>
                      <div className="text-sm text-neutral-text-secondary">{job.companyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-text">{job.location}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-text">{formatDate(job.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-neutral-text-muted" />
                        <span className="text-sm font-medium text-neutral-text">{job.applicationsCount ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/jobs/${job._id}`)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          title="Preview job"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <ActionDropdown job={job} onPreview={() => router.push(`/jobs/${job._id}`)} onAction={handleAction} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-border flex items-center justify-between">
            <p className="text-sm text-neutral-text-secondary">
              Showing {((data.pagination.page - 1) * data.pagination.pageSize) + 1}–
              {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of {data.pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-neutral-border hover:bg-neutral-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-neutral-text px-3">{data.pagination.page} / {data.pagination.totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={currentPage === data.pagination.totalPages}
                className="p-2 rounded-lg border border-neutral-border hover:bg-neutral-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
