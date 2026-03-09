"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function SSOCallback() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const createFromSignup = useMutation(api.users.createFromSignup);
  
  // Check if user already has a profile
  const existingUser = useQuery(
    api.users.getUserByClerkId,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isLoaded || isProcessing || !isSignedIn || !user) return;

    const processSignup = async () => {
      setIsProcessing(true);

      try {
        // Get saved signup data
        const savedData = sessionStorage.getItem('pendingSignupData');
        
        // Check if user already exists in our database
        if (existingUser) {
          console.log("Existing user found, redirecting to dashboard");
          sessionStorage.removeItem('pendingSignupData');
          
          const dashboard = existingUser.primaryRole === "employer" 
            ? "/employer-dashboard" 
            : "/dashboard";
          router.push(dashboard);
          return;
        }
        
        if (savedData) {
          const signupData = JSON.parse(savedData);
          console.log("Creating new user profile with saved data:", signupData);
          
          // Create user profile with all collected data
          await createFromSignup({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            roles: signupData.roles,
            fields: signupData.fields || undefined,
            otherFieldDescription: signupData.otherFieldDescription || undefined,
            companyInfo: signupData.companyInfo || undefined,
          });

          // Clear saved data
          sessionStorage.removeItem('pendingSignupData');

          // Redirect based on role
          const isEmployer = signupData.roles.includes("employer");
          const dashboard = isEmployer ? "/employer-onboarding" : "/onboarding";
          router.push(dashboard);
        } else {
          console.log("No saved data, checking for existing profile");
          // No saved data - user might be signing in, not signing up
          // Redirect to dashboard or sign-up to complete profile
          router.push("/sign-up");
        }
      } catch (error) {
        console.error("Profile creation error:", error);
        sessionStorage.removeItem('pendingSignupData');
        // On error, redirect to sign-up to retry
        router.push("/sign-up");
      }
    };

    processSignup();
  }, [isLoaded, isSignedIn, user, existingUser, router, isProcessing, createFromSignup]);

  return (
    <>
      <AuthenticateWithRedirectCallback />
      
      {/* Required for sign-up flows - Clerk's bot protection */}
      <div id="clerk-captcha" />

      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-text-secondary">Completing authentication...</p>
          <p className="text-xs text-neutral-text-muted mt-2">Please wait</p>
        </div>
      </div>
    </>
  );
}
