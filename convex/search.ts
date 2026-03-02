import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchJobs = query({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const searchQuery = args.query.toLowerCase().trim();
    
    if (!searchQuery) return [];

    // Get all published jobs
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Search across multiple fields with scoring
    const scoredJobs = allJobs
      .map((job) => {
        let score = 0;
        const title = job.title.toLowerCase();
        const company = job.companyName.toLowerCase();
        const location = job.location.toLowerCase();
        const description = job.description.toLowerCase();
        const skills = job.requiredSkills?.map(s => s.toLowerCase()) || [];

        // Exact title match (highest priority)
        if (title === searchQuery) score += 100;
        else if (title.includes(searchQuery)) score += 50;
        
        // Company name match
        if (company === searchQuery) score += 80;
        else if (company.includes(searchQuery)) score += 40;
        
        // Location match
        if (location.includes(searchQuery)) score += 30;
        
        // Skills match
        if (skills.some(s => s.includes(searchQuery))) score += 25;
        
        // Description match (lower priority)
        if (description.includes(searchQuery)) score += 10;
        
        // Employment type match
        if (job.employmentType.toLowerCase().includes(searchQuery)) score += 20;

        return { job, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ job }) => job);

    // Fetch employer profiles for logos
    const jobsWithEmployers = await Promise.all(
      scoredJobs.map(async (job) => {
        const employerProfile = await ctx.db
          .query("employerProfiles")
          .withIndex("by_user", (q) => q.eq("userId", job.employerId))
          .first();
        
        return {
          ...job,
          employerProfile: employerProfile ? {
            companyLogo: employerProfile.companyLogo,
          } : null,
        };
      })
    );

    return jobsWithEmployers;
  },
});

export const getSearchSuggestions = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    
    if (!searchQuery || searchQuery.length < 2) return [];

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Extract unique suggestions
    const suggestions = new Set<string>();
    
    jobs.forEach((job) => {
      // Job titles
      if (job.title.toLowerCase().includes(searchQuery)) {
        suggestions.add(job.title);
      }
      
      // Company names
      if (job.companyName.toLowerCase().includes(searchQuery)) {
        suggestions.add(job.companyName);
      }
      
      // Locations
      if (job.location.toLowerCase().includes(searchQuery)) {
        suggestions.add(job.location);
      }
      
      // Skills
      job.requiredSkills?.forEach((skill) => {
        if (skill.toLowerCase().includes(searchQuery)) {
          suggestions.add(skill);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  },
});
