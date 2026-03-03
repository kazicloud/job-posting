import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get recommended jobs for job seeker dashboard
 * Filters: not applied, not closed, matches interested fields or skills, sorted by match score
 */
export const getRecommendedJobs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    // Get user profile for interested fields
    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const interestedFields = profile?.interestedFields || [];

    // Get user's applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", user._id))
      .collect();
    
    const appliedJobIds = new Set(applications.map(app => app.jobId));

    // Get user's skills
    const userSkills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const userSkillNames = userSkills.map(s => s.skillName.toLowerCase().trim());

    // Get published jobs not yet applied to
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();

    const now = Date.now();
    
    // Filter jobs
    const availableJobs = allJobs.filter(job => {
      // Not applied
      if (appliedJobIds.has(job._id)) return false;
      
      // Not closed (deadline not passed)
      if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < now) {
        return false;
      }
      
      return true;
    });

    // Separate jobs by whether they match interested fields
    const matchingJobs = [];
    const otherJobs = [];

    for (const job of availableJobs) {
      let matchPercentage = 0;
      let matchesDepartment = false;

      // Check department match
      if (job.department && interestedFields.length > 0) {
        const jobDept = job.department.toLowerCase().trim();
        matchesDepartment = interestedFields.some(field => {
          const f = field.toLowerCase().trim();
          return jobDept.includes(f) || f.includes(jobDept);
        });
      }

      // Calculate match percentage
      if (matchesDepartment) {
        matchPercentage = 50; // Base score for department match

        // Add skill match bonus
        if (job.requiredSkills && job.requiredSkills.length > 0 && userSkillNames.length > 0) {
          const requiredSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
          
          const matchedCount = requiredSkills.filter(jobSkill =>
            userSkillNames.some(userSkill => 
              userSkill === jobSkill || 
              userSkill.includes(jobSkill) || 
              jobSkill.includes(userSkill)
            )
          ).length;

          const skillMatchPercentage = Math.round((matchedCount / requiredSkills.length) * 100);
          matchPercentage = Math.round((50 + skillMatchPercentage) / 2);
        }

        matchingJobs.push({
          ...job,
          matchPercentage,
          createdAt: job._creationTime,
        });
      } else {
        otherJobs.push({
          ...job,
          matchPercentage: 0,
          createdAt: job._creationTime,
        });
      }
    }

    // Prioritize matching jobs, then fill with other recent jobs if needed
    const result = [
      ...matchingJobs.sort((a, b) => b.createdAt - a.createdAt),
      ...otherJobs.sort((a, b) => b.createdAt - a.createdAt),
    ].slice(0, limit);

    return result;
  },
});

/**
 * Get dashboard stats for job seeker
 */
export const getJobSeekerStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    // Get applications count
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", user._id))
      .collect();

    // Get saved jobs count
    const savedJobs = await ctx.db
      .query("savedJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get recommended jobs count (same as recommendations page)
    // Get user profile
    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const interestedFields = profile?.interestedFields || [];

    // Get user's skills
    const userSkills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const userSkillNames = userSkills.map(s => s.skillName.toLowerCase().trim());

    // Get all published jobs
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();

    const now = Date.now();
    
    // Count all available jobs (matching recommendations logic)
    // Recommendations show all published, non-expired jobs with scoring
    const availableJobs = allJobs.filter(job => {
      // Only filter out expired jobs
      if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < now) {
        return false;
      }
      return true;
    }).length;

    // Calculate application response rate
    const reviewedApplications = applications.filter(app => 
      app.status !== "submitted"
    ).length;
    const responseRate = applications.length > 0 
      ? Math.round((reviewedApplications / applications.length) * 100)
      : 0;

    // Calculate days since last application
    let daysSinceLastApplication = null;
    let hoursSinceLastApplication = null;
    
    if (applications.length > 0) {
      const lastApplicationTime = Math.max(...applications.map(app => app._creationTime));
      const timeDiff = Date.now() - lastApplicationTime;
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      if (days > 0) {
        daysSinceLastApplication = days;
      } else {
        hoursSinceLastApplication = hours;
      }
    }

    // Profile completeness (already fetched above)
    const profileStrength = profile?.profileCompleteness || 0;

    return {
      jobsForYou: availableJobs,
      applications: applications.length,
      savedJobs: savedJobs.length,
      responseRate,
      daysSinceLastApplication,
      hoursSinceLastApplication,
      profileStrength,
    };
  },
});

/**
 * Get recent activity for job seeker dashboard
 */
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const limit = args.limit || 5;

    // Get recent applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", user._id))
      .order("desc")
      .take(limit);

    // Get recent saved jobs
    const savedJobs = await ctx.db
      .query("savedJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    // Get recent job views
    const jobViews = await ctx.db
      .query("jobViews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    // Combine and format activities
    const activities = [];

    // Add applications
    for (const app of applications) {
      const job = await ctx.db.get(app.jobId);
      if (job) {
        activities.push({
          type: "application" as const,
          action: "Applied to",
          target: `${job.title} at ${job.companyName}`,
          timestamp: app._creationTime,
          jobId: job._id,
        });
      }
    }

    // Add saved jobs
    for (const saved of savedJobs) {
      const job = await ctx.db.get(saved.jobId);
      if (job) {
        activities.push({
          type: "saved" as const,
          action: "Saved",
          target: `${job.title} at ${job.companyName}`,
          timestamp: saved._creationTime,
          jobId: job._id,
        });
      }
    }

    // Add job views
    for (const view of jobViews) {
      const job = await ctx.db.get(view.jobId);
      if (job) {
        activities.push({
          type: "view" as const,
          action: "Viewed",
          target: `${job.title} at ${job.companyName}`,
          timestamp: view.viewedAt,
          jobId: job._id,
        });
      }
    }

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },
});
