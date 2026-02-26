import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Calculate profile completeness percentage
function calculateCompleteness(data: any): number {
  const fields = [
    // Basic Info (40%)
    data.basicInfo?.fullName ? 10 : 0,
    data.basicInfo?.phone ? 5 : 0,
    data.basicInfo?.county ? 5 : 0,
    data.basicInfo?.location ? 5 : 0,
    data.basicInfo?.desiredJobTitle ? 10 : 0,
    data.basicInfo?.headline ? 5 : 0,
    
    // Status (20%)
    data.status?.currentStatus ? 10 : 0,
    data.status?.yearsOfExperience !== undefined ? 10 : 0,
    
    // Skills (20%)
    data.skills?.skills?.length >= 3 ? 20 : (data.skills?.skills?.length || 0) * 6.67,
    
    // Preferences (20%)
    data.preferences?.jobTypes?.length > 0 ? 10 : 0,
    data.preferences?.availability ? 5 : 0,
    data.preferences?.willingToRelocate !== undefined ? 5 : 0,
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
    if (data.status?.currentStatus) updates.currentStatus = data.status.currentStatus;
    if (data.status?.yearsOfExperience !== undefined) updates.yearsOfExperience = data.status.yearsOfExperience;
    if (data.basicInfo?.desiredJobTitle) updates.desiredJobTitle = data.basicInfo.desiredJobTitle;
    if (data.basicInfo?.headline) updates.headline = data.basicInfo.headline;
    if (data.basicInfo?.careerSummary) updates.careerSummary = data.basicInfo.careerSummary;
    if (data.preferences?.notLookingForWork !== undefined) updates.openToWork = !data.preferences.notLookingForWork;
    if (data.preferences?.availability) updates.availability = data.preferences.availability;
    if (data.preferences?.jobTypes) updates.jobTypes = data.preferences.jobTypes;
    if (data.preferences?.salaryMin) updates.salaryMin = parseInt(data.preferences.salaryMin);
    if (data.preferences?.salaryCurrency) updates.salaryCurrency = data.preferences.salaryCurrency;
    if (data.preferences?.willingToRelocate !== undefined) updates.willingToRelocate = data.preferences.willingToRelocate;
    if (data.preferences?.allowRecruiterContact !== undefined) updates.allowRecruiterContact = data.preferences.allowRecruiterContact;
    
    // Calculate and save profile completeness
    updates.profileCompleteness = calculateCompleteness(data);

    await ctx.db.patch(profileId, updates);

    // Update user basic info
    // Only mark onboarding as complete if profile is at least 80% complete
    const isComplete = updates.profileCompleteness >= 80;
    
    // Get CV storage ID from either basicInfo (parsed) or preferences (manual upload)
    const cvStorageId = data.basicInfo?._cvStorageId || data.preferences?._cvStorageId;
    
    await ctx.db.patch(userId, {
      fullName: data.basicInfo?.fullName,
      phone: data.basicInfo?.phone,
      county: data.basicInfo?.county,
      country: "Kenya",
      resumeStorageId: cvStorageId,
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

    // Save work experience from CV
    if (data._cvExtras?.workExperience && data._cvExtras.workExperience.length > 0) {
      for (let i = 0; i < data._cvExtras.workExperience.length; i++) {
        const exp = data._cvExtras.workExperience[i];
        // Skip if required fields are missing
        if (!exp.company || !exp.title) continue;
        
        await ctx.db.insert("workExperience", {
          userId,
          company: exp.company,
          title: exp.title,
          industry: "Other", // Default, can be updated later
          employmentType: "permanent", // Default
          startDate: exp.startDate || "",
          endDate: exp.endDate || undefined,
          currentlyWorking: exp.currentlyWorking || false,
          description: exp.description || undefined,
          order: i + 1,
        });
      }
    }

    // Save education from CV
    if (data._cvExtras?.education && data._cvExtras.education.length > 0) {
      for (let i = 0; i < data._cvExtras.education.length; i++) {
        const edu = data._cvExtras.education[i];
        // Skip if required fields are missing
        if (!edu.institution || !edu.fieldOfStudy) continue;
        
        await ctx.db.insert("education", {
          userId,
          institution: edu.institution,
          qualificationLevel: edu.qualificationLevel || "degree",
          fieldOfStudy: edu.fieldOfStudy,
          startYear: edu.startYear || "",
          endYear: edu.endYear || "",
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
