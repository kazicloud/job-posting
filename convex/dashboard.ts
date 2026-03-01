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
      .collect();

    const now = Date.now();
    
    // Filter and score jobs
    const jobsWithMatch = allJobs
      .filter(job => {
        // Not applied
        if (appliedJobIds.has(job._id)) return false;
        
        // Not closed (deadline not passed)
        if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < now) {
          return false;
        }
        
        // Match by interested fields OR skills
        const matchesDepartment = job.department && interestedFields.some(field => {
          const f = field.toLowerCase().trim();
          const jobDept = job.department!.toLowerCase().trim();
          return jobDept.includes(f) || f.includes(jobDept);
        });

        const hasSkillMatch = job.requiredSkills && job.requiredSkills.length > 0;

        return matchesDepartment || hasSkillMatch;
      })
      .map(job => {
        let matchPercentage = 0;

        // Calculate skill match if job has required skills
        if (job.requiredSkills && job.requiredSkills.length > 0 && userSkillNames.length > 0) {
          const requiredSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
          
          const matchedCount = requiredSkills.filter(jobSkill =>
            userSkillNames.some(userSkill => 
              userSkill === jobSkill || 
              userSkill.includes(jobSkill) || 
              jobSkill.includes(userSkill)
            )
          ).length;

          matchPercentage = Math.round((matchedCount / requiredSkills.length) * 100);
        } else if (job.department && interestedFields.length > 0) {
          // If no skills, but matches department, give it a base score
          const jobDept = job.department.toLowerCase().trim();
          const hasExactMatch = interestedFields.some(field => {
            const f = field.toLowerCase().trim();
            return jobDept === f || jobDept.includes(f) || f.includes(jobDept);
          });
          matchPercentage = hasExactMatch ? 75 : 50;
        }

        return {
          ...job,
          matchPercentage,
          createdAt: job._creationTime, // Use creation time for sorting
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt) // Sort by most recent first
      .slice(0, limit);

    return jobsWithMatch;
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

    // Get user's skills
    const userSkills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const userSkillNames = userSkills.map(s => s.skillName.toLowerCase().trim());

    // Get all published, non-expired jobs
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const now = Date.now();
    const appliedJobIds = new Set(applications.map(app => app.jobId));
    
    // Count jobs available for user (not applied, not expired, has skills match)
    const availableJobs = allJobs.filter(job => {
      if (appliedJobIds.has(job._id)) return false;
      if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < now) {
        return false;
      }
      if (!job.requiredSkills || job.requiredSkills.length === 0) return false;

      // At least 40% skill match
      const requiredSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
      const matchedCount = requiredSkills.filter(jobSkill =>
        userSkillNames.some(userSkill => 
          userSkill === jobSkill || 
          userSkill.includes(jobSkill) || 
          jobSkill.includes(userSkill)
        )
      ).length;
      const matchPercentage = (matchedCount / requiredSkills.length) * 100;
      
      return matchPercentage >= 40;
    }).length;

    // Calculate application response rate
    const reviewedApplications = applications.filter(app => 
      app.status !== "submitted"
    ).length;
    const responseRate = applications.length > 0 
      ? Math.round((reviewedApplications / applications.length) * 100)
      : 0;

    return {
      jobsForYou: availableJobs,
      applications: applications.length,
      savedJobs: savedJobs.length,
      responseRate,
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
