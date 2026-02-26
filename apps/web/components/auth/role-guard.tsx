"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export function RoleGuard({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode; 
  allowedRole: "job_seeker" | "employer" | "recruiter";
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const profile = useQuery(api.profile.getCurrentUserProfile);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    if (profile && profile.primaryRole !== allowedRole) {
      // Redirect to correct dashboard
      const correctDashboard = profile.primaryRole === "employer" 
        ? "/employer-dashboard" 
        : "/dashboard";
      
      if (pathname !== correctDashboard) {
        router.push(correctDashboard);
      }
    }
  }, [isLoaded, user, profile, allowedRole, router, pathname]);

  // Show loading state - but let children render with their own loading states
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary">
        <div className="text-neutral-text">Loading...</div>
      </div>
    );
  }

  // If profile is still loading but user is authenticated, render children
  // (they have their own loading states)
  if (!profile) {
    return <>{children}</>;
  }

  // Show access denied if wrong role
  if (profile.primaryRole !== allowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-semibold text-neutral-text mb-2">Access Denied</h1>
          <p className="text-neutral-text-secondary mb-6">
            You don't have permission to access this page. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
