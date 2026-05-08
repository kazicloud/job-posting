"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { MessageCircle, X, HeadphonesIcon, Loader2 } from "lucide-react";

interface ContactSupportButtonProps {
  inboxPath: string; // "/dashboard/inbox" or "/employer-dashboard/inbox"
}

export function ContactSupportButton({ inboxPath }: ContactSupportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const getOrCreate = useMutation(api.conversations.getOrCreateAdminConversation);
  const router = useRouter();

  const handleContactSupport = useCallback(async () => {
    setLoading(true);
    try {
      const convId = await getOrCreate();
      router.push(`${inboxPath}?c=${convId}`);
      setOpen(false);
    } catch {
      // If admin not found etc, just go to inbox
      router.push(inboxPath);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [getOrCreate, inboxPath, router]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popover card */}
      {open && (
        <div className="w-72 bg-white rounded-2xl shadow-2xl border border-neutral-border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-brand-orange px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <HeadphonesIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Kazicloud Support</p>
                  <p className="text-[11px] text-white/75">We typically reply within a few hours</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <p className="text-sm text-neutral-text leading-relaxed mb-4">
              Have a question or need help? Our team is here for you — reach out and we'll get back to you promptly.
            </p>
            <button
              onClick={handleContactSupport}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-orange text-white text-sm font-semibold rounded-xl hover:bg-brand-orange/90 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              {loading ? "Opening…" : "Send us a message"}
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Contact support"
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? "bg-neutral-text rotate-90 scale-95"
            : "bg-brand-orange hover:scale-105 hover:shadow-brand-orange/30 hover:shadow-xl"
        }`}
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
