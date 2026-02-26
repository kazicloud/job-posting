"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // Get user role and redirect to appropriate dashboard
      fetch("/api/user-role")
        .then(res => res.json())
        .then(data => {
          const dashboard = data.primaryRole === "employer" 
            ? "/employer-dashboard" 
            : "/dashboard";
          router.push(dashboard);
        })
        .catch(() => {
          // Default to job seeker dashboard on error
          router.push("/dashboard");
        });
    } else {
      // If not signed in after 3 seconds, redirect to sign-in
      setTimeout(() => {
        if (!isSignedIn) {
          router.push("/sign-in");
        }
      }, 3000);
    }
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-text-secondary">Completing sign in...</p>
      </div>
    </div>
  );
}
