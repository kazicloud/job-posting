"use client";

import { ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useEffect } from "react";
import AdminLayout from "../../components/admin-layout";
import { Shield } from "lucide-react";

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const isAdmin = useQuery(api.admin.isAdmin);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn || isAdmin === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-neutral-border p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-text mb-2">Access Denied</h1>
          <p className="text-neutral-text-secondary mb-6">
            You don&apos;t have permission to access the admin panel. Please contact an administrator if you believe this is an error.
          </p>
          
          <button
            onClick={() => router.push("/sign-in")}
            className="px-6 py-2.5 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
