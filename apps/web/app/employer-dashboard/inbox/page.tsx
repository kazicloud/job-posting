"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { InboxPanel } from "@/components/inbox-panel";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EmployerInboxContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");

  return (
    <EmployerDashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-neutral-text">Inbox</h1>
            <p className="text-sm text-neutral-text-secondary mt-1">
              Conversations with candidates and Kazicloud support.
            </p>
          </div>
          <div style={{ height: "calc(100vh - 200px)" }}>
            <InboxPanel initialConversationId={conversationId} />
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}

export default function EmployerInboxPage() {
  return (
    <Suspense>
      <EmployerInboxContent />
    </Suspense>
  );
}
