import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Update basic profile info
export const updateBasicInfo = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
    phone: v.string(),
    county: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;
    await ctx.db.patch(userId, {
      ...data,
      country: "Kenya", // Default to Kenya
    });
    return userId;
  },
});

// Update job seeker status
export const updateJobSeekerStatus = mutation({
  args: {
    userId: v.id("users"),
    currentStatus: v.union(
      v.literal("employed"),
      v.literal("unemployed"),
      v.literal("student"),
      v.literal("freelancer")
    ),
    yearsOfExperience: v.optional(v.number()),
    openToWork: v.optional(v.boolean()),
    availability: v.optional(v.union(
      v.literal("immediate"),
      v.literal("1_month"),
      v.literal("2_months"),
      v.literal("3_months")
    )),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;
    
    // Get or create job seeker profile
    let profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      const profileId = await ctx.db.insert("jobSeekerProfiles", { userId });
      await ctx.db.patch(profileId, data);
      return profileId;
    }

    await ctx.db.patch(profile._id, data);
    return profile._id;
  },
});

// Update job preferences
export const updateJobPreferences = mutation({
  args: {
    userId: v.id("users"),
    desiredJobTitle: v.optional(v.string()),
    jobTypes: v.optional(v.array(v.string())),
    desiredIndustries: v.optional(v.array(v.string())),
    salaryMin: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    willingToRelocate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;
    
    let profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      const profileId = await ctx.db.insert("jobSeekerProfiles", { userId });
      await ctx.db.patch(profileId, data);
      return profileId;
    }

    await ctx.db.patch(profile._id, data);
    return profile._id;
  },
});

// Complete onboarding
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      onboardingCompleted: true,
    });
    
    // Set openToWork for job seekers
    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (profile) {
      await ctx.db.patch(profile._id, { openToWork: true });
    }
    
    return args.userId;
  },
});

// Calculate profile completeness
export const calculateCompleteness = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return 0;

    let score = 0;
    const weights = {
      basicInfo: 30,
      experience: 25,
      education: 20,
      skills: 15,
      preferences: 10,
    };

    // Basic info (30%)
    if (user.fullName && user.phone && user.county) score += weights.basicInfo;

    // Experience (25%)
    const experience = await ctx.db
      .query("workExperience")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    if (experience.length > 0) score += weights.experience;

    // Education (20%)
    const education = await ctx.db
      .query("education")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    if (education.length > 0) score += weights.education;

    // Skills (15%)
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    if (skills.length >= 3) score += weights.skills;

    // Preferences (10%)
    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (profile?.jobTypes && profile.jobTypes.length > 0) score += weights.preferences;

    // Update profile completeness
    if (profile) {
      await ctx.db.patch(profile._id, { profileCompleteness: score });
    }

    return score;
  },
});
