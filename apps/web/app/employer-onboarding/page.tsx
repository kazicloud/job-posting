"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { EmployerOnboardingWizard } from "@/components/onboarding/employer-wizard";

export default function EmployerOnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const [userId, setUserId] = useState<string | null>(null);
  const [signupData, setSignupData] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    // Get signup data from sessionStorage
    const data = sessionStorage.getItem("signupData");
    if (data) {
      setSignupData(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (profile) {
      // Check if already completed onboarding
      if (profile.onboardingCompleted) {
        router.push("/employer-dashboard");
        return;
      }
      setUserId(profile._id);
    }
  }, [profile, router]);

  const handleComplete = () => {
    sessionStorage.removeItem("signupData");
    router.push("/employer-dashboard");
  };

  if (!isLoaded || !user || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary">
        <div className="text-neutral-text">Loading...</div>
      </div>
    );
  }

  return <EmployerOnboardingWizard userId={userId} signupData={signupData} onComplete={handleComplete} />;
}
