"use client";

import { AdminInboxPanel } from "@/components/admin-inbox";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AdminChatsContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-neutral-text">In-App Chats</h1>
        <p className="text-sm text-neutral-text-secondary mt-1">
          Real-time messages from job seekers and employers via the platform.
        </p>
      </div>
      <div style={{ height: "calc(100vh - 196px)" }}>
        <AdminInboxPanel initialConversationId={conversationId} />
      </div>
    </div>
  );
}

export default function AdminChatsPage() {
  return (
    <Suspense>
      <AdminChatsContent />
    </Suspense>
  );
}
