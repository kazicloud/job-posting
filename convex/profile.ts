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


export const updateEmployerProfile = mutation({
  args: {
    companyName: v.optional(v.string()),
    companySize: v.optional(v.string()),
    companyIndustries: v.optional(v.array(v.string())),
    companyDescription: v.optional(v.string()),
    website: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    linkedInProfile: v.optional(v.string()),
    isKenyaBased: v.optional(v.boolean()),
    headquarters: v.optional(v.string()),
    country: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    kraPin: v.optional(v.string()),
    contactPersonName: v.optional(v.string()),
    contactPersonTitle: v.optional(v.string()),
    contactPersonPhone: v.optional(v.string()),
    companyLogo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const employerProfile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!employerProfile) throw new Error("Employer profile not found");

    // Update employer profile
    await ctx.db.patch(employerProfile._id, {
      ...(args.companyName !== undefined && { companyName: args.companyName }),
      ...(args.companySize !== undefined && { companySize: args.companySize }),
      ...(args.companyIndustries !== undefined && { companyIndustries: args.companyIndustries }),
      ...(args.companyDescription !== undefined && { companyDescription: args.companyDescription }),
      ...(args.website !== undefined && { website: args.website }),
      ...(args.foundedYear !== undefined && { foundedYear: args.foundedYear }),
      ...(args.linkedInProfile !== undefined && { linkedInProfile: args.linkedInProfile }),
      ...(args.isKenyaBased !== undefined && { isKenyaBased: args.isKenyaBased }),
      ...(args.headquarters !== undefined && { headquarters: args.headquarters }),
      ...(args.country !== undefined && { country: args.country }),
      ...(args.registrationNumber !== undefined && { registrationNumber: args.registrationNumber }),
      ...(args.kraPin !== undefined && { kraPin: args.kraPin }),
      ...(args.contactPersonName !== undefined && { contactPersonName: args.contactPersonName }),
      ...(args.contactPersonTitle !== undefined && { contactPersonTitle: args.contactPersonTitle }),
      ...(args.contactPersonPhone !== undefined && { contactPersonPhone: args.contactPersonPhone }),
      ...(args.companyLogo !== undefined && { companyLogo: args.companyLogo }),
    });

    return { success: true };
  },
});

// Fill in only fields that are currently empty — no admin approval required.
// The server enforces that existing (non-empty) values are never overwritten.
export const fillMissingEmployerData = mutation({
  args: {
    companySize: v.optional(v.string()),
    companyIndustries: v.optional(v.array(v.string())),
    companyDescription: v.optional(v.string()),
    website: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    linkedInProfile: v.optional(v.string()),
    headquarters: v.optional(v.string()),
    country: v.optional(v.string()),
    isKenyaBased: v.optional(v.boolean()),
    contactPersonName: v.optional(v.string()),
    contactPersonTitle: v.optional(v.string()),
    contactPersonPhone: v.optional(v.string()),
    companyLogo: v.optional(v.string()),
    incorporationCertStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const employerProfile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!employerProfile) throw new Error("Employer profile not found");

    // Only patch fields that are currently empty — never overwrite existing data
    const patch: Record<string, any> = {};

    if (args.companySize && !employerProfile.companySize)
      patch.companySize = args.companySize;

    if (
      args.companyIndustries &&
      args.companyIndustries.length > 0 &&
      (!employerProfile.companyIndustries || employerProfile.companyIndustries.length === 0)
    )
      patch.companyIndustries = args.companyIndustries;

    if (args.companyDescription && !employerProfile.companyDescription)
      patch.companyDescription = args.companyDescription;

    if (args.website && !employerProfile.website)
      patch.website = args.website;

    if (args.foundedYear && !employerProfile.foundedYear)
      patch.foundedYear = args.foundedYear;

    if (args.linkedInProfile && !employerProfile.linkedInProfile)
      patch.linkedInProfile = args.linkedInProfile;

    if (args.headquarters && !employerProfile.headquarters)
      patch.headquarters = args.headquarters;

    if (args.country && !employerProfile.country)
      patch.country = args.country;

    if (args.isKenyaBased !== undefined && employerProfile.isKenyaBased === undefined)
      patch.isKenyaBased = args.isKenyaBased;

    if (args.contactPersonName && !employerProfile.contactPersonName)
      patch.contactPersonName = args.contactPersonName;

    if (args.contactPersonTitle && !employerProfile.contactPersonTitle)
      patch.contactPersonTitle = args.contactPersonTitle;

    if (args.contactPersonPhone && !employerProfile.contactPersonPhone)
      patch.contactPersonPhone = args.contactPersonPhone;

    if (args.companyLogo && !employerProfile.companyLogo)
      patch.companyLogo = args.companyLogo;

    if (args.incorporationCertStorageId && !employerProfile.incorporationCertStorageId)
      patch.incorporationCertStorageId = args.incorporationCertStorageId;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(employerProfile._id, patch);
    }

    return { success: true, updatedFields: Object.keys(patch) };
  },
});

export const updateJobSeekerBasicInfo = mutation({
  args: {
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    county: v.optional(v.string()),
    country: v.optional(v.string()),
    preferredRegions: v.optional(v.array(v.string())),
    headline: v.optional(v.string()),
    desiredJobTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const userPatch: Record<string, any> = {};
    if (args.fullName !== undefined) userPatch.fullName = args.fullName;
    if (args.phone !== undefined) userPatch.phone = args.phone;
    if (args.county !== undefined) userPatch.county = args.county;
    if (args.country !== undefined) userPatch.country = args.country;
    if (args.preferredRegions !== undefined) userPatch.preferredRegions = args.preferredRegions;

    if (Object.keys(userPatch).length > 0) {
      await ctx.db.patch(user._id, userPatch);
    }

    if (args.headline !== undefined || args.desiredJobTitle !== undefined) {
      const profile = await ctx.db
        .query("jobSeekerProfiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      if (profile) {
        const profilePatch: Record<string, any> = {};
        if (args.headline !== undefined) profilePatch.headline = args.headline;
        if (args.desiredJobTitle !== undefined) profilePatch.desiredJobTitle = args.desiredJobTitle;
        await ctx.db.patch(profile._id, profilePatch);
      }
    }

    return { success: true };
  },
});

export const updateJobSeekerPreferences = mutation({
  args: {
    desiredJobTitle: v.optional(v.string()),
    jobTypes: v.optional(v.array(v.string())),
    workArrangements: v.optional(v.array(v.string())),
    salaryMin: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    willingToRelocate: v.optional(v.boolean()),
    availability: v.optional(v.string()),
    currentStatus: v.optional(v.string()),
    yearsOfExperience: v.optional(v.number()),
    openToWork: v.optional(v.boolean()),
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

    const patch: Record<string, any> = {};
    if (args.desiredJobTitle !== undefined) patch.desiredJobTitle = args.desiredJobTitle;
    if (args.jobTypes !== undefined) patch.jobTypes = args.jobTypes;
    if (args.workArrangements !== undefined) patch.workArrangements = args.workArrangements;
    if (args.salaryMin !== undefined) patch.salaryMin = args.salaryMin;
    if (args.salaryCurrency !== undefined) patch.salaryCurrency = args.salaryCurrency;
    if (args.willingToRelocate !== undefined) patch.willingToRelocate = args.willingToRelocate;
    if (args.availability !== undefined) patch.availability = args.availability;
    if (args.currentStatus !== undefined) patch.currentStatus = args.currentStatus;
    if (args.yearsOfExperience !== undefined) patch.yearsOfExperience = args.yearsOfExperience;
    if (args.openToWork !== undefined) patch.openToWork = args.openToWork;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(profile._id, patch);
    }

    return { success: true };
  },
});
