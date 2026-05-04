import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Delete user and all related data by Clerk ID (internal only — called from webhook)
export const deleteByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return;

    // Clean up all related records that reference this user via by_user index
    const relatedTables = [
      "jobSeekerProfiles",
      "employerProfiles",
      "employerOnboardingProgress",
      "recruiterProfiles",
      "workExperience",
      "education",
      "skills",
      "certifications",
      "languages",
      "jobViews",
      "savedJobs",
      "onboardingProgress",
      "subscriptions",
      "transactions",
      "serviceOrders",
    ] as const;

    for (const table of relatedTables) {
      const records = await ctx.db
        .query(table)
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    // Delete the user record itself
    await ctx.db.delete(user._id);
  },
});

// Self-delete: authenticated user deletes their own account
export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const relatedTables = [
      "jobSeekerProfiles",
      "employerProfiles",
      "employerOnboardingProgress",
      "recruiterProfiles",
      "workExperience",
      "education",
      "skills",
      "certifications",
      "languages",
      "jobViews",
      "savedJobs",
      "onboardingProgress",
      "subscriptions",
      "transactions",
      "serviceOrders",
    ] as const;

    for (const table of relatedTables) {
      const records = await ctx.db
        .query(table)
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    await ctx.db.delete(user._id);
    
    // Also delete the user from Clerk so the account is fully removed
    await ctx.scheduler.runAfter(0, internal.clerkActions.deleteClerkUser, {
      clerkId: identity.subject,
    });

    return { success: true };
  },
});

// Get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Create or update user from client (public mutation)
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullName: v.optional(v.string()),
    profilePhoto: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        email: args.email,
        fullName: args.fullName || existing.fullName,
        profilePhoto: args.profilePhoto || existing.profilePhoto,
      });
      return existing._id;
    }

    // Don't create user here - let Clerk webhook handle creation
    return null;
  },
});

// Create user from Clerk webhook (internal only)
export const createFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Primary check: by clerkId
    const existingByClerkId = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingByClerkId) return existingByClerkId._id;

    // Fallback: if a record with the same email already exists (e.g. manually created),
    // stamp the real clerkId onto it instead of creating a duplicate.
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      await ctx.db.patch(existingByEmail._id, { clerkId: args.clerkId });
      return existingByEmail._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      fullName: `${args.firstName} ${args.lastName}`,
      roles: [],
      primaryRole: "job_seeker",
      onboardingCompleted: false,
    });
  },
});

// Create user from signup form (public)
export const createFromSignup = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    roles: v.array(v.string()),
    fields: v.optional(v.array(v.string())),
    otherFieldDescription: v.optional(v.string()),
    companyInfo: v.optional(v.object({
      companyName: v.string(),
      companyType: v.string(),
      companyIndustry: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Primary check: by clerkId
    let existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    // Fallback: avoid duplicate if email already exists with a different clerkId
    if (!existing) {
      existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
      // Stamp the real clerkId if found via email
      if (existing) {
        await ctx.db.patch(existing._id, { clerkId: args.clerkId });
      }
    }

    if (existing) {
      // Update user with signup data
      await ctx.db.patch(existing._id, {
        roles: args.roles,
        primaryRole: args.roles[0] || "job_seeker",
      });

      // Create role-specific profiles
      if (args.roles.includes("job_seeker")) {
        const existingProfile = await ctx.db
          .query("jobSeekerProfiles")
          .withIndex("by_user", (q) => q.eq("userId", existing._id))
          .first();

        if (!existingProfile) {
          await ctx.db.insert("jobSeekerProfiles", {
            userId: existing._id,
            interestedFields: args.fields,
            otherFieldDescription: args.otherFieldDescription,
            profileCompleteness: 20,
          });
        }
      }

      if (args.roles.includes("employer") && args.companyInfo) {
        const existingProfile = await ctx.db
          .query("employerProfiles")
          .withIndex("by_user", (q) => q.eq("userId", existing._id))
          .first();

        if (!existingProfile) {
          await ctx.db.insert("employerProfiles", {
            userId: existing._id,
            companyName: args.companyInfo.companyName,
            companySize: args.companyInfo.companyType,
            companyIndustries: args.companyInfo.companyIndustry,
            isKenyaBased: false, // Will be set during onboarding
            contactPersonName: args.firstName + " " + args.lastName,
            contactPersonTitle: "Recruiter",
            verificationStatus: "pending",
          });
        }
      }

      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      fullName: `${args.firstName} ${args.lastName}`,
      roles: args.roles,
      primaryRole: args.roles[0] || "job_seeker",
      onboardingCompleted: false,
    });

    // Create role-specific profiles
    if (args.roles.includes("job_seeker")) {
      await ctx.db.insert("jobSeekerProfiles", {
        userId,
        interestedFields: args.fields,
        otherFieldDescription: args.otherFieldDescription,
        profileCompleteness: 20,
      });
    }

    if (args.roles.includes("employer") && args.companyInfo) {
      await ctx.db.insert("employerProfiles", {
        userId,
        companyName: args.companyInfo.companyName,
        companySize: args.companyInfo.companyType,
        companyIndustries: args.companyInfo.companyIndustry,
        isKenyaBased: false, // Will be set during onboarding
        contactPersonName: args.firstName + " " + args.lastName,
        contactPersonTitle: "Recruiter",
        verificationStatus: "pending",
      });
    }

    return userId;
  },
});

// Update signup data (called after Clerk webhook creates user)
export const updateSignupData = internalMutation({
  args: {
    clerkId: v.string(),
    roles: v.array(v.string()),
    fields: v.optional(v.array(v.string())),
    otherFieldDescription: v.optional(v.string()),
    companyInfo: v.optional(v.object({
      companyName: v.string(),
      companyType: v.string(),
      companyIndustry: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    // Update user roles
    await ctx.db.patch(user._id, {
      roles: args.roles,
      primaryRole: args.roles[0] || "job_seeker",
    });

    // Create role-specific profiles
    if (args.roles.includes("job_seeker")) {
      const existingProfile = await ctx.db
        .query("jobSeekerProfiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("jobSeekerProfiles", {
          userId: user._id,
          interestedFields: args.fields,
          otherFieldDescription: args.otherFieldDescription,
          profileCompleteness: 20,
        });
      }
    }

    if (args.roles.includes("employer") && args.companyInfo) {
      const existingProfile = await ctx.db
        .query("employerProfiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("employerProfiles", {
          userId: user._id,
          companyName: args.companyInfo.companyName,
          companySize: args.companyInfo.companyType,
          companyIndustries: args.companyInfo.companyIndustry,
          isKenyaBased: false,
          contactPersonName: user.fullName,
          contactPersonTitle: "Recruiter",
          verificationStatus: "pending",
        });
      }
    }

    return user._id;
  },
});

// Get user by Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
