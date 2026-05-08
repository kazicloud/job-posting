"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import {
  X,
  Send,
  PenLine,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Search,
  User,
  AlertCircle,
  Sparkles,
  Users,
  Plus,
  Radio,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UserResult {
  _id: string;
  fullName?: string;
  email: string;
  primaryRole?: string;
}

interface Recipient {
  email: string;
  name: string;
}

type SendMode = "individual" | "bulk_all";

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillEmail?: string;
  prefillName?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { value: "support", label: "Support Response" },
  { value: "account", label: "Account Update" },
  { value: "announcement", label: "Announcement" },
  { value: "policy", label: "Policy Notice" },
  { value: "warning", label: "Important Notice" },
  { value: "other", label: "General" },
] as const;

const TEMPLATES = [
  {
    label: "Welcome & Onboarding",
    subject: "Welcome to Kazicloud — let's get you started",
    category: "announcement" as const,
    body: `We're thrilled to have you on Kazicloud!

To get the most out of the platform, we recommend completing your profile so employers and job seekers can discover you.

Here's a quick checklist to get started:
• Complete your profile with your latest experience and skills
• Upload your CV for faster applications
• Turn on job alerts for roles matching your interests

If you have any questions, our support team is always here to help.

Best regards,`,
  },
  {
    label: "Account Notice",
    subject: "Important update regarding your Kazicloud account",
    category: "account" as const,
    body: `We are reaching out regarding your Kazicloud account.

[Replace this with your specific message]

If you have any questions about this notice, please do not hesitate to contact our support team.

Best regards,`,
  },
  {
    label: "Platform Guidelines",
    subject: "Reminder: Kazicloud Platform Guidelines",
    category: "policy" as const,
    body: `As a reminder, all users on Kazicloud are expected to adhere to our platform guidelines to ensure a safe and fair experience for everyone.

Key guidelines:
• Provide accurate and truthful information on your profile and job postings
• Treat all users with respect and professionalism
• Never charge job seekers to apply, interview, or get hired
• Report any suspicious activity to our support team immediately

We appreciate your cooperation in keeping Kazicloud a trusted community.

Best regards,`,
  },
  {
    label: "Important Warning",
    subject: "Action Required: Your Kazicloud Account",
    category: "warning" as const,
    body: `We are writing to bring an urgent matter regarding your account to your attention.

[Replace this with the specific warning or action required]

Please take the necessary action within 48 hours to avoid any disruption to your account.

If you believe this message was sent in error, please contact our support team immediately.

Best regards,`,
  },
];

const ROLE_LABELS: Record<string, string> = {
  job_seeker: "Job Seeker",
  employer: "Employer",
  recruiter: "Recruiter",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ComposeEmailModal({
  isOpen,
  onClose,
  prefillEmail = "",
  prefillName = "",
}: ComposeEmailModalProps) {
  const { user } = useUser();
  const sendToList = useAction(api.emails.bulkSendEmailToList);
  const sendToAll = useAction(api.emails.sendToAllPlatformUsers);

  // ── Recipient chips ────────────────────────────────────────────────────────
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [sendMode, setSendMode] = useState<SendMode>("individual");
  const [chipInput, setChipInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("support");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [sendError, setSendError] = useState("");

  // ── Templates dropdown ─────────────────────────────────────────────────────
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const chipInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  // Pull all user emails for bulk mode count
  const allUserEmails = useQuery(
    api.admin.getAllUserEmails,
    sendMode === "bulk_all" ? {} : "skip"
  );
  const allUsersCount = allUserEmails?.length ?? 0;

  // Sync prefills when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial: Recipient[] = prefillEmail
        ? [{ email: prefillEmail, name: prefillName }]
        : [];
      setRecipients(initial);
      setChipInput("");
      setSendMode("individual");
      setSubject("");
      setBody("");
      setCategory("support");
      setSendSuccess(false);
      setSentCount(0);
      setSendError("");
      setDropdownOpen(false);
      setShowBulkConfirm(false);
    }
  }, [isOpen, prefillEmail, prefillName]);

  // Debounce chip input for search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(chipInput), 300);
    return () => clearTimeout(t);
  }, [chipInput]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (templatesRef.current && !templatesRef.current.contains(e.target as Node)) {
        setTemplatesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Convex user search — skip in bulk mode or if search is too short
  const searchResults = useQuery(
    api.admin.searchUsers,
    sendMode === "individual" && debouncedSearch.length >= 2
      ? { search: debouncedSearch, limit: 8 }
      : "skip"
  ) as UserResult[] | undefined;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isDupe = useCallback(
    (email: string) =>
      recipients.some((r) => r.email.toLowerCase() === email.toLowerCase()),
    [recipients]
  );

  const addRecipient = useCallback(
    (email: string, name = "") => {
      const trimmed = email.trim();
      if (!isValidEmail(trimmed) || isDupe(trimmed)) return;
      setRecipients((prev) => [...prev, { email: trimmed, name }]);
      setChipInput("");
      setDebouncedSearch("");
      setDropdownOpen(false);
    },
    [isDupe]
  );

  const removeRecipient = (email: string) =>
    setRecipients((prev) => prev.filter((r) => r.email !== email));

  const handleChipKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", "Tab"].includes(e.key)) {
      e.preventDefault();
      addRecipient(chipInput);
    } else if (e.key === "Backspace" && chipInput === "" && recipients.length > 0) {
      setRecipients((prev) => prev.slice(0, -1));
    }
  };

  const handleSelectUser = (u: UserResult) => {
    addRecipient(u.email, u.fullName ?? "");
  };

  const handleApplyTemplate = (tpl: (typeof TEMPLATES)[number]) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    setCategory(tpl.category);
    setTemplatesOpen(false);
  };

  const canSend =
    sendMode === "bulk_all"
      ? subject.trim().length > 0 && body.trim().length > 0
      : recipients.length > 0 && subject.trim().length > 0 && body.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    if (sendMode === "bulk_all" && !showBulkConfirm) {
      setShowBulkConfirm(true);
      return;
    }
    setIsSending(true);
    setSendError("");
    try {
      const adminName = user?.fullName || "Kazicloud Team";
      if (sendMode === "bulk_all") {
        const result = await sendToAll({
          subject: subject.trim(),
          body: body.trim(),
          adminName,
          category,
        });
        if (result.success) {
          setSentCount(result.sent);
          setSendSuccess(true);
        } else {
          setSendError("Bulk send failed. Please try again.");
        }
      } else {
        const result = await sendToList({
          recipients,
          subject: subject.trim(),
          body: body.trim(),
          adminName,
          category,
        });
        if (result.success) {
          setSentCount(result.sent);
          setSendSuccess(true);
        } else {
          setSendError("Failed to send. Please try again.");
        }
      }
    } catch {
      setSendError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSending(false);
      setShowBulkConfirm(false);
    }
  };

  const handleClose = () => {
    setSendSuccess(false);
    setSendError("");
    setShowBulkConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-border bg-neutral-bg-secondary/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center">
              <PenLine className="w-4.5 h-4.5 text-brand-orange" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-text leading-tight">
                Compose Email
              </h2>
              <p className="text-xs text-neutral-text-muted">
                Send to one, many, or all platform users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Bulk-all toggle */}
            <button
              type="button"
              onClick={() => {
                setSendMode((m) => m === "bulk_all" ? "individual" : "bulk_all");
                setShowBulkConfirm(false);
              }}
              title={sendMode === "bulk_all" ? "Switch to individual send" : "Broadcast to all users"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                sendMode === "bulk_all"
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-neutral-bg-secondary border-neutral-border text-neutral-text-secondary hover:text-neutral-text"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {sendMode === "bulk_all" ? "Broadcast ON" : "Broadcast"}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-neutral-text-muted hover:text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Success state ──────────────────────────────────────────────────── */}
        {sendSuccess ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center flex-1">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-text mb-2">
              {sentCount > 1 ? `${sentCount} emails sent` : "Email sent successfully"}
            </h3>
            <p className="text-sm text-neutral-text-secondary mb-1">
              {sendMode === "bulk_all"
                ? `Broadcast delivered to ${sentCount} platform users.`
                : sentCount > 1
                ? `Your message was delivered to ${sentCount} recipients.`
                : `Your message was delivered to ${recipients[0]?.email ?? "the recipient"}.`}
            </p>
            <p className="text-xs text-neutral-text-muted mb-8">
              Sent from{" "}
              <span className="font-mono">info@contact.kazicloud.co.ke</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSendSuccess(false);
                  setRecipients([]);
                  setChipInput("");
                  setSubject("");
                  setBody("");
                  setSendMode("individual");
                }}
                className="px-5 py-2.5 border border-neutral-border text-sm font-medium text-neutral-text-secondary rounded-lg hover:bg-neutral-bg-secondary transition-colors"
              >
                Compose another
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Body / Form ──────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {/* Bulk mode banner */}
              {sendMode === "bulk_all" && (
                <div className="flex items-start gap-3 px-6 py-3 bg-amber-50 border-b border-amber-200">
                  <Users className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-semibold">Broadcast mode — </span>
                    this email will be sent to{" "}
                    <span className="font-bold">
                      {allUsersCount > 0 ? allUsersCount : "all"} platform users
                    </span>{" "}
                    (excluding admins). Each recipient gets a personalised email. Use
                    responsibly.
                  </div>
                </div>
              )}

              {/* From row */}
              <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-border/60">
                <span className="text-xs font-semibold text-neutral-text-muted w-14 flex-shrink-0 uppercase tracking-wide">
                  From
                </span>
                <span className="text-sm text-neutral-text-secondary">
                  Kazicloud Info{" "}
                  <span className="text-neutral-text-muted font-mono text-xs">
                    &lt;info@contact.kazicloud.co.ke&gt;
                  </span>
                </span>
              </div>

              {/* To row */}
              <div className="px-6 py-3 border-b border-neutral-border/60">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-neutral-text-muted w-14 flex-shrink-0 uppercase tracking-wide pt-2">
                    To
                  </span>

                  {sendMode === "bulk_all" ? (
                    /* Bulk mode — show "all users" badge */
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full mt-0.5">
                      <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-amber-800">
                        All platform users
                        {allUsersCount > 0 && (
                          <span className="ml-1.5 text-xs font-normal text-amber-600">
                            ({allUsersCount})
                          </span>
                        )}
                      </span>
                    </div>
                  ) : (
                    /* Multi-chip recipient area */
                    <div className="flex-1 min-w-0" ref={dropdownRef}>
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[36px]">
                        {/* Recipient chips */}
                        {recipients.map((r) => (
                          <div
                            key={r.email}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-orange/8 border border-brand-orange/20 rounded-full text-sm"
                          >
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-brand-orange to-orange-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                              {(r.name || r.email).charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-neutral-text max-w-[140px] truncate text-xs">
                              {r.name || r.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeRecipient(r.email)}
                              className="ml-0.5 text-neutral-text-muted hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {/* Chip text input */}
                        <div className="relative flex-1 min-w-[180px]">
                          <div className="flex items-center gap-2">
                            {recipients.length === 0 && (
                              <Search className="w-4 h-4 text-neutral-text-muted flex-shrink-0" />
                            )}
                            <input
                              ref={chipInputRef}
                              type="text"
                              value={chipInput}
                              onChange={(e) => {
                                setChipInput(e.target.value);
                                setDropdownOpen(true);
                              }}
                              onKeyDown={handleChipKeyDown}
                              onFocus={() => {
                                if (chipInput.length >= 2) setDropdownOpen(true);
                              }}
                              placeholder={
                                recipients.length === 0
                                  ? "Search or type an email address…"
                                  : "Add another…"
                              }
                              className="flex-1 text-sm text-neutral-text bg-transparent outline-none placeholder:text-neutral-text-muted"
                              autoComplete="off"
                            />
                            {recipients.length > 0 && (
                              <span className="text-xs text-neutral-text-muted flex-shrink-0">
                                {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>

                          {/* Autocomplete dropdown */}
                          {dropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-border rounded-xl shadow-lg z-10 overflow-hidden min-w-[280px]">
                              {searchResults === undefined && debouncedSearch.length >= 2 ? (
                                <div className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-text-muted">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Searching…
                                </div>
                              ) : searchResults && searchResults.length > 0 ? (
                                <ul>
                                  {searchResults.filter((u) => !isDupe(u.email)).map((u) => (
                                    <li key={u._id}>
                                      <button
                                        type="button"
                                        onClick={() => handleSelectUser(u)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-bg-secondary transition-colors text-left"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                          {(u.fullName || u.email).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium text-neutral-text truncate">
                                            {u.fullName || u.email}
                                          </p>
                                          <p className="text-xs text-neutral-text-muted truncate">
                                            {u.email}
                                            {u.primaryRole && (
                                              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-brand-orange">
                                                {ROLE_LABELS[u.primaryRole] ?? u.primaryRole}
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                        <Plus className="w-4 h-4 text-neutral-text-muted ml-auto flex-shrink-0" />
                                      </button>
                                    </li>
                                  ))}
                                  {isValidEmail(chipInput) && !isDupe(chipInput) && (
                                    <li className="border-t border-neutral-border/60">
                                      <button
                                        type="button"
                                        onClick={() => addRecipient(chipInput)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-bg-secondary transition-colors text-left"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-neutral-bg-secondary border border-neutral-border flex items-center justify-center flex-shrink-0">
                                          <User className="w-4 h-4 text-neutral-text-muted" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-neutral-text">
                                            Use &quot;{chipInput}&quot;
                                          </p>
                                          <p className="text-xs text-neutral-text-muted">
                                            Send to this email directly
                                          </p>
                                        </div>
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              ) : debouncedSearch.length >= 2 ? (
                                <div className="px-4 py-3">
                                  <p className="text-sm text-neutral-text-muted mb-1">
                                    No platform users found for &quot;{debouncedSearch}&quot;
                                  </p>
                                  {isValidEmail(chipInput) && !isDupe(chipInput) && (
                                    <button
                                      type="button"
                                      onClick={() => addRecipient(chipInput)}
                                      className="text-sm text-brand-orange font-medium hover:underline"
                                    >
                                      Send to this address anyway →
                                    </button>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject row */}
              <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-border/60">
                <span className="text-xs font-semibold text-neutral-text-muted w-14 flex-shrink-0 uppercase tracking-wide">
                  Subject
                </span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject…"
                  className="flex-1 text-sm text-neutral-text bg-transparent outline-none placeholder:text-neutral-text-muted font-medium"
                  maxLength={150}
                />
              </div>

              {/* Category + Templates toolbar */}
              <div className="flex items-center gap-3 px-6 py-2.5 border-b border-neutral-border/60 bg-neutral-bg-secondary/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-text-muted uppercase tracking-wide">
                    Type
                  </span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="text-xs font-semibold text-neutral-text bg-white border border-neutral-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-px h-4 bg-neutral-border" />

                <div className="relative" ref={templatesRef}>
                  <button
                    type="button"
                    onClick={() => setTemplatesOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-text-secondary hover:text-neutral-text px-2.5 py-1.5 rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    Templates
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${templatesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {templatesOpen && (
                    <div className="absolute top-full left-0 mt-1.5 bg-white border border-neutral-border rounded-xl shadow-lg z-10 min-w-[240px] overflow-hidden">
                      <p className="px-3 pt-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-text-muted">
                        Quick templates
                      </p>
                      {TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.label}
                          type="button"
                          onClick={() => handleApplyTemplate(tpl)}
                          className="w-full text-left px-3 py-2.5 text-sm text-neutral-text hover:bg-neutral-bg-secondary transition-colors flex items-center gap-2.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4">
                <textarea
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`Write your message here…\n\nTip: Each recipient gets their first name in the greeting automatically.`}
                  className="w-full text-sm text-neutral-text bg-transparent outline-none resize-none placeholder:text-neutral-text-muted leading-relaxed"
                />
              </div>
            </div>

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 border-t border-neutral-border px-6 py-4 bg-neutral-bg-secondary/20">
              {/* Bulk confirm warning */}
              {showBulkConfirm && sendMode === "bulk_all" && (
                <div className="flex items-start gap-2 mb-3 px-3 py-2.5 bg-amber-50 border border-amber-300 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm text-amber-800">
                    <p className="font-semibold mb-0.5">You are about to email all platform users</p>
                    <p className="text-xs">
                      This will send <strong>{allUsersCount > 0 ? allUsersCount : "all"}</strong> emails
                      with subject &ldquo;{subject.slice(0, 60)}{subject.length > 60 ? "…" : ""}&rdquo;. Click
                      &ldquo;Confirm &amp; Send&rdquo; to proceed.
                    </p>
                  </div>
                </div>
              )}

              {sendError && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{sendError}</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs text-neutral-text-muted min-w-0">
                  <span className="truncate">
                    Sending as{" "}
                    <span className="font-semibold text-neutral-text">
                      {user?.fullName || "Admin"}
                    </span>
                  </span>
                  {body.length > 0 && (
                    <span className="flex-shrink-0 text-neutral-text-muted">
                      · {body.length} chars
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm text-neutral-text-secondary hover:text-neutral-text transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isSending || !canSend}
                    className="flex items-center gap-2 px-5 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : showBulkConfirm ? (
                      <>
                        <Radio className="w-4 h-4" />
                        Confirm &amp; Send
                      </>
                    ) : sendMode === "bulk_all" ? (
                      <>
                        <Radio className="w-4 h-4" />
                        Broadcast{allUsersCount > 0 ? ` to ${allUsersCount}` : ""}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {recipients.length > 1 ? `Send to ${recipients.length}` : "Send Email"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
