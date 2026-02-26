import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Core skill matching logic
 * Compares user skills against job required skills
 */
export const calculateSkillMatch = query({
  args: { 
    jobId: v.id("jobs"),
    userId: v.optional(v.id("users")) // Optional - defaults to current user
  },
  handler: async (ctx, args) => {
    // Get user (either provided or current authenticated user)
    let user;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;
      
      user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();
    }

    if (!user) return null;

    // Get job
    const job = await ctx.db.get(args.jobId);
    if (!job || !job.requiredSkills || job.requiredSkills.length === 0) {
      return {
        matchScore: 0,
        matchPercentage: 0,
        totalRequired: 0,
        matchedCount: 0,
        matchedSkills: [],
        missingSkills: [],
      };
    }

    // Get user's skills
    const userSkills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const userSkillNames = userSkills.map(s => s.skillName.toLowerCase().trim());

    // Normalize job skills
    const requiredSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
    
    // Match skills (exact match or partial match)
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkills.forEach(jobSkill => {
      const isMatch = userSkillNames.some(userSkill => 
        userSkill === jobSkill || 
        userSkill.includes(jobSkill) || 
        jobSkill.includes(userSkill)
      );
      
      if (isMatch) {
        matchedSkills.push(jobSkill);
      } else {
        missingSkills.push(jobSkill);
      }
    });

    // Calculate metrics
    const totalRequired = requiredSkills.length;
    const matchedCount = matchedSkills.length;
    const matchPercentage = Math.round((matchedCount / totalRequired) * 100);
    
    // Score out of 5 stars
    const matchScore = Math.min(5, Math.max(0, Math.round((matchPercentage / 100) * 5)));

    return {
      matchScore,
      matchPercentage,
      totalRequired,
      matchedCount,
      matchedSkills,
      missingSkills,
    };
  },
});

/**
 * Get all matching jobs for a user
 * Used for job recommendations and email notifications
 */
export const getMatchingJobsForUser = query({
  args: {
    userId: v.optional(v.id("users")),
    minMatchPercentage: v.optional(v.number()), // Default 40%
    limit: v.optional(v.number()), // Default 10
  },
  handler: async (ctx, args) => {
    const minMatch = args.minMatchPercentage ?? 40;
    const limit = args.limit ?? 10;

    // Get user
    let user;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return [];
      
      user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();
    }

    if (!user) return [];

    // Get user's skills
    const userSkills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const userSkillNames = userSkills.map(s => s.skillName.toLowerCase().trim());

    // Get all published jobs with required skills
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Calculate match for each job
    const jobsWithMatch = allJobs
      .filter(job => job.requiredSkills && job.requiredSkills.length > 0)
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
        const matchScore = Math.min(5, Math.max(0, Math.round((matchPercentage / 100) * 5)));

        return {
          job,
          matchScore,
          matchPercentage,
          matchedCount,
          totalRequired: requiredSkills.length,
        };
      })
      .filter(item => item.matchPercentage >= minMatch)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, limit);

    return jobsWithMatch;
  },
});

/**
 * Get match statistics for a user
 * Useful for dashboard analytics
 */
export const getUserMatchStats = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get user
    let user;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;
      
      user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();
    }

    if (!user) return null;

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
      .collect();

    const jobsWithSkills = allJobs.filter(job => job.requiredSkills && job.requiredSkills.length > 0);

    let perfectMatches = 0; // 100%
    let strongMatches = 0;  // 80-99%
    let goodMatches = 0;    // 60-79%
    let fairMatches = 0;    // 40-59%
    let weakMatches = 0;    // <40%

    jobsWithSkills.forEach(job => {
      const requiredSkills = job.requiredSkills!.map(s => s.toLowerCase().trim());
      
      const matchedCount = requiredSkills.filter(jobSkill =>
        userSkillNames.some(userSkill => 
          userSkill === jobSkill || 
          userSkill.includes(jobSkill) || 
          jobSkill.includes(userSkill)
        )
      ).length;

      const matchPercentage = Math.round((matchedCount / requiredSkills.length) * 100);

      if (matchPercentage === 100) perfectMatches++;
      else if (matchPercentage >= 80) strongMatches++;
      else if (matchPercentage >= 60) goodMatches++;
      else if (matchPercentage >= 40) fairMatches++;
      else weakMatches++;
    });

    return {
      totalJobs: jobsWithSkills.length,
      perfectMatches,
      strongMatches,
      goodMatches,
      fairMatches,
      weakMatches,
      userSkillCount: userSkills.length,
    };
  },
});
