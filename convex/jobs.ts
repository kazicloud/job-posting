import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Set job expiry when publishing
export const publishJobWithExpiry = mutation({
  args: {
    jobId: v.id('jobs'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const job = await ctx.db.get(args.jobId)
    if (!job) throw new Error('Job not found')

    // Set expiry to 30 days from now
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days

    await ctx.db.patch(args.jobId, {
      status: 'published',
      expiresAt,
      updatedAt: Date.now(),
    })

    return { success: true, expiresAt }
  },
})

// Expire jobs that have passed their expiry date
export const expireOldJobs = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    
    // Find all published jobs that have an explicit expiresAt in the past
    // Note: jobs without expiresAt set should NOT be expired by this cron
    const expiredJobs = await ctx.db
      .query('jobs')
      .filter((q) => 
        q.and(
          q.eq(q.field('status'), 'published'),
          q.gt(q.field('expiresAt'), 0),        // expiresAt must be set (not undefined/null)
          q.lt(q.field('expiresAt'), now)        // and must be in the past
        )
      )
      .collect()

    // Update their status to expired
    for (const job of expiredJobs) {
      await ctx.db.patch(job._id, {
        status: 'expired',
        updatedAt: now,
      })
    }

    return { expiredCount: expiredJobs.length }
  },
})

// Get jobs expiring soon (for notifications)
export const getJobsExpiringSoon = query({
  args: {
    daysAhead: v.optional(v.number()), // Default 3 days
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) return []

    const daysAhead = args.daysAhead || 3
    const futureTime = Date.now() + (daysAhead * 24 * 60 * 60 * 1000)

    const jobs = await ctx.db
      .query('jobs')
      .withIndex('by_employer', (q) => q.eq('employerId', user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'published'),
          q.lt(q.field('expiresAt'), futureTime),
          q.gt(q.field('expiresAt'), Date.now())
        )
      )
      .collect()

    return jobs
  },
})


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


export const list = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
    sortBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], continueCursor: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { page: [], continueCursor: null };

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_employer", (q) => q.eq("employerId", user._id))
      .order("desc")
      .collect();

    return { page: jobs, continueCursor: null };
  },
});


// Get latest published jobs (public, no auth required)
export const getLatestPublished = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6
    
    const jobs = await ctx.db
      .query('jobs')
      .filter((q) => q.eq(q.field('status'), 'published'))
      .order('desc')
      .take(limit)
    
    // Fetch employer profiles for logos
    const jobsWithEmployers = await Promise.all(
      jobs.map(async (job) => {
        const employerProfile = await ctx.db
          .query("employerProfiles")
          .withIndex("by_user", (q) => q.eq("userId", job.employerId))
          .first()
        
        return {
          ...job,
          employerProfile: employerProfile ? {
            companyLogo: employerProfile.companyLogo,
          } : null,
        }
      })
    )
    
    return jobsWithEmployers
  },
})

// Get single job (authenticated)
export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get single job with application count
export const getWithApplicationCount = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) return null;
    
    const applicationCount = await ctx.db
      .query("applications")
      .filter((q) => q.eq(q.field("jobId"), args.id))
      .collect()
      .then((apps) => apps.length);
    
    return { ...job, applicationCount };
  },
});

// Get single published job (public, no auth required)
export const getPublic = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List published jobs with pagination (public)
export const listPublished = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
    sortBy: v.optional(v.union(
      v.literal("newest"), 
      v.literal("oldest"),
      v.literal("salary-high"),
      v.literal("salary-low")
    )),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("jobs")
      .filter((q) => q.eq(q.field("status"), "published"))
      .order(args.sortBy === "oldest" ? "asc" : "desc")
      .paginate(args.paginationOpts);
    
    // Fetch employer profiles for logos
    const jobsWithEmployers = await Promise.all(
      result.page.map(async (job) => {
        const employerProfile = await ctx.db
          .query("employerProfiles")
          .withIndex("by_user", (q) => q.eq("userId", job.employerId))
          .first()
        
        return {
          ...job,
          employerProfile: employerProfile ? {
            companyLogo: employerProfile.companyLogo,
          } : null,
        }
      })
    )
    
    return {
      ...result,
      page: jobsWithEmployers,
    };
  },
});

// Re-publish expired jobs (admin utility)
export const republishExpiredJobs = mutation({
  args: {},
  handler: async (ctx) => {
    const expiredJobs = await ctx.db
      .query('jobs')
      .filter((q) => q.eq(q.field('status'), 'expired'))
      .collect()

    const now = Date.now()
    const expiresAt = now + (30 * 24 * 60 * 60 * 1000) // 30 days from now

    for (const job of expiredJobs) {
      await ctx.db.patch(job._id, {
        status: 'published',
        expiresAt,
        updatedAt: now,
      })
    }

    return { republished: expiredJobs.length }
  },
})
