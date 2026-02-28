import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    employerId: v.id("users"),
    title: v.string(),
    companyName: v.string(),
    department: v.optional(v.string()),
    employmentType: v.string(),
    workplaceType: v.string(),
    location: v.string(),
    county: v.optional(v.string()),
    description: v.string(),
    responsibilities: v.string(),
    requirements: v.string(),
    requiredSkills: v.optional(v.array(v.string())),
    preferredSkills: v.optional(v.array(v.string())),
    niceToHave: v.optional(v.string()),
    salaryDisclosure: v.string(),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    currency: v.optional(v.string()),
    benefits: v.optional(v.string()),
    applicationDeadline: v.optional(v.string()),
    positions: v.number(),
    experienceLevel: v.string(),
    status: v.optional(v.string()),
    applicationSettings: v.optional(v.object({
      requireResume: v.boolean(),
      requireCoverLetter: v.boolean(),
      requirePortfolio: v.boolean(),
      requireLinkedIn: v.boolean(),
      requireAvailability: v.boolean(),
      requireSalaryExpectations: v.boolean(),
      requireWorkAuthorization: v.boolean(),
      requireWillingToRelocate: v.boolean(),
      customQuestions: v.array(v.object({
        question: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("select"),
          v.literal("radio"),
          v.literal("checkbox"),
          v.literal("file")
        ),
        required: v.boolean(),
        options: v.optional(v.array(v.string())),
        maxFileSize: v.number(),
        acceptedFileTypes: v.array(v.string()),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("jobs", {
      ...args,
      status: (args.status as any) || "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return jobId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("jobs"),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("closed"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("jobs"),
    title: v.string(),
    department: v.optional(v.string()),
    employmentType: v.string(),
    workplaceType: v.string(),
    location: v.string(),
    county: v.optional(v.string()),
    description: v.string(),
    responsibilities: v.string(),
    requirements: v.string(),
    requiredSkills: v.optional(v.array(v.string())),
    preferredSkills: v.optional(v.array(v.string())),
    niceToHave: v.optional(v.string()),
    salaryDisclosure: v.string(),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    currency: v.optional(v.string()),
    benefits: v.optional(v.string()),
    applicationDeadline: v.optional(v.string()),
    positions: v.number(),
    experienceLevel: v.string(),
    applicationSettings: v.optional(v.object({
      requireResume: v.boolean(),
      requireCoverLetter: v.boolean(),
      requirePortfolio: v.boolean(),
      requireLinkedIn: v.boolean(),
      requireAvailability: v.boolean(),
      requireSalaryExpectations: v.boolean(),
      requireWorkAuthorization: v.boolean(),
      requireWillingToRelocate: v.boolean(),
      customQuestions: v.array(v.object({
        question: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("select"),
          v.literal("radio"),
          v.literal("checkbox"),
          v.literal("file")
        ),
        required: v.boolean(),
        options: v.optional(v.array(v.string())),
        maxFileSize: v.number(),
        acceptedFileTypes: v.array(v.string()),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    // Check application count
    const applicationCount = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", id))
      .collect()
      .then((apps) => apps.length);

    if (applicationCount >= 10) {
      throw new Error("Cannot edit job with 10 or more applications");
    }

    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return id;
  },
});
