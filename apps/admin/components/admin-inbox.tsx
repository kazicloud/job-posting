"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageSquare, ArrowLeft, Shield, Briefcase, User } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function dayLabel(ts: number): string {
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (isSameDay(ts, now.getTime())) return "Today";
  if (isSameDay(ts, yesterday.getTime())) return "Yesterday";
  return new Date(ts).toLocaleDateString("en-KE", { weekday: "long", month: "short", day: "numeric" });
}

function RoleChip({ role }: { role: string }) {
  if (role === "employer") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
      <Briefcase className="w-2.5 h-2.5" /> Employer
    </span>
  );
  if (role === "job_seeker") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">
      <User className="w-2.5 h-2.5" /> Job Seeker
    </span>
  );
  return null;
}

function Avatar({ name, photo, size = "md" }: { name: string; photo?: string | null; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  if (photo) return <img src={photo} alt={name} className={`${cls} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${cls} rounded-full bg-brand-orange/10 text-brand-orange font-semibold flex items-center justify-center shrink-0`}>
      {initials || "?"}
    </div>
  );
}

// ── Chat Window ───────────────────────────────────────────────────────────────

function AdminChatWindow({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const data = useQuery(api.conversations.getMessages, {
    conversationId: conversationId as Id<"conversations">,
  });
  const sendMessage = useMutation(api.conversations.sendMessage);
  const markRead = useMutation(api.conversations.markConversationRead);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length]);

  useEffect(() => {
    if (conversationId) {
      void markRead({ conversationId: conversationId as Id<"conversations"> });
    }
  }, [conversationId, data?.messages?.length]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    try {
      await sendMessage({ conversationId: conversationId as Id<"conversations">, text: trimmed });
    } catch (err) {
      setText(trimmed);
      console.error(err);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [text, sending, conversationId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  if (!data) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { conversation: conv, messages } = data;

  let lastDay: number | null = null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-neutral-border bg-white shrink-0">
        <button onClick={onBack} className="lg:hidden p-1.5 hover:bg-neutral-hover rounded-md">
          <ArrowLeft className="w-4 h-4 text-neutral-text-secondary" />
        </button>
        {conv.jobTitle && (
          <p className="text-xs text-neutral-text-muted">Re: {conv.jobTitle} · {conv.companyName}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-neutral-bg-secondary">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <MessageSquare className="w-8 h-8 text-neutral-text-muted" />
            <p className="text-sm text-neutral-text-secondary">No messages yet.</p>
          </div>
        )}
        {messages.map((msg) => {
          const showDay = lastDay === null || !isSameDay(lastDay, msg.createdAt);
          if (showDay) lastDay = msg.createdAt;
          return (
            <div key={msg._id}>
              {showDay && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-neutral-border" />
                  <span className="text-[11px] text-neutral-text-muted font-medium">{dayLabel(msg.createdAt)}</span>
                  <div className="flex-1 h-px bg-neutral-border" />
                </div>
              )}
              <div className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : "flex-row"} items-end`}>
                {!msg.isMe && <Avatar name={msg.senderName} photo={msg.senderPhoto} size="sm" />}
                <div className={`max-w-[75%] flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                  {!msg.isMe && (
                    <span className="text-[11px] text-neutral-text-muted font-medium mb-0.5 px-1">{msg.senderName}</span>
                  )}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.isMe
                      ? "bg-brand-orange text-white rounded-br-sm"
                      : "bg-white text-neutral-text border border-neutral-border rounded-bl-sm shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-neutral-text-muted mt-1 px-1">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-border bg-white px-4 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply as admin… (Enter to send)"
            rows={1}
            className="flex-1 resize-none overflow-hidden bg-neutral-bg-secondary border border-neutral-border rounded-xl px-4 py-2.5 text-sm text-neutral-text placeholder:text-neutral-text-muted focus:outline-none focus:border-brand-orange/50 focus:bg-white transition-colors"
            style={{ maxHeight: 120 }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!text.trim() || sending}
            className="p-2.5 bg-brand-orange text-white rounded-xl hover:bg-brand-orange/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Inbox Panel ─────────────────────────────────────────────────────────

export function AdminInboxPanel({ initialConversationId }: { initialConversationId?: string | null }) {
  // Use listAllSupportConversations so ALL admins see ALL support threads,
  // not just the ones where they're individually assigned as participantB.
  const conversations = useQuery(api.conversations.listAllSupportConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null);
  const [mobileShowChat, setMobileShowChat] = useState(!!initialConversationId);

  const handleSelect = (id: string) => { setSelectedId(id); setMobileShowChat(true); };
  const handleBack = () => setMobileShowChat(false);

  const isLoading = conversations === undefined;

  return (
    <div className="flex h-full bg-white rounded-xl border border-neutral-border overflow-hidden shadow-sm">
      {/* Left panel */}
      <div className={`${mobileShowChat ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-80 xl:w-96 border-r border-neutral-border shrink-0`}>
        <div className="px-4 py-3.5 border-b border-neutral-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-text">Support Chats</h2>
          {conversations && conversations.length > 0 && (
            <span className="text-xs text-neutral-text-muted">{conversations.length} thread{conversations.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-0 divide-y divide-neutral-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-neutral-border shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-border rounded w-2/3" />
                    <div className="h-2.5 bg-neutral-border rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <ul className="divide-y divide-neutral-border">
              {conversations.map((conv) => {
                const name = conv.otherUser?.fullName ?? "Unknown";
                const isSelected = conv._id === selectedId;
                return (
                  <li key={conv._id}>
                    <button
                      onClick={() => handleSelect(conv._id)}
                      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-hover ${isSelected ? "bg-brand-orange/5 border-r-2 border-brand-orange" : ""}`}
                    >
                      <div className="relative">
                        <Avatar name={name} photo={conv.otherUser?.profilePhoto} />
                        {conv.myUnread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {conv.myUnread > 9 ? "9+" : conv.myUnread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-sm truncate ${conv.myUnread > 0 ? "font-semibold text-neutral-text" : "font-medium text-neutral-text"}`}>
                            {name}
                          </span>
                          <span className="text-[11px] text-neutral-text-muted shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <RoleChip role={conv.otherUser?.primaryRole ?? ""} />
                          {conv.assignedAdmin && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">
                              <Shield className="w-2.5 h-2.5" /> {conv.assignedAdmin.fullName}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${conv.myUnread > 0 ? "text-neutral-text font-medium" : "text-neutral-text-muted"}`}>
                          {conv.lastMessagePreview || "No messages yet"}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center py-16">
              <MessageSquare className="w-10 h-10 text-neutral-text-muted" />
              <p className="text-sm text-neutral-text-secondary font-medium">No support conversations yet</p>
              <p className="text-xs text-neutral-text-muted">Users who contact support will appear here for all admins.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className={`${mobileShowChat ? "flex" : "hidden lg:flex"} flex-col flex-1 min-w-0`}>
        {selectedId ? (
          <AdminChatWindow key={selectedId} conversationId={selectedId} onBack={handleBack} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <MessageSquare className="w-12 h-12 text-neutral-text-muted" />
            <p className="text-sm font-medium text-neutral-text-secondary">Select a conversation</p>
            <p className="text-xs text-neutral-text-muted">Click a conversation on the left to open it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
