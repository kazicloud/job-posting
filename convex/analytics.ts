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
 * Build time-series application buckets for the given period.
 */
function buildTimeSeries(
  applications: Array<{ _creationTime: number }>,
  startDate: number,
  endDate: number,
  timePeriod: string,
  fromDate?: number,
  toDate?: number,
): Array<{ label: string; count: number }> {
  const DAY = 24 * 60 * 60 * 1000;
  const buckets: Array<{ label: string; from: number; to: number }> = [];

  if (timePeriod === "7d") {
    // 7 daily buckets
    for (let i = 6; i >= 0; i--) {
      const d = new Date(endDate - i * DAY);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(d.getTime());
      dEnd.setHours(23, 59, 59, 999);
      buckets.push({
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        from: d.getTime(),
        to: dEnd.getTime(),
      });
    }
  } else if (timePeriod === "30d") {
    // 5 weekly buckets
    for (let i = 4; i >= 0; i--) {
      const weekEnd = new Date(endDate - i * 7 * DAY);
      weekEnd.setHours(23, 59, 59, 999);
      const weekStart = new Date(weekEnd.getTime() - 6 * DAY);
      weekStart.setHours(0, 0, 0, 0);
      buckets.push({
        label: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        from: weekStart.getTime(),
        to: weekEnd.getTime(),
      });
    }
  } else if (timePeriod === "90d") {
    // 3 monthly buckets
    for (let i = 2; i >= 0; i--) {
      const d = new Date(endDate);
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      buckets.push({
        label: monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        from: monthStart.getTime(),
        to: monthEnd.getTime(),
      });
    }
  } else if (timePeriod === "custom" && fromDate && toDate) {
    const rangeMs = toDate - fromDate;
    if (rangeMs <= 14 * DAY) {
      const days = Math.ceil(rangeMs / DAY) + 1;
      for (let i = 0; i < days; i++) {
        const d = new Date(fromDate + i * DAY);
        d.setHours(0, 0, 0, 0);
        const dEnd = new Date(d.getTime());
        dEnd.setHours(23, 59, 59, 999);
        if (d.getTime() > toDate) break;
        buckets.push({
          label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          from: d.getTime(),
          to: dEnd.getTime(),
        });
      }
    } else if (rangeMs <= 90 * DAY) {
      const weeks = Math.ceil(rangeMs / (7 * DAY)) + 1;
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(fromDate + i * 7 * DAY);
        weekStart.setHours(0, 0, 0, 0);
        if (weekStart.getTime() > toDate) break;
        const weekEnd = new Date(weekStart.getTime() + 6 * DAY);
        weekEnd.setHours(23, 59, 59, 999);
        buckets.push({
          label: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          from: weekStart.getTime(),
          to: Math.min(weekEnd.getTime(), toDate),
        });
      }
    } else {
      let year = new Date(fromDate).getFullYear();
      let month = new Date(fromDate).getMonth();
      let safetyLimit = 0;
      while (safetyLimit < 25) {
        const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
        if (monthStart.getTime() > toDate) break;
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
        buckets.push({
          label: monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          from: Math.max(monthStart.getTime(), fromDate),
          to: Math.min(monthEnd.getTime(), toDate),
        });
        month++;
        if (month > 11) { month = 0; year++; }
        safetyLimit++;
      }
    }
  } else {
    // "all" — last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(endDate);
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      buckets.push({
        label: monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        from: monthStart.getTime(),
        to: monthEnd.getTime(),
      });
    }
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    count: applications.filter(
      (a) => a._creationTime >= bucket.from && a._creationTime <= bucket.to
    ).length,
  }));
}

/**
 * Get analytics for all employer's jobs
 */
export const getEmployerAnalytics = query({
  args: {
    timePeriod: v.optional(v.string()),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
    jobId: v.optional(v.id("jobs")),
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

    // Get jobs to analyze (single job or all employer's jobs)
    let jobs;
    if (args.jobId) {
      const job = await ctx.db.get(args.jobId);
      jobs = job ? [job] : [];
    } else {
      jobs = await ctx.db
        .query("jobs")
        .withIndex("by_employer", (q) => q.eq("employerId", user._id))
        .collect();
    }

    // Get analytics for each job — also collect raw filtered applications for aggregates
    const jobAnalyticsRaw = await Promise.all(
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

        // Calculate shortlisted candidates (shortlisted + interview statuses)
        const shortlistedCount = filteredApplications.filter(
          a => a.status === "shortlisted" || a.status === "interview"
        ).length;

        // Calculate average response time (time to first action)
        const applicationsWithAction = filteredApplications.filter(a => a.firstActionAt);
        const avgResponseTime = applicationsWithAction.length > 0
          ? applicationsWithAction.reduce((sum, a) => {
              const responseTime = a.firstActionAt! - a._creationTime;
              return sum + responseTime;
            }, 0) / applicationsWithAction.length
          : null;

        return {
          jobId: job._id,
          jobTitle: job.title,
          viewCount: filteredViews.length,
          applicationCount: filteredApplications.length,
          shortlistedCount,
          avgResponseTime, // in milliseconds
          conversionRate: filteredViews.length > 0
            ? Math.round((filteredApplications.length / filteredViews.length) * 100)
            : 0,
          _rawApplications: filteredApplications,
        };
      })
    );

    // Collect all raw applications for aggregate analytics
    const allFilteredApplications = jobAnalyticsRaw.flatMap(j => j._rawApplications);

    // Strip internal _rawApplications from the public-facing job list
    const jobAnalytics = jobAnalyticsRaw.map(({ _rawApplications, ...rest }) => rest);

    // Overall stats
    const totalViews = jobAnalytics.reduce((sum, j) => sum + j.viewCount, 0);
    const totalApplications = jobAnalytics.reduce((sum, j) => sum + j.applicationCount, 0);
    const totalShortlisted = jobAnalytics.reduce((sum, j) => sum + j.shortlistedCount, 0);

    // Calculate overall average response time
    const allResponseTimes = jobAnalytics
      .filter(j => j.avgResponseTime !== null)
      .map(j => j.avgResponseTime!);
    const overallAvgResponseTime = allResponseTimes.length > 0
      ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
      : null;

    const overallConversionRate = totalViews > 0
      ? Math.round((totalApplications / totalViews) * 100)
      : 0;

    // Application status breakdown
    const statusBreakdown = {
      submitted: allFilteredApplications.filter(a => a.status === "submitted").length,
      under_review: allFilteredApplications.filter(a => a.status === "under_review").length,
      shortlisted: allFilteredApplications.filter(a => a.status === "shortlisted").length,
      interview: allFilteredApplications.filter(a => a.status === "interview").length,
      accepted: allFilteredApplications.filter(a => a.status === "accepted").length,
      rejected: allFilteredApplications.filter(a => a.status === "rejected").length,
    };

    // Time-series data
    const applicationsOverTime = buildTimeSeries(
      allFilteredApplications,
      startDate,
      endDate,
      args.timePeriod || "30d",
      args.fromDate,
      args.toDate,
    );

    // Top locations: look up county from each unique applicant's user record
    const uniqueJobSeekerIds = [...new Set(allFilteredApplications.map(a => a.jobSeekerId))];
    const applicantUsers = await Promise.all(
      uniqueJobSeekerIds.slice(0, 200).map(id => ctx.db.get(id))
    );
    const locationCounts: Record<string, number> = {};
    for (const u of applicantUsers) {
      const county = u?.county;
      if (county) {
        locationCounts[county] = (locationCounts[county] || 0) + 1;
      }
    }
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    return {
      totalJobs: jobs.length,
      totalViews,
      totalApplications,
      totalShortlisted,
      avgResponseTimeMs: overallAvgResponseTime,
      overallConversionRate,
      jobAnalytics,
      statusBreakdown,
      applicationsOverTime,
      topLocations,
    };
  },
});
