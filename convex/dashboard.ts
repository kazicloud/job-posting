import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get recommended jobs for job seeker dashboard
 * Filters: not applied, not closed, skill-matched, sorted by match score
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
        
        return job.requiredSkills && job.requiredSkills.length > 0;
      })
      .map(job => {
        const requiredSkills = job.requiredSkills!.map(s => s.toLowerCase().trim());
        
        const matchedCount = requiredSkills.filter(jobSkill =>
          userSkillNames.some(userSkill => 
            userSkill === jobSkill || 
            userSkill.includes(jobSkill) || 
            jobSkill.includes(userSkill)
          )
        ).length;

        const matchPercentage = Math.round((matchedCount / requiredSkills.length) * 100);

        return {
          ...job,
          matchPercentage,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
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
