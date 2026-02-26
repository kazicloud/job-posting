import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getEmployerProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const employerProfile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    return employerProfile;
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    // Get job seeker profile
    const jobSeekerProfile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Get employer profile
    const employerProfile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Get skills
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get work experience
    const workExperience = await ctx.db
      .query("workExperience")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get education
    const education = await ctx.db
      .query("education")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get certifications
    const certifications = await ctx.db
      .query("certifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get profile photo URL from storageId if it exists
    let profilePhoto = user.profilePhoto;
    if (user.profilePhotoStorageId) {
      profilePhoto = (await ctx.storage.getUrl(user.profilePhotoStorageId)) || undefined;
    }

    return {
      ...user,
      profilePhoto,
      jobSeekerProfile,
      employerProfile,
      skills: skills.sort((a, b) => (a.priority || 0) - (b.priority || 0)),
      workExperience: workExperience.sort((a, b) => (a.order || 0) - (b.order || 0)),
      education: education.sort((a, b) => (a.order || 0) - (b.order || 0)),
      certifications,
    };
  },
});

export const updateProfilePhoto = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Get the public URL for the image
    const photoUrl = await ctx.storage.getUrl(args.storageId);

    // Store the storageId, not the URL (URLs can expire)
    await ctx.db.patch(user._id, {
      profilePhotoStorageId: args.storageId,
    });

    // Return URL for immediate display and Clerk sync
    return { photoUrl, clerkId: user.clerkId };
  },
});

export const removeProfilePhoto = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      profilePhoto: undefined,
      profilePhotoStorageId: undefined,
    });

    return true;
  },
});

export const updateCareerSummary = mutation({
  args: {
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      careerSummary: args.summary,
    });

    return true;
  },
});
