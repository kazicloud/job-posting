import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Calculate profile completeness percentage
function calculateCompleteness(data: any): number {
  const fields = [
    // Basic Info (40%)
    data.basicInfo?.fullName ? 10 : 0,
    data.basicInfo?.phone ? 5 : 0,
    (data.basicInfo?.preferredRegions?.length || data.basicInfo?.county) ? 5 : 0,
    data.basicInfo?.desiredJobTitle ? 10 : 0,
    data.basicInfo?.headline ? 10 : 0,
    
    // Status + CV (30%)
    data.status?.currentStatus ? 10 : 0,
    data.status?.yearsOfExperience !== undefined ? 10 : 0,
    data.status?._cvStorageId ? 10 : 0,
    
    // Skills (20%)
    data.skills?.skills?.length >= 3 ? 20 : (data.skills?.skills?.length || 0) * 6.67,
    
    // Preferences (10%)
    data.preferences?.jobTypes?.length > 0 ? 3 : 0,
    data.preferences?.workArrangements?.length > 0 ? 4 : 0,
    data.preferences?.expectedSalaryMin ? 3 : 0,
  ];
  
  const total = fields.reduce((sum, val) => sum + val, 0);
  return Math.min(Math.round(total), 100);
}

// Save onboarding progress
export const saveOnboardingProgress = mutation({
  args: {
    userId: v.id("users"),
    step: v.number(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId, step, data } = args;

    // Calculate completeness
    const completeness = calculateCompleteness(data);

    // Check if progress exists
    const existing = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update existing progress
      await ctx.db.patch(existing._id, {
        currentStep: step,
        data,
        completeness,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new progress
      return await ctx.db.insert("onboardingProgress", {
        userId,
        currentStep: step,
        data,
        completeness,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get onboarding progress
export const getOnboardingProgress = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Complete onboarding (can be called multiple times to sync data)
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId, data } = args;

    // Get or create job seeker profile
    let profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    let profileId;
    if (!profile) {
      profileId = await ctx.db.insert("jobSeekerProfiles", { userId });
    } else {
      profileId = profile._id;
    }

    // Always update profile with latest data (merge, don't overwrite nulls)
    const updates: any = {};
    
    // Basic Info
    if (data.basicInfo?.desiredJobTitle) updates.desiredJobTitle = data.basicInfo.desiredJobTitle;
    if (data.basicInfo?.headline) updates.headline = data.basicInfo.headline;
    if (data.basicInfo?.careerSummary) updates.careerSummary = data.basicInfo.careerSummary;
    
    // Status
    if (data.status?.currentStatus) updates.currentStatus = data.status.currentStatus;
    if (data.status?.yearsOfExperience !== undefined) updates.yearsOfExperience = data.status.yearsOfExperience;
    
    // Preferences
    if (data.preferences?.jobTypes) updates.jobTypes = data.preferences.jobTypes;
    if (data.preferences?.workArrangements) updates.workArrangements = data.preferences.workArrangements;
    if (data.preferences?.expectedSalaryMin) updates.salaryMin = parseInt(data.preferences.expectedSalaryMin);
    if (data.preferences?.willingToRelocate !== undefined) updates.willingToRelocate = data.preferences.willingToRelocate;
    
    // CV Resume URL (move from users table to jobSeekerProfiles)
    const cvStorageId = data.status?._cvStorageId || data.basicInfo?._cvStorageId;
    if (cvStorageId) updates.resumeUrl = cvStorageId; // Store storage ID as resumeUrl
    
    // Set openToWork based on currentStatus
    if (data.status?.currentStatus) {
      updates.openToWork = data.status.currentStatus === "unemployed" || data.status.currentStatus === "student";
    }
    
    // Get signup data for interestedFields and otherFieldDescription
    if (data._signupData?.fields) updates.interestedFields = data._signupData.fields;
    if (data._signupData?.otherFieldDescription) updates.otherFieldDescription = data._signupData.otherFieldDescription;
    
    // Set desiredIndustries from signup interestedFields if not already set
    if (data._signupData?.fields && !updates.desiredIndustries) {
      updates.desiredIndustries = data._signupData.fields;
    }
    
    // Calculate and save profile completeness
    updates.profileCompleteness = calculateCompleteness(data);

    await ctx.db.patch(profileId, updates);

    // Update user basic info (remove resumeStorageId since it's now in profile)
    const isComplete = updates.profileCompleteness >= 80;
    
    await ctx.db.patch(userId, {
      fullName: data.basicInfo?.fullName,
      phone: data.basicInfo?.phone,
      county: data.basicInfo?.preferredRegions?.[0] || data.basicInfo?.county,
      preferredRegions: data.basicInfo?.preferredRegions,
      country: data.basicInfo?.preferredCountry || "KE",
      onboardingCompleted: isComplete,
    });

    // Save skills with priority
    if (data.skills?.skills) {
      // Delete existing skills
      const existingSkills = await ctx.db
        .query("skills")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      
      for (const skill of existingSkills) {
        await ctx.db.delete(skill._id);
      }

      // Insert new skills with priority
      for (let i = 0; i < data.skills.skills.length; i++) {
        await ctx.db.insert("skills", {
          userId,
          skillName: data.skills.skills[i],
          priority: i + 1, // 1-based priority
        });
      }
    }

    // Save work experience — prefer manually entered; fall back to CV-parsed
    const manualExperience: any[] = data.experience?.entries || [];
    const cvExperience: any[] = data._cvExtras?.workExperience || [];
    const experienceSource = manualExperience.length > 0 ? manualExperience : cvExperience;

    if (experienceSource.length > 0) {
      // Clear any previously saved work experience for this user
      const existingExp = await ctx.db
        .query("workExperience")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      for (const e of existingExp) {
        await ctx.db.delete(e._id);
      }

      for (let i = 0; i < experienceSource.length; i++) {
        const exp = experienceSource[i];
        if (!exp.company || !exp.title) continue;
        await ctx.db.insert("workExperience", {
          userId,
          company: exp.company,
          title: exp.title,
          industry: exp.industry || "Other",
          employmentType: (exp.employmentType as any) || "permanent",
          startDate: exp.startDate || "",
          endDate: exp.endDate || undefined,
          currentlyWorking: exp.currentlyWorking || false,
          description: exp.description || undefined,
          order: i + 1,
        });
      }
    }

    // Save education — prefer manually entered; fall back to CV-parsed
    const manualEducation: any[] = data.education?.entries || [];
    const cvEducation: any[] = data._cvExtras?.education || [];
    const educationSource = manualEducation.length > 0 ? manualEducation : cvEducation;

    if (educationSource.length > 0) {
      // Clear any previously saved education for this user
      const existingEdu = await ctx.db
        .query("education")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      for (const e of existingEdu) {
        await ctx.db.delete(e._id);
      }

      for (let i = 0; i < educationSource.length; i++) {
        const edu = educationSource[i];
        if (!edu.institution || !edu.fieldOfStudy) continue;
        await ctx.db.insert("education", {
          userId,
          institution: edu.institution,
          qualificationLevel: (edu.qualificationLevel as any) || "degree",
          certificateType: edu.certificateType || undefined,
          fieldOfStudy: edu.fieldOfStudy,
          startYear: edu.startYear || "",
          endYear: edu.currentlyStudying ? "" : (edu.endYear || ""),
          grade: edu.grade || undefined,
          order: i + 1,
        });
      }
    }

    // Save certifications from CV
    if (data._cvExtras?.certifications && data._cvExtras.certifications.length > 0) {
      for (const cert of data._cvExtras.certifications) {
        // Skip if required fields are missing
        if (!cert.name || !cert.issuingOrganization) continue;
        
        await ctx.db.insert("certifications", {
          userId,
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate || undefined,
        });
      }
    }

    // Save languages to profile
    if (data._cvExtras?.languages && data._cvExtras.languages.length > 0) {
      await ctx.db.patch(profileId, {
        languages: data._cvExtras.languages,
      });
    }

    // Mark onboarding as completed
    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (progress) {
      await ctx.db.patch(progress._id, {
        completed: true,
        updatedAt: Date.now(),
      });
    }

    return profileId;
  },
});
