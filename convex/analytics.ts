import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getJobInsights = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const applicationCount = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect()
      .then((apps) => apps.length);

    const viewCount = await ctx.db
      .query("jobViews")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect()
      .then((views) => views.length);

    const job = await ctx.db.get(args.jobId);
    const daysOld = job ? Math.floor((Date.now() - job.createdAt) / (1000 * 60 * 60 * 24)) : 0;

    return {
      applicationCount,
      viewCount,
      isPopular: viewCount > 50,
      isNew: daysOld < 7,
      competitiveness: applicationCount > 20 ? "high" : applicationCount > 10 ? "medium" : "low",
    };
  },
});

export const trackShare = mutation({
  args: {
    jobId: v.id("jobs"),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    let userId = undefined;
    
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();
      userId = user?._id;
    }

    await ctx.db.insert("jobViews", {
      jobId: args.jobId,
      userId,
      viewedAt: Date.now(),
    });

    return { tracked: true };
  },
});

/**
 * Track a job view (unique per user per job)
 */
export const trackView = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let userId = null;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();
      userId = user?._id || null;
    }

    // Check if this user already viewed this job
    if (userId) {
      const existingView = await ctx.db
        .query("jobViews")
        .withIndex("by_job_and_user", (q) => 
          q.eq("jobId", args.jobId).eq("userId", userId)
        )
        .first();

      if (existingView) {
        // Already viewed, don't count again
        return { alreadyViewed: true };
      }
    }

    // Record the view
    await ctx.db.insert("jobViews", {
      jobId: args.jobId,
      userId: userId || undefined,
      viewedAt: Date.now(),
    });

    return { alreadyViewed: false };
  },
});

/**
 * Get view count for a job
 */
export const getViewCount = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const views = await ctx.db
      .query("jobViews")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    return views.length;
  },
});

/**
 * Get application count for a job
 */
export const getApplicationCount = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    return applications.length;
  },
});

/**
 * Get job analytics (views, applications, conversion rate)
 */
export const getJobAnalytics = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    // Get views
    const views = await ctx.db
      .query("jobViews")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Get applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    const viewCount = views.length;
    const applicationCount = applications.length;
    const conversionRate = viewCount > 0 
      ? Math.round((applicationCount / viewCount) * 100) 
      : 0;

    // Applications by status
    const statusBreakdown = {
      submitted: applications.filter(a => a.status === "submitted").length,
      shortlisted: applications.filter(a => a.status === "shortlisted").length,
      interview: applications.filter(a => a.status === "interview").length,
      accepted: applications.filter(a => a.status === "accepted").length,
      rejected: applications.filter(a => a.status === "rejected").length,
    };

    return {
      viewCount,
      applicationCount,
      conversionRate,
      statusBreakdown,
    };
  },
});

/**
 * Get analytics for all employer's jobs
 */
export const getEmployerAnalytics = query({
  args: {
    timePeriod: v.optional(v.string()),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.primaryRole !== "employer") return null;

    // Calculate date range based on timePeriod
    let startDate = 0;
    const endDate = Date.now();
    
    if (args.timePeriod === "custom" && args.fromDate && args.toDate) {
      startDate = args.fromDate;
    } else if (args.timePeriod === "7d") {
      startDate = endDate - (7 * 24 * 60 * 60 * 1000);
    } else if (args.timePeriod === "30d") {
      startDate = endDate - (30 * 24 * 60 * 60 * 1000);
    } else if (args.timePeriod === "90d") {
      startDate = endDate - (90 * 24 * 60 * 60 * 1000);
    }
    // "all" or undefined means no date filter (startDate = 0)

    // Get all employer's jobs
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_employer", (q) => q.eq("employerId", user._id))
      .collect();

    // Get analytics for each job
    const jobAnalytics = await Promise.all(
      jobs.map(async (job) => {
        const views = await ctx.db
          .query("jobViews")
          .withIndex("by_job", (q) => q.eq("jobId", job._id))
          .collect();
        
        // Filter views by date range
        const filteredViews = views.filter(v => v.viewedAt >= startDate && v.viewedAt <= endDate);

        const applications = await ctx.db
          .query("applications")
          .withIndex("by_job", (q) => q.eq("jobId", job._id))
          .collect();
        
        // Filter applications by date range using _creationTime
        const filteredApplications = applications.filter(a => a._creationTime >= startDate && a._creationTime <= endDate);

        return {
          jobId: job._id,
          jobTitle: job.title,
          viewCount: filteredViews.length,
          applicationCount: filteredApplications.length,
          conversionRate: filteredViews.length > 0 
            ? Math.round((filteredApplications.length / filteredViews.length) * 100) 
            : 0,
        };
      })
    );

    // Overall stats
    const totalViews = jobAnalytics.reduce((sum, j) => sum + j.viewCount, 0);
    const totalApplications = jobAnalytics.reduce((sum, j) => sum + j.applicationCount, 0);
    const overallConversionRate = totalViews > 0 
      ? Math.round((totalApplications / totalViews) * 100) 
      : 0;

    return {
      totalJobs: jobs.length,
      totalViews,
      totalApplications,
      overallConversionRate,
      jobAnalytics,
    };
  },
});
