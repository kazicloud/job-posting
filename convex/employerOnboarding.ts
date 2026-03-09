import { mutation, query, action, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const saveEmployerOnboardingProgress = mutation({
  args: {
    userId: v.id("users"),
    step: v.number(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("employerOnboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        currentStep: args.step,
        data: args.data,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("employerOnboardingProgress", {
        userId: args.userId,
        currentStep: args.step,
        data: args.data,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const getEmployerOnboardingProgress = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("employerOnboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const completeEmployerOnboarding = mutation({
  args: {
    userId: v.id("users"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId, data } = args;

    // Get user to retrieve company info from sign-up
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Create or update employer profile
    let profile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const profileData = {
      userId,
      // Use company info from sign-up (stored in user metadata or retrieve from sessionStorage data)
      companyName: data._signupData?.companyName || data.company?.companyName || "Company Name",
      companySize: data._signupData?.companyType || data.company?.companySize,
      companyIndustries: data._signupData?.companyIndustry || data.company?.industries || [],
      companyDescription: data.company.description,
      website: data.company.website,
      foundedYear: data.company.foundedYear ? parseInt(data.company.foundedYear) : undefined,
      
      isKenyaBased: data.company.isKenyaBased,
      headquarters: data.company.headquarters,
      country: data.company.isKenyaBased ? "Kenya" : data.company.country,
      
      contactPersonName: data.contact.fullName,
      contactPersonTitle: data.contact.jobTitle,
      contactPersonPhone: data.contact.phone,
      linkedInProfile: data.contact.linkedIn,
      
      registrationNumber: data.verification?.registrationNumber,
      kraPin: data.verification?.kraPin,
      
      incorporationCertStorageId: data.verification?._incorporationCertStorageId,
      kraCertStorageId: data.verification?._kraCertStorageId,
      registrationDocStorageId: data.verification?._registrationDocStorageId,
      
      verificationStatus: "documents_submitted" as const,
      onboardingCompleted: true,
    };

    let profileId;
    if (profile) {
      await ctx.db.patch(profile._id, profileData);
      profileId = profile._id;
    } else {
      profileId = await ctx.db.insert("employerProfiles", profileData);
    }

    // Update user
    await ctx.db.patch(userId, {
      fullName: data.contact.fullName,
      phone: data.contact.phone,
      onboardingCompleted: true,
    });

    // Mark onboarding as completed
    const progress = await ctx.db
      .query("employerOnboardingProgress")
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

// Action wrapper to complete onboarding and send email notification
export const completeEmployerOnboardingWithNotification = action({
  args: {
    userId: v.id("users"),
    data: v.any(),
  },
  handler: async (ctx: ActionCtx, args): Promise<Id<"employerProfiles">> => {
    // Complete onboarding
    const profileId = await ctx.runMutation(api.employerOnboarding.completeEmployerOnboarding, {
      userId: args.userId,
      data: args.data,
    });

    // Send email notification to admin
    await ctx.runAction(internal.emails.notifyAdminNewEmployer, {
      employerId: args.userId,
    });

    return profileId;
  },
});

export const updateVerificationStatus = mutation({
  args: {
    profileId: v.id("employerProfiles"),
    metamapVerificationId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("documents_submitted"),
      v.literal("under_review"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("suspended")
    ),
    brsVerified: v.optional(v.boolean()),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      verificationStatus: args.status,
    };

    if (args.metamapVerificationId) {
      updates.metamapVerificationId = args.metamapVerificationId;
    }

    if (args.brsVerified !== undefined) {
      updates.brsVerified = args.brsVerified;
    }

    if (args.status === "verified") {
      updates.verifiedAt = Date.now();
    }

    if (args.rejectionReason) {
      updates.rejectionReason = args.rejectionReason;
    }

    await ctx.db.patch(args.profileId, updates);
    return true;
  },
});
