"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary px-4">
      <div className="text-center max-w-md">
        <ShieldAlert className="w-20 h-20 mx-auto mb-6 text-red-500" />
        <h1 className="text-3xl font-semibold text-neutral-text mb-3">Access Denied</h1>
        <p className="text-neutral-text-secondary mb-8">
          You don't have permission to access this page. Please sign in with the appropriate account.
        </p>
        <div className="flex items-center gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-neutral-text text-white font-medium rounded-md hover:bg-neutral-text/90"
          >
            Job Seeker Dashboard
          </Link>
          <Link
            href="/employer-dashboard"
            className="px-6 py-3 border border-neutral-border text-neutral-text font-medium rounded-md hover:bg-neutral-bg-secondary"
          >
            Employer Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
