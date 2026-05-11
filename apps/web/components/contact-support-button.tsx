"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

interface ContactSupportButtonProps {
  inboxPath: string; // "/dashboard/inbox" or "/employer-dashboard/inbox"
}

export function ContactSupportButton({ inboxPath }: ContactSupportButtonProps) {
  const router = useRouter();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => router.push(inboxPath)}
        aria-label="Open messages"
        className="w-14 h-14 rounded-full bg-brand-orange shadow-lg hover:scale-105 hover:shadow-brand-orange/30 hover:shadow-xl flex items-center justify-center transition-all duration-200"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
