import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) return existing._id;

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
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

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
