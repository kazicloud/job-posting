"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { BasicInfoStep } from "@/components/onboarding/basic-info-step";
import { StatusStep } from "@/components/onboarding/status-step";
import { SkillsStep } from "@/components/onboarding/skills-step";
import { PreferencesStep } from "@/components/onboarding/preferences-step";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const saveProgress = useMutation(api.onboarding.saveOnboardingProgress);
  const completeOnboardingMutation = useMutation(api.onboarding.completeOnboarding);
  
  // Get user from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Load saved progress
  const savedProgress = useQuery(
    api.onboarding.getOnboardingProgress,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const [formData, setFormData] = useState<any>({
    basicInfo: {
      fullName: "",
    },
  });

  // Check if onboarding is already completed (only after data is loaded)
  useEffect(() => {
    if (isLoaded && convexUser && convexUser.onboardingCompleted === true) {
      router.push("/dashboard");
    }
  }, [isLoaded, convexUser, router]);

  // Pre-fill full name from Clerk user data
  useEffect(() => {
    if (isLoaded && user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (fullName) {
        setFormData((prev: any) => ({
          ...prev,
          basicInfo: {
            ...prev.basicInfo,
            fullName,
          },
        }));
      }
    }
  }, [user, isLoaded]);

  // Load saved progress when available
  useEffect(() => {
    if (savedProgress?.data) {
      setFormData(savedProgress.data);
    }
  }, [savedProgress]);

  const handleStepData = async (stepKey: string, data: any) => {
    const updated = { ...formData, [stepKey]: data };
    
    // If CV was parsed in Step 1, pre-fill other steps and carry CV to Step 2
    if (data._parsedCV && stepKey === 'basicInfo') {
      const cv = data._parsedCV;
      
      // Carry the CV storage ID to Step 2
      if (data._cvStorageId) {
        updated.status = {
          ...(updated.status || {}),
          _cvStorageId: data._cvStorageId,
          _cvFileName: data._cvFileName,
        };
      }
      
      // Pre-fill status step
      if (cv.currentStatus || cv.yearsOfExperience) {
        updated.status = {
          ...(updated.status || {}),
          currentStatus: cv.currentStatus || undefined,
          yearsOfExperience: cv.yearsOfExperience || undefined,
        };
      }
      
      // Pre-fill skills step
      if (cv.skills && cv.skills.length > 0) {
        updated.skills = {
          skills: cv.skills,
        };
      }
      
      // Store work experience, education, certifications, languages for later use
      updated._cvExtras = {
        workExperience: cv.workExperience || [],
        education: cv.education || [],
        certifications: cv.certifications || [],
        languages: cv.languages || [],
      };
    }
    
    setFormData(updated);

    // Auto-save progress to Convex
    if (convexUser?._id) {
      const stepNumber = {
        basicInfo: 1,
        status: 2,
        skills: 3,
        preferences: 4,
      }[stepKey] || 1;

      try {
        await saveProgress({
          userId: convexUser._id,
          step: stepNumber,
          data: updated,
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }
  };

  const handleComplete = async () => {
    console.log("Onboarding data:", formData);
    
    if (convexUser?._id) {
      try {
        await completeOnboardingMutation({
          userId: convexUser._id,
          data: formData,
        });
        
        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
      }
    }
  };

  // Show loading state while checking (after all hooks)
  if (!isLoaded || (convexUser === undefined && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-secondary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      title: "Let's start with the basics",
      description: "Tell us a bit about yourself so employers can find you",
      component: (
        <BasicInfoStep
          onDataChange={(data) => handleStepData("basicInfo", data)}
          initialData={formData.basicInfo}
        />
      ),
      validate: () => {
        const { fullName, phone, county, desiredJobTitle, headline } = formData.basicInfo || {};
        if (!fullName?.trim()) return { isValid: false, error: "Full name is required" };
        if (!phone?.trim()) return { isValid: false, error: "Phone number is required" };
        if (!county?.trim()) return { isValid: false, error: "County is required" };
        if (!desiredJobTitle?.trim()) return { isValid: false, error: "Desired job title is required" };
        if (!headline?.trim()) return { isValid: false, error: "Professional headline is required" };
        return { isValid: true };
      },
      requiredFields: 5,
      getFilledFields: () => {
        const { fullName, phone, county, desiredJobTitle, headline } = formData.basicInfo || {};
        return [fullName, phone, county, desiredJobTitle, headline].filter(f => f?.trim()).length;
      },
    },
    {
      title: "What's your current situation?",
      description: "This helps us recommend the right opportunities",
      component: (
        <StatusStep
          onDataChange={(data) => handleStepData("status", data)}
          initialData={formData.status}
        />
      ),
      validate: () => {
        const { currentStatus, yearsOfExperience, _cvStorageId } = formData.status || {};
        if (!currentStatus) return { isValid: false, error: "Current status is required" };
        if (yearsOfExperience === undefined || yearsOfExperience === null) {
          return { isValid: false, error: "Years of experience is required" };
        }
        if (!_cvStorageId) return { isValid: false, error: "Please upload your CV/Resume" };
        return { isValid: true };
      },
      requiredFields: 3,
      getFilledFields: () => {
        const { currentStatus, yearsOfExperience, _cvStorageId } = formData.status || {};
        return [currentStatus, yearsOfExperience !== undefined && yearsOfExperience !== null, _cvStorageId].filter(Boolean).length;
      },
    },
    {
      title: "What are your skills?",
      description: "Select at least 3 skills that match your experience",
      component: (
        <SkillsStep
          onDataChange={(data) => handleStepData("skills", data)}
          initialData={formData.skills}
          desiredJobTitle={formData.basicInfo?.desiredJobTitle}
        />
      ),
      validate: () => {
        const skillsCount = formData.skills?.skills?.length || 0;
        if (skillsCount < 3) {
          return {
            isValid: false,
            error: `Please select at least 3 skills. You have selected ${skillsCount}.`
          };
        }
        return { isValid: true };
      },
      requiredFields: 3,
      getFilledFields: () => formData.skills?.skills?.length || 0,
    },
    {
      title: "What are you looking for?",
      description: "Help us find jobs that match your preferences",
      component: (
        <PreferencesStep
          onDataChange={(data) => handleStepData("preferences", data)}
          initialData={formData.preferences}
        />
      ),
      validate: () => {
        const { jobTypes, workArrangements, expectedSalaryMin } = formData.preferences || {};
        if (!jobTypes?.length) return { isValid: false, error: "Please select at least one job type" };
        if (!workArrangements?.length) return { isValid: false, error: "Please select at least one work arrangement" };
        if (!expectedSalaryMin) return { isValid: false, error: "Expected minimum salary is required" };
        return { isValid: true };
      },
      requiredFields: 3,
      getFilledFields: () => {
        const { jobTypes, workArrangements, expectedSalaryMin } = formData.preferences || {};
        return [jobTypes?.length, workArrangements?.length, expectedSalaryMin].filter(Boolean).length;
      },
    },
  ];

  return <OnboardingWizard steps={steps} onComplete={handleComplete} />;
}
