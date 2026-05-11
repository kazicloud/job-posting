import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/** Converts a job title + company name into a URL-friendly slug.
 *  e.g. "Senior Software Engineer" + "Safaricom" + "km4abc12" 
 *    → "senior-software-engineer-at-safaricom-km4abc12"
 */
function generateSlug(title: string, companyName: string, shortId: string): string {
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")  // strip special chars
      .trim()
      .replace(/\s+/g, "-")           // spaces → hyphens
      .replace(/-+/g, "-");           // collapse multiple hyphens
  return `${slugify(title)}-at-${slugify(companyName)}-${shortId}`;
}

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
    salaryPeriod: v.optional(v.string()),
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
      expiresAt: args.status === "published" ? Date.now() + (30 * 24 * 60 * 60 * 1000) : undefined,
    });
    // Generate SEO slug from title + company + last 8 chars of the Convex ID
    const shortId = jobId.slice(-8);
    const slug = generateSlug(args.title, args.companyName, shortId);
    await ctx.db.patch(jobId, { slug });
    return jobId;
  },
});

/**
 * One-time backfill: generates slugs for all jobs that don't have one yet.
 * Run from the Convex dashboard → Functions → jobMutations:backfillSlugs → Run.
 */
export const backfillSlugs = mutation({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db.query("jobs").collect();
    let patched = 0;
    for (const job of jobs) {
      if (!job.slug) {
        const shortId = job._id.slice(-8);
        const slug = generateSlug(job.title, job.companyName, shortId);
        await ctx.db.patch(job._id, { slug });
        patched++;
      }
    }
    return { patched, total: jobs.length };
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
    const job = await ctx.db.get(args.id);
    if (!job) throw new Error("Job not found");

    // Always set a fresh 30-day expiry whenever publishing, regardless of previous status
    if (args.status === "published") {
      await ctx.db.patch(args.id, { 
        status: args.status,
        updatedAt: Date.now(),
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
      });
    } else {
      await ctx.db.patch(args.id, { 
        status: args.status,
        updatedAt: Date.now(),
      });
    }
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
    salaryPeriod: v.optional(v.string()),
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


export const publish = mutation({
  args: {
    id: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) throw new Error("Job not found");
    await ctx.db.patch(args.id, {
      status: "published",
      updatedAt: Date.now(),
      // Always reset expiry to 30 days from now when publishing
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
  },
});
