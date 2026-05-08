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

// Get single published job by SEO slug (public, no auth required)
// Used by the marketing app's /job/[slug] page for shared job links
export const getPublicBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!job || job.status === "draft" || job.status === "archived") return null;

    // Join employer profile so the public job page can show the company logo
    const employerProfile = await ctx.db
      .query("employerProfiles")
      .filter((q) => q.eq(q.field("userId"), job.employerId))
      .first();

    return {
      ...job,
      employerProfile: employerProfile ? {
        companyLogo: employerProfile.companyLogo,
      } : null,
    };
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

/**
 * Get similar / related jobs for the detail page.
 * Scoring: department match (40 pts) + skill overlap (30 pts) + title word overlap (20 pts)
 *          + freshness (10 pts) + same company (10 pts).
 * Returns up to `limit` (default 3) results, always at least 2 if enough jobs exist.
 * Excludes the current job, expired jobs, and already-applied jobs for the viewer.
 */
export const getSimilarJobs = query({
  args: {
    jobId: v.id("jobs"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;
    const currentJob = await ctx.db.get(args.jobId);
    if (!currentJob) return [];

    // Optionally exclude jobs the viewer has already applied to
    const identity = await ctx.auth.getUserIdentity();
    const appliedJobIds = new Set<string>();
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();
      if (user) {
        const applications = await ctx.db
          .query("applications")
          .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", user._id))
          .collect();
        applications.forEach((a) => appliedJobIds.add(a.jobId));
      }
    }

    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();

    const now = Date.now();
    const candidates = allJobs.filter(
      (j) =>
        j._id !== args.jobId &&
        !appliedJobIds.has(j._id) &&
        (!j.applicationDeadline || new Date(j.applicationDeadline).getTime() > now)
    );

    const currentSkills = (currentJob.requiredSkills || []).map((s) =>
      s.toLowerCase().trim()
    );
    const currentDept = (currentJob.department || "").toLowerCase().trim();
    const currentTitleWords = currentJob.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const scored = candidates.map((job) => {
      let score = 0;

      // 1. Department match (40 pts)
      if (job.department) {
        const dept = job.department.toLowerCase().trim();
        if (dept === currentDept && currentDept !== "") {
          score += 40;
        } else if (
          currentDept !== "" &&
          (dept.includes(currentDept) || currentDept.includes(dept))
        ) {
          score += 25;
        }
      }

      // 2. Required skills overlap using Jaccard similarity (30 pts)
      const jobSkills = (job.requiredSkills || []).map((s) =>
        s.toLowerCase().trim()
      );
      if (currentSkills.length > 0 && jobSkills.length > 0) {
        const intersection = jobSkills.filter((s) =>
          currentSkills.some(
            (cs) => cs === s || cs.includes(s) || s.includes(cs)
          )
        );
        const unionSize = new Set([...currentSkills, ...jobSkills]).size;
        const jaccard = intersection.length / unionSize;
        score += Math.round(jaccard * 30);
      }

      // 3. Title word overlap (20 pts)
      const jobTitleWords = job.title
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const titleOverlap = jobTitleWords.filter((w) =>
        currentTitleWords.includes(w)
      ).length;
      if (titleOverlap > 0) score += Math.min(20, titleOverlap * 7);

      // 4. Same company / employer (bonus 10 pts — other roles at same company)
      if (job.employerId === currentJob.employerId) score += 10;

      // 5. Freshness bonus (10 pts)
      const daysSince =
        (Date.now() - job._creationTime) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) score += 10;
      else if (daysSince < 7) score += 7;
      else if (daysSince < 14) score += 4;
      else if (daysSince < 30) score += 2;

      return { ...job, similarityScore: score };
    });

    scored.sort((a, b) => b.similarityScore - a.similarityScore);

    // Always return at least 2 if available, up to limit
    const minReturn = Math.min(2, candidates.length);
    const takeCount = Math.max(limit, minReturn);

    return scored.slice(0, takeCount).map((j) => ({
      _id: j._id,
      _creationTime: j._creationTime,
      slug: j.slug,
      title: j.title,
      companyName: j.companyName,
      employerId: j.employerId,
      location: j.location,
      employmentType: j.employmentType,
      workplaceType: j.workplaceType,
      experienceLevel: j.experienceLevel,
      department: j.department,
      salaryDisclosure: j.salaryDisclosure,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      currency: j.currency,
      requiredSkills: j.requiredSkills,
      applicationDeadline: j.applicationDeadline,
      createdAt: j.createdAt,
      similarityScore: j.similarityScore,
    }));
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
