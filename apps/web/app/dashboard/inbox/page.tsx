"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InboxPanel } from "@/components/inbox-panel";

export default function InboxPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-neutral-text">Inbox</h1>
            <p className="text-sm text-neutral-text-secondary mt-1">
              Messages from employers and Kazicloud support.
            </p>
          </div>
          <div style={{ height: "calc(100vh - 200px)" }}>
            <InboxPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
