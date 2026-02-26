import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], continueCursor: null, isDone: true };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { page: [], continueCursor: null, isDone: true };

    const result = await ctx.db
      .query("jobs")
      .withIndex("by_employer", (q) => q.eq("employerId", user._id))
      .order("desc")
      .paginate(args.paginationOpts || { numItems: 10, cursor: null });

    return result;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jobs").collect();
  },
});

export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPublic = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job || job.status !== "published") return null;
    return job;
  },
});

export const getWithApplicationCount = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) return null;

    const applicationCount = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.id))
      .collect()
      .then((apps) => apps.length);

    return { ...job, applicationCount };
  },
});

// List jobs by employer
export const listByEmployer = query({
  args: { employerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_employer", (q) => q.eq("employerId", args.employerId))
      .order("desc")
      .collect();
  },
});

// List all published jobs (for job seekers)
export const listPublished = query({
  args: {
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .paginate(args.paginationOpts || { numItems: 10, cursor: null });
  },
});

// List jobs in user's interested field (Tab 1: "For You")
export const listJobsInUserField = query({
  args: {
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], continueCursor: null, isDone: true };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { page: [], continueCursor: null, isDone: true };

    // Get user profile to find interested fields
    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const interestedFields = profile?.interestedFields || [];
    if (interestedFields.length === 0) {
      // No fields set - return empty (encourage profile completion)
      return { page: [], continueCursor: null, isDone: true };
    }

    // Get all published jobs
    const allPublishedJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();

    // Filter by department matching interested fields
    const filteredJobs = allPublishedJobs.filter(job => {
      if (!job.department) return false;
      
      const jobDept = job.department.toLowerCase().trim();
      return interestedFields.some(field => {
        const f = field.toLowerCase().trim();
        return jobDept.includes(f) || f.includes(jobDept);
      });
    });

    // Manual pagination (since we filtered in memory)
    const numItems = args.paginationOpts?.numItems || 20;
    const cursorIndex = args.paginationOpts?.cursor 
      ? parseInt(args.paginationOpts.cursor) 
      : 0;
    
    const page = filteredJobs.slice(cursorIndex, cursorIndex + numItems);
    const hasMore = cursorIndex + numItems < filteredJobs.length;
    const continueCursor = hasMore ? (cursorIndex + numItems).toString() : null;

    return {
      page,
      continueCursor,
      isDone: !hasMore,
    };
  },
});
