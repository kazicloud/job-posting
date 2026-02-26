import { query } from "./_generated/server";
import { v } from "convex/values";

// Get complete job seeker profile with fallback to onboarding progress
export const getJobSeekerProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get profile from jobSeekerProfiles table
    let profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // If profile doesn't exist or is incomplete, check onboarding progress
    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Merge data: profile takes priority, onboarding progress fills gaps
    if (progress?.data) {
      const merged = {
        ...profile,
        // Fill missing fields from onboarding progress
        currentStatus: profile?.currentStatus || progress.data.status?.currentStatus,
        yearsOfExperience: profile?.yearsOfExperience ?? progress.data.status?.yearsOfExperience,
        desiredJobTitle: profile?.desiredJobTitle || progress.data.basicInfo?.desiredJobTitle,
        openToWork: profile?.openToWork ?? !progress.data.preferences?.notLookingForWork,
        availability: profile?.availability || progress.data.preferences?.availability,
        jobTypes: profile?.jobTypes || progress.data.preferences?.jobTypes,
        salaryMin: profile?.salaryMin ?? (progress.data.preferences?.salaryMin ? parseInt(progress.data.preferences.salaryMin) : undefined),
        salaryCurrency: profile?.salaryCurrency || progress.data.preferences?.salaryCurrency,
        willingToRelocate: profile?.willingToRelocate ?? progress.data.preferences?.willingToRelocate,
        allowRecruiterContact: profile?.allowRecruiterContact ?? progress.data.preferences?.allowRecruiterContact,
      };

      return merged;
    }

    return profile;
  },
});

// Get user skills with fallback to onboarding progress
export const getUserSkills = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get skills from skills table
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // If no skills found, check onboarding progress
    if (skills.length === 0) {
      const progress = await ctx.db
        .query("onboardingProgress")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (progress?.data?.skills?.skills) {
        // Return skills from onboarding progress with priority
        return progress.data.skills.skills.map((skillName: string, index: number) => ({
          skillName,
          priority: index + 1,
          userId: args.userId,
          _id: null, // Temporary, not saved yet
        }));
      }
    }

    return skills.sort((a, b) => (a.priority || 999) - (b.priority || 999));
  },
});
