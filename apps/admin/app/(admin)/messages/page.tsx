"use client";

import { useQuery, useMutation, useAction, usePaginatedQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Mail,
  Search,
  Send,
  Archive,
  Reply,
  Clock,
  CheckCircle2,
  Inbox,
  X,
  MessageSquare,
  PenLine,
  Loader2,
  CornerDownRight,
} from "lucide-react";
import { ComposeEmailModal } from "../../../components/compose-email-modal";
import { AdminInboxPanel } from "../../../components/admin-inbox";

type StatusFilter = "all" | "unread" | "read" | "replied" | "archived";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  unread: { label: "Unread", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  read: { label: "Read", color: "text-neutral-text-secondary", bg: "bg-neutral-bg-secondary border-neutral-border" },
  replied: { label: "Replied", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  archived: { label: "Archived", color: "text-neutral-text-muted", bg: "bg-gray-100 border-gray-200" },
};

const SUBJECT_COLORS: Record<string, string> = {
  "General Inquiry": "bg-purple-50 text-purple-700 border-purple-200",
  "Technical Support": "bg-blue-50 text-blue-700 border-blue-200",
  "Billing Question": "bg-amber-50 text-amber-700 border-amber-200",
  "Partnership Opportunity": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Feedback: "bg-orange-50 text-orange-700 border-orange-200",
};

const BADGE_COLORS: Record<string, string> = {
  all: "bg-neutral-200 text-neutral-700",
  unread: "bg-blue-500 text-white",
  read: "bg-neutral-200 text-neutral-600",
  replied: "bg-green-500 text-white",
  archived: "bg-gray-300 text-gray-600",
};

function formatDate(ts: number) {
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)
    return date.toLocaleDateString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatFullDate(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ThreadEvent {
  type: "user" | "admin";
  text: string;
  authorName: string;
  timestamp: number;
  subject?: string;
  isFirstInThread?: boolean;
}

function buildThreadEvents(thread: Array<{
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: number;
  adminReply?: string;
  repliedAt?: number;
  repliedBy?: string;
  replies?: Array<{ role: "admin" | "user"; text: string; authorName: string; timestamp: number }>;
}>): ThreadEvent[] {
  const events: ThreadEvent[] = [];
  thread.forEach((msg, msgIndex) => {
    events.push({
      type: "user",
      text: msg.message,
      authorName: msg.name,
      timestamp: msg.createdAt,
      subject: msg.subject,
      isFirstInThread: msgIndex === 0,
    });
    const replies = msg.replies ?? [];
    if (replies.length === 0 && msg.adminReply) {
      // Legacy single reply — synthesise
      events.push({
        type: "admin",
        text: msg.adminReply,
        authorName: msg.repliedBy ?? "Admin",
        timestamp: msg.repliedAt ?? msg.createdAt,
      });
    } else {
      replies.forEach((r) => {
        events.push({
          type: r.role === "admin" ? "admin" : "user",
          text: r.text,
          authorName: r.authorName,
          timestamp: r.timestamp,
        });
      });
    }
  });
  return events;
}

function isSameDay(a: number, b: number) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

export default function MessagesPage() {
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<Id<"contactMessages"> | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debounce search input (300 ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Cursor-paginated list — 15 per page
  const {
    results: pagedMessages,
    status: paginatedStatus,
    loadMore,
  } = usePaginatedQuery(
    api.contactMessages.listPaginated,
    { status: statusFilter },
    { initialNumItems: 15 }
  );

  // Search across all messages (fires only when query is set)
  const isSearching = debouncedSearch.trim().length > 0;
  const searchResults = useQuery(
    api.contactMessages.search,
    isSearching ? { query: debouncedSearch.trim(), status: statusFilter } : "skip"
  );

  // Full message detail — only fetched when a message is selected
  const selected = useQuery(
    api.contactMessages.getById,
    selectedId ? { id: selectedId } : "skip"
  );

  // Full conversation thread for the selected email
  const thread = useQuery(
    api.contactMessages.getThreadByEmail,
    selectedEmail ? { email: selectedEmail } : "skip"
  );

  // Per-tab counts for badges (independent of pagination)
  const counts = useQuery(api.contactMessages.statusCounts, {});
  const unreadCount = counts?.unread ?? 0;

  const markRead = useMutation(api.contactMessages.markRead);
  const updateStatus = useMutation(api.contactMessages.updateStatus);
  const saveReply = useMutation(api.contactMessages.saveReply);
  const sendReply = useAction(api.emails.replyToContactMessage);

  // Infinite scroll: load next page when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && paginatedStatus === "CanLoadMore" && !isSearching) {
          loadMore(15);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [paginatedStatus, loadMore, isSearching]);

  // Scroll to bottom of thread whenever thread updates
  useEffect(() => {
    if (thread && thread.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread]);

  const displayList = isSearching ? (searchResults ?? []) : pagedMessages;
  const listLoading = paginatedStatus === "LoadingFirstPage";

  const handleSelect = async (id: Id<"contactMessages">) => {
    setSelectedId(id);
    setReplyText("");
    setReplySuccess(false);
    setShowReplyBox(false);
    const msg = pagedMessages.find((m) => m._id === id) ?? searchResults?.find((m) => m._id === id);
    if (msg?.email) setSelectedEmail(msg.email);
    if (msg?.status === "unread") {
      await markRead({ id }).catch(() => {});
    }
  };

  const handleArchive = async (id: Id<"contactMessages">) => {
    await updateStatus({ id, status: "archived" }).catch(() => {});
    if (selectedId === id) setSelectedId(null);
  };

  const handleSendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setIsSending(true);
    try {
      // ── Determine thread context ─────────────────────────────────────────
      const events = thread ? buildThreadEvents(thread as any[]) : [];
      const adminEvents = events.filter((e) => e.type === "admin");
      const lastEvent = events[events.length - 1];

      // Which kind of reply is this?
      let replyType: "first_reply" | "admin_followup" | "reply_to_user_reply";
      if (adminEvents.length === 0) {
        replyType = "first_reply";
      } else if (lastEvent?.type === "admin") {
        replyType = "admin_followup";
      } else {
        replyType = "reply_to_user_reply";
      }

      // Quote the specific message being replied to (not always the original)
      const messageBeingRepliedTo = lastEvent?.text ?? selected.message;
      const messageBeingRepliedToAuthor = lastEvent?.authorName ?? selected.name;

      // Collect all SMTP Message-IDs from admin replies for threading headers
      const allEmailMessageIds: string[] = [];
      (thread as any[] | undefined)?.forEach((msg: any) => {
        (msg.replies ?? []).forEach((r: any) => {
          if (r.emailMessageId) allEmailMessageIds.push(r.emailMessageId as string);
        });
      });
      const previousEmailMessageId =
        allEmailMessageIds.length > 0
          ? allEmailMessageIds[allEmailMessageIds.length - 1]
          : undefined;

      // ── Send email and save to DB ────────────────────────────────────────
      const emailResult = await sendReply({
        toEmail: selected.email,
        toName: selected.name,
        subject: selected.subject,
        replyText: replyText.trim(),
        adminName: user?.fullName || "Kazicloud Team",
        replyType,
        messageBeingRepliedTo,
        messageBeingRepliedToAuthor,
        previousEmailMessageId,
        allEmailMessageIds,
      });
      await saveReply({
        id: selected._id,
        adminReply: replyText.trim(),
        adminName: user?.fullName || "Kazicloud Team",
        emailMessageId: emailResult?.emailMessageId ?? undefined,
      });
      setReplySuccess(true);
      setShowReplyBox(false);
      setReplyText("");
    } catch {
      alert("Failed to send reply. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const TABS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
    { key: "replied", label: "Replied" },
    { key: "archived", label: "Archived" },
  ];

  const adminInitial = (user?.firstName?.charAt(0) ?? user?.fullName?.charAt(0) ?? "A").toUpperCase();

  const [sourceTab, setSourceTab] = useState<"website" | "inapp">("website");
  const unreadChats = useQuery(api.conversations.totalUnreadCount) ?? 0;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-text">Messages</h2>
          <p className="text-neutral-text-secondary text-sm mt-1">
            All communications — website enquiries and in-app chats
          </p>
        </div>
        <div className="flex items-center gap-3">
          {sourceTab === "website" && unreadCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">
                {unreadCount} unread
              </span>
            </div>
          )}
          {sourceTab === "website" && (
            <button
              onClick={() => setComposeOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors shadow-sm"
            >
              <PenLine className="w-4 h-4" />
              Compose
            </button>
          )}
        </div>
      </div>

      {/* Source tabs */}
      <div className="flex gap-1 mb-4 border-b border-neutral-border">
        <button
          onClick={() => setSourceTab("website")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            sourceTab === "website"
              ? "border-brand-orange text-brand-orange"
              : "border-transparent text-neutral-text-muted hover:text-neutral-text"
          }`}
        >
          <Mail className="w-4 h-4" />
          Website
          {(counts?.unread ?? 0) > 0 && sourceTab !== "website" && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full">
              {counts!.unread}
            </span>
          )}
        </button>
        <button
          onClick={() => setSourceTab("inapp")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            sourceTab === "inapp"
              ? "border-brand-orange text-brand-orange"
              : "border-transparent text-neutral-text-muted hover:text-neutral-text"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          In-App Chats
          {unreadChats > 0 && sourceTab !== "inapp" && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-brand-orange text-white rounded-full">
              {unreadChats}
            </span>
          )}
        </button>
      </div>

      <ComposeEmailModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />

      {sourceTab === "inapp" ? (
        <div style={{ height: "calc(100vh - 240px)" }}>
          <AdminInboxPanel />
        </div>
      ) : (
      <div className="bg-white border border-neutral-border rounded-xl overflow-hidden flex h-[calc(100vh-240px)] min-h-[560px]">
        {/* ── Left Panel: message list ──────────────────────────────────────── */}
        <div className="w-full max-w-[340px] border-r border-neutral-border flex flex-col flex-shrink-0">
          {/* Search */}
          <div className="p-3 border-b border-neutral-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted" />
              <input
                type="search"
                placeholder="Search all messages…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
              {isSearching && searchResults === undefined && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted animate-spin" />
              )}
            </div>
          </div>

          {/* Status Tabs with count badges */}
          <div className="flex overflow-x-auto border-b border-neutral-border px-2 pt-1 gap-0.5">
            {TABS.map((tab) => {
              const count = counts?.[tab.key] ?? 0;
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setStatusFilter(tab.key); setSelectedId(null); setSelectedEmail(null); }}
                  className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-t whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "border-brand-orange text-brand-orange"
                      : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full leading-none ${
                        isActive ? "bg-brand-orange text-white" : BADGE_COLORS[tab.key]
                      }`}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-border">
            {listLoading ? (
              <div className="space-y-px">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-0.5">
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-2/5" />
                          <div className="h-3 bg-gray-100 rounded w-1/5" />
                        </div>
                        <div className="h-3 bg-gray-100 rounded w-3/5" />
                        <div className="h-3 bg-gray-100 rounded w-4/5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <Inbox className="w-12 h-12 text-neutral-text-muted mb-3" />
                <p className="text-sm font-medium text-neutral-text">No messages</p>
                <p className="text-xs text-neutral-text-muted mt-1">
                  {isSearching ? "No results for that search" : "No messages in this category yet"}
                </p>
              </div>
            ) : (
              <>
                {displayList.map((msg) => (
                  <button
                    key={msg._id}
                    onClick={() => handleSelect(msg._id)}
                    className={`w-full text-left p-4 hover:bg-neutral-bg-secondary/70 transition-colors relative ${
                      selectedId === msg._id
                        ? "bg-brand-orange/5 border-l-[3px] border-l-brand-orange"
                        : "border-l-[3px] border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${
                          msg.status === "unread"
                            ? "bg-gradient-to-br from-brand-orange to-orange-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}
                      >
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span
                            className={`text-sm font-semibold truncate ${
                              msg.status === "unread" ? "text-neutral-text" : "text-neutral-text-secondary"
                            }`}
                          >
                            {msg.name}
                          </span>
                          <span className="text-[11px] text-neutral-text-muted flex-shrink-0">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-text-muted truncate mb-1">{msg.email}</p>
                        <div className="flex items-center gap-1.5">
                          {msg.status === "unread" && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-px" />
                          )}
                          {msg.status === "replied" && (
                            <CornerDownRight className="w-3 h-3 text-green-500 flex-shrink-0" />
                          )}
                          <p
                            className={`text-xs truncate ${
                              msg.status === "unread"
                                ? "font-semibold text-neutral-text"
                                : "text-neutral-text-muted"
                            }`}
                          >
                            {msg.subject}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Infinite scroll sentinel */}
                {!isSearching && (
                  <div ref={sentinelRef} className="py-3 flex items-center justify-center">
                    {paginatedStatus === "LoadingMore" && (
                      <Loader2 className="w-4 h-4 text-neutral-text-muted animate-spin" />
                    )}
                    {paginatedStatus === "Exhausted" && displayList.length > 0 && (
                      <span className="text-[11px] text-neutral-text-muted">All messages loaded</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Right Panel: message detail ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fb]">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 bg-white border border-neutral-border rounded-full flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare className="w-7 h-7 text-neutral-text-muted" />
              </div>
              <h3 className="text-base font-semibold text-neutral-text mb-1">Select a message</h3>
              <p className="text-sm text-neutral-text-secondary">
                Choose a message from the list to read and respond
              </p>
            </div>
          ) : selected === undefined ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-neutral-text-muted animate-spin" />
            </div>
          ) : selected === null ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <p className="text-sm text-neutral-text-muted">Message not found.</p>
            </div>
          ) : (
            <>
              {/* ── Conversation Header ─────────────────────────────── */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    {selected.status === "unread" && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-text text-sm leading-tight">{selected.name}</p>
                    <p className="text-xs text-neutral-text-muted truncate">{selected.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      SUBJECT_COLORS[selected.subject] || "bg-gray-50 text-neutral-text border-neutral-border"
                    }`}
                  >
                    {selected.subject}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_LABELS[selected.status]?.bg}`}
                  >
                    <span className={STATUS_LABELS[selected.status]?.color}>
                      {STATUS_LABELS[selected.status]?.label}
                    </span>
                  </span>
                  {selected.status !== "archived" && (
                    <button
                      onClick={() => handleArchive(selected._id)}
                      title="Archive"
                      className="p-2 rounded-lg text-neutral-text-muted hover:text-neutral-text hover:bg-neutral-100 transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Message Thread ──────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-5 py-6">
                {thread === undefined ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-text-muted" />
                  </div>
                ) : (() => {
                  const events = buildThreadEvents(thread as any[]);
                  return (
                    <>
                      {events.map((event, i) => {
                        const prevTs = i > 0 ? events[i - 1]!.timestamp : null;
                        const showDivider = !prevTs || !isSameDay(prevTs, event.timestamp);
                        const isAdmin = event.type === "admin";
                        return (
                          <div key={i}>
                            {/* Date divider */}
                            {showDivider && (
                              <div className="flex items-center gap-3 my-5">
                                <div className="h-px bg-neutral-200 flex-1" />
                                <span className="text-[11px] text-neutral-text-muted px-1 whitespace-nowrap flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatFullDate(event.timestamp)}
                                </span>
                                <div className="h-px bg-neutral-200 flex-1" />
                              </div>
                            )}

                            {/* Subject pill — only for the very first user message */}
                            {event.isFirstInThread && event.type === "user" && event.subject && (
                              <div className="flex justify-center mb-4">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                    SUBJECT_COLORS[event.subject] || "bg-gray-50 text-neutral-text border-neutral-border"
                                  }`}
                                >
                                  {event.subject}
                                </span>
                              </div>
                            )}

                            {/* Bubble */}
                            <div className={`flex items-end gap-2.5 mb-4 ${ isAdmin ? "flex-row-reverse" : "" }`}>
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm mb-0.5 ${
                                  isAdmin
                                    ? "bg-neutral-800"
                                    : "bg-gradient-to-br from-brand-orange to-orange-600"
                                }`}
                              >
                                {event.authorName.charAt(0).toUpperCase()}
                              </div>
                              <div className="max-w-[72%]">
                                <div className={`flex items-center gap-2 mb-1.5 ${ isAdmin ? "pr-1 flex-row-reverse" : "pl-1" }`}>
                                  <span className="text-xs font-semibold text-neutral-text truncate max-w-[120px]">
                                    {event.authorName}
                                  </span>
                                  <span className="text-[11px] text-neutral-text-muted flex-shrink-0">
                                    {formatDate(event.timestamp)}
                                  </span>
                                </div>
                                {isAdmin ? (
                                  <>
                                    <div className="bg-brand-orange rounded-2xl rounded-br-sm px-4 py-3 shadow-[0_1px_4px_rgba(220,132,44,0.25)]">
                                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                                        {event.text}
                                      </p>
                                    </div>
                                    <div className="flex items-center justify-end gap-1 mt-1.5 pr-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                      <span className="text-[11px] text-neutral-text-muted">Sent via email</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-neutral-200">
                                    <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                                      {event.text}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Reply success notice (optimistic, before DB refresh) */}
                      {replySuccess && (
                        <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl mb-4">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-green-800 font-medium">
                            Reply sent to {selected?.email}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Reply Composer ───────────────────────────────────── */}
              <div className="border-t border-neutral-border bg-white px-5 py-4">
                {!showReplyBox ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowReplyBox(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors shadow-sm"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                    {selected.status !== "archived" && selected.status !== "replied" && (
                      <button
                        onClick={() => handleArchive(selected._id)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-neutral-border text-neutral-text-secondary text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    )}
                    {selected.status === "replied" && (
                      <p className="text-xs text-neutral-text-muted ml-1">
                        Already replied — you can send another reply if needed.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-white text-[10px] font-bold">
                          {adminInitial}
                        </div>
                        <span className="text-xs font-semibold text-neutral-text">
                          Replying to{" "}
                          <span className="text-brand-orange">{selected.name}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => { setShowReplyBox(false); setReplyText(""); }}
                        className="p-1 rounded text-neutral-text-muted hover:text-neutral-text hover:bg-neutral-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="border border-neutral-border rounded-xl overflow-hidden focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/15 transition-all bg-white">
                      <textarea
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Write your reply to ${selected.name}…`}
                        className="w-full px-4 pt-3 pb-2 text-sm focus:outline-none resize-none leading-relaxed"
                      />
                      <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-neutral-100">
                        <p className="text-[11px] text-neutral-text-muted">
                          From{" "}
                          <span className="font-medium text-neutral-text-secondary">
                            info@contact.kazicloud.co.ke
                          </span>{" "}
                          · as {user?.fullName || "Admin"}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setShowReplyBox(false); setReplyText(""); }}
                            className="px-3 py-1.5 text-xs text-neutral-text-secondary hover:text-neutral-text transition-colors font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSendReply}
                            disabled={isSending || !replyText.trim()}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-orange text-white text-xs font-semibold rounded-full hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            {isSending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            {isSending ? "Sending…" : "Send Reply"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

