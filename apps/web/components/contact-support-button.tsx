"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface ContactSupportButtonProps {
  inboxPath: string; // "/dashboard/inbox" or "/employer-dashboard/inbox"
}

export function ContactSupportButton({ inboxPath }: ContactSupportButtonProps) {
  const router = useRouter();
  const getOrCreate = useMutation(api.conversations.getOrCreateAdminConversation);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const conversationId = await getOrCreate({});
      router.push(`${inboxPath}?conv=${conversationId}`);
    } catch {
      // Fallback: just open inbox
      router.push(inboxPath);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => void handleClick()}
        disabled={loading}
        aria-label="Contact support"
        className="w-14 h-14 rounded-full bg-brand-orange shadow-lg hover:scale-105 hover:shadow-brand-orange/30 hover:shadow-xl flex items-center justify-center transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
