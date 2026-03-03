import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * PREMIUM JOB RECOMMENDATION ALGORITHM
 * Inspired by LinkedIn, Indeed, We Work Remotely
 * 
 * Features:
 * - Multi-factor scoring (field, skills, title, behavior)
 * - Related fields and job titles matching
 * - Behavioral signals (views, saves, applications)
 * - Diversity and freshness
 * - Deterministic randomization for variety on refresh
 */

// Related fields mapping (industry clusters)
const RELATED_FIELDS: Record<string, string[]> = {
  "technology": ["engineering", "software", "it", "tech", "digital", "data", "computer science", "information technology", "design", "product"],
  "engineering": ["technology", "software", "technical", "it", "infrastructure", "systems", "development", "design", "product"],
  "software": ["technology", "engineering", "it", "tech", "development", "programming", "coding", "design", "frontend", "backend"],
  "data": ["analytics", "data science", "business intelligence", "statistics", "technology", "machine learning", "ai", "engineering"],
  "finance": ["accounting", "banking", "fintech", "investment", "economics", "financial services", "technology"],
  "marketing": ["sales", "advertising", "communications", "digital marketing", "brand", "content", "social media", "design"],
  "sales": ["marketing", "business development", "account management", "customer success", "revenue"],
  "healthcare": ["medical", "nursing", "clinical", "pharmaceutical", "health", "wellness", "biotech"],
  "education": ["teaching", "training", "academic", "learning", "instruction", "tutoring"],
  "design": ["creative", "ux", "ui", "graphic", "product design", "visual", "art", "branding", "technology", "engineering", "frontend"],
  "operations": ["logistics", "supply chain", "project management", "administration", "process", "technology"],
  "hr": ["human resources", "recruitment", "talent", "people operations", "recruiting"],
  "legal": ["compliance", "regulatory", "law", "contracts", "governance", "attorney"],
  "customer service": ["support", "customer success", "client relations", "help desk", "customer experience"],
  "product": ["product management", "product design", "product development", "innovation", "technology", "engineering", "design"],
  "consulting": ["advisory", "strategy", "management consulting", "business consulting"],
};

// Job title synonyms and related titles
const JOB_TITLE_CLUSTERS: Record<string, string[]> = {
  // Engineering & Development
  "software engineer": ["developer", "programmer", "software developer", "engineer", "swe", "backend engineer", "frontend engineer", "full stack"],
  "developer": ["software engineer", "programmer", "engineer", "coder", "software developer"],
  "frontend": ["front-end", "ui developer", "web developer", "react developer", "vue developer", "angular developer"],
  "backend": ["back-end", "server-side", "api developer", "node developer", "python developer"],
  "full stack": ["fullstack", "full-stack", "software engineer", "web developer"],
  "devops": ["site reliability", "sre", "infrastructure engineer", "platform engineer", "cloud engineer"],
  "data engineer": ["data pipeline", "etl developer", "big data engineer", "data infrastructure"],
  "data scientist": ["machine learning engineer", "ml engineer", "ai engineer", "data analyst", "research scientist"],
  
  // Design
  "product designer": ["ux designer", "ui designer", "ux/ui designer", "product design", "designer"],
  "ux designer": ["user experience", "product designer", "ui/ux", "interaction designer"],
  "ui designer": ["user interface", "visual designer", "product designer", "graphic designer"],
  "graphic designer": ["visual designer", "brand designer", "creative designer", "ui designer"],
  
  // Product & Management
  "product manager": ["pm", "product owner", "product lead", "product management"],
  "project manager": ["program manager", "project lead", "delivery manager", "scrum master"],
  "engineering manager": ["tech lead", "team lead", "development manager", "software manager"],
  
  // Marketing & Sales
  "marketing manager": ["marketing lead", "digital marketing", "growth marketing", "marketing specialist"],
  "content writer": ["content creator", "copywriter", "content marketing", "writer", "blogger"],
  "sales representative": ["sales exec", "account executive", "sales associate", "business development"],
  "account manager": ["client manager", "customer success", "account executive", "relationship manager"],
  
  // Data & Analytics
  "data analyst": ["business analyst", "analytics", "data specialist", "bi analyst"],
  "business analyst": ["data analyst", "systems analyst", "business intelligence", "analyst"],
  
  // Operations & Admin
  "operations manager": ["ops manager", "operations lead", "operations coordinator"],
  "hr manager": ["human resources", "people operations", "talent manager", "hr lead"],
  "recruiter": ["talent acquisition", "recruitment specialist", "hiring manager", "talent partner"],
  
  // Customer-facing
  "customer success": ["customer support", "client success", "account manager", "customer experience"],
  "support engineer": ["technical support", "customer support", "help desk", "support specialist"],
};

/**
 * Get related fields for better matching
 */
function getRelatedFields(field: string): string[] {
  const normalized = field.toLowerCase().trim();
  
  if (RELATED_FIELDS[normalized]) {
    return [normalized, ...RELATED_FIELDS[normalized]];
  }
  
  for (const [key, related] of Object.entries(RELATED_FIELDS)) {
    if (related.includes(normalized)) {
      return [normalized, key, ...related];
    }
  }
  
  return [normalized];
}

/**
 * Get related job titles for better matching
 */
function getRelatedTitles(title: string): string[] {
  const normalized = title.toLowerCase().trim();
  
  // Check direct match
  if (JOB_TITLE_CLUSTERS[normalized]) {
    return [normalized, ...JOB_TITLE_CLUSTERS[normalized]];
  }
  
  // Check if title contains any cluster key
  for (const [key, related] of Object.entries(JOB_TITLE_CLUSTERS)) {
    if (normalized.includes(key) || related.some(r => normalized.includes(r))) {
      return [normalized, key, ...related];
    }
  }
  
  return [normalized];
}

/**
 * Check if job title matches user's interested fields or past applications
 */
function matchJobTitle(jobTitle: string, interestedFields: string[], pastTitles: string[]): number {
  const jobTitleLower = jobTitle.toLowerCase().trim();
  const relatedTitles = getRelatedTitles(jobTitleLower);
  
  let score = 0;
  
  // Match against interested fields
  for (const field of interestedFields) {
    const fieldLower = field.toLowerCase().trim();
    if (relatedTitles.some(t => t.includes(fieldLower) || fieldLower.includes(t))) {
      score += 20;
      break;
    }
  }
  
  // Match against past application titles (behavioral signal)
  for (const pastTitle of pastTitles) {
    const pastTitleLower = pastTitle.toLowerCase().trim();
    const pastRelated = getRelatedTitles(pastTitleLower);
    
    if (relatedTitles.some(t => pastRelated.includes(t))) {
      score += 15;
      break;
    }
  }
  
  return score;
}

/**
 * Calculate comprehensive job recommendation score
 * Score range: 0-100
 */
function calculateRecommendationScore(params: {
  job: any;
  interestedFields: string[];
  userSkills: string[];
  viewedJobIds: Set<string>;
  appliedJobIds: Set<string>;
  savedJobIds: Set<string>;
  pastApplicationTitles: string[];
  recentViewedTitles: string[];
}): number {
  const { 
    job, 
    interestedFields, 
    userSkills, 
    viewedJobIds, 
    appliedJobIds, 
    savedJobIds,
    pastApplicationTitles,
    recentViewedTitles,
  } = params;
  
  let score = 0;
  
  // === 1. FIELD/DEPARTMENT MATCH (25 points) ===
  if (job.department && interestedFields.length > 0) {
    const jobDept = job.department.toLowerCase().trim();
    
    // Exact match
    const exactMatch = interestedFields.some(field => {
      const f = field.toLowerCase().trim();
      return jobDept === f || jobDept.includes(f) || f.includes(jobDept);
    });
    
    if (exactMatch) {
      score += 25;
    } else {
      // Related field match
      const allRelatedFields = interestedFields.flatMap(f => getRelatedFields(f));
      const relatedMatch = allRelatedFields.some(field => 
        jobDept.includes(field) || field.includes(jobDept)
      );
      
      if (relatedMatch) {
        score += 15;
      }
    }
  }
  
  // === 2. JOB TITLE MATCH (20 points) ===
  if (job.title) {
    const titleScore = matchJobTitle(
      job.title, 
      interestedFields, 
      [...pastApplicationTitles, ...recentViewedTitles]
    );
    score += Math.min(20, titleScore);
  }
  
  // === 3. SKILL MATCH (25 points) ===
  if (job.requiredSkills && job.requiredSkills.length > 0 && userSkills.length > 0) {
    const requiredSkills = job.requiredSkills.map((s: string) => s.toLowerCase().trim());
    
    const matchedCount = requiredSkills.filter((jobSkill: string) =>
      userSkills.some(userSkill => 
        userSkill === jobSkill || 
        userSkill.includes(jobSkill) || 
        jobSkill.includes(userSkill)
      )
    ).length;
    
    const skillMatchPercentage = (matchedCount / requiredSkills.length) * 100;
    score += Math.round((skillMatchPercentage / 100) * 25);
  }
  
  // === 4. FRESHNESS/RECENCY (15 points) ===
  const daysSincePosted = (Date.now() - job._creationTime) / (1000 * 60 * 60 * 24);
  if (daysSincePosted < 1) {
    score += 15; // Posted today
  } else if (daysSincePosted < 3) {
    score += 12; // Last 3 days
  } else if (daysSincePosted < 7) {
    score += 9; // Last week
  } else if (daysSincePosted < 14) {
    score += 6; // Last 2 weeks
  } else if (daysSincePosted < 30) {
    score += 3; // Last month
  }
  
  // === 5. DIVERSITY BONUS (15 points) ===
  // Prioritize jobs not viewed yet for discovery
  if (!viewedJobIds.has(job._id)) {
    score += 15;
  } else if (viewedJobIds.has(job._id) && !appliedJobIds.has(job._id)) {
    score += 7; // Viewed but not applied - might be interested
  }
  
  // === 6. BEHAVIORAL SIGNALS ===
  // Saved jobs (strong interest signal)
  if (savedJobIds.has(job._id)) {
    score += 12;
  }
  
  // === 7. PENALTIES ===
  // Already applied - heavy penalty
  if (appliedJobIds.has(job._id)) {
    score -= 100;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Get smart job recommendations with pagination
 * For use in jobs page "For You" tab
 * STRICT: Only shows jobs matching user's interested fields
 */
export const getSmartRecommendationsPaginated = query({
  args: {
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    })),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("salary-high"),
      v.literal("salary-low")
    )),
  },
  handler: async (ctx, args) => {
    const numItems = args.paginationOpts?.numItems || 20;
    const cursorIndex = args.paginationOpts?.cursor 
      ? parseInt(args.paginationOpts.cursor) 
      : 0;
    const sortBy = args.sortBy || "newest";
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], continueCursor: null, isDone: true };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { page: [], continueCursor: null, isDone: true };

    // Get user profile
    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const interestedFields = profile?.interestedFields || [];
    if (interestedFields.length === 0) {
      return { page: [], continueCursor: null, isDone: true };
    }

    // Get user's skills
    const userSkills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const userSkillNames = userSkills.map(s => s.skillName.toLowerCase().trim());

    // Get user's applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", user._id))
      .collect();
    
    const appliedJobIds = new Set(applications.map(app => app.jobId));
    
    // Get past application titles
    const pastApplicationTitles: string[] = [];
    for (const app of applications.slice(0, 10)) {
      const job = await ctx.db.get(app.jobId);
      if (job?.title) pastApplicationTitles.push(job.title);
    }

    // Get user's viewed jobs
    const viewedJobs = await ctx.db
      .query("jobViews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
    
    const viewedJobIds = new Set(viewedJobs.map(view => view.jobId));
    
    // Get recent viewed titles
    const recentViewedTitles: string[] = [];
    for (const view of viewedJobs.slice(0, 10)) {
      const job = await ctx.db.get(view.jobId);
      if (job?.title) recentViewedTitles.push(job.title);
    }

    // Get user's saved jobs
    const savedJobs = await ctx.db
      .query("savedJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const savedJobIds = new Set(savedJobs.map(saved => saved.jobId));

    // Get all published jobs
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();

    const now = Date.now();
    
    // Get all related fields for matching
    const allRelatedFields = interestedFields.flatMap(f => getRelatedFields(f));
    
    // Category 1: Jobs matching interested fields
    const fieldMatchingJobs = allJobs.filter(job => {
      // Must not be expired
      if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < now) {
        return false;
      }
      
      // Check department match
      if (job.department) {
        const jobDept = job.department.toLowerCase().trim();
        const deptMatches = allRelatedFields.some(field => 
          jobDept.includes(field) || field.includes(jobDept)
        );
        if (deptMatches) return true;
      }
      
      // Check job title match
      if (job.title) {
        const jobTitle = job.title.toLowerCase().trim();
        const titleMatches = allRelatedFields.some(field => 
          jobTitle.includes(field) || field.includes(jobTitle)
        );
        if (titleMatches) return true;
      }
      
      return false;
    });
    
    // Category 2: Jobs user has shown interest in (viewed/saved) - even if different field
    const interestedJobs = allJobs.filter(job => {
      // Must not be expired
      if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < now) {
        return false;
      }
      
      // User has viewed or saved this job
      return viewedJobIds.has(job._id) || savedJobIds.has(job._id);
    });
    
    // Combine both categories (remove duplicates)
    const allMatchingJobIds = new Set([
      ...fieldMatchingJobs.map(j => j._id),
      ...interestedJobs.map(j => j._id),
    ]);
    
    const matchingJobs = allJobs.filter(job => allMatchingJobIds.has(job._id));

    // Score matching jobs
    const scoredJobs = matchingJobs.map(job => {
      let score = 0;
      
      // Field match bonus (50 points - tiered)
      const isFieldMatch = fieldMatchingJobs.some(j => j._id === job._id);
      if (isFieldMatch) {
        // Check if it's an EXACT field match (highest priority)
        let exactMatch = false;
        let relatedMatch = false;
        
        if (job.department) {
          const jobDept = job.department.toLowerCase().trim();
          // Exact match with interested fields
          exactMatch = interestedFields.some(field => {
            const f = field.toLowerCase().trim();
            return jobDept === f || jobDept.includes(f) || f.includes(jobDept);
          });
        }
        
        if (!exactMatch && job.title) {
          const jobTitle = job.title.toLowerCase().trim();
          // Exact match in title
          exactMatch = interestedFields.some(field => {
            const f = field.toLowerCase().trim();
            return jobTitle.includes(f) || f.includes(jobTitle);
          });
        }
        
        if (exactMatch) {
          score += 50; // Exact field match - highest priority
        } else {
          score += 30; // Related field match - lower priority
        }
      }
      
      // Skill match bonus (25 points)
      if (job.requiredSkills && job.requiredSkills.length > 0 && userSkillNames.length > 0) {
        const requiredSkills = job.requiredSkills.map((s: string) => s.toLowerCase().trim());
        
        const matchedCount = requiredSkills.filter((jobSkill: string) =>
          userSkillNames.some(userSkill => 
            userSkill === jobSkill || 
            userSkill.includes(jobSkill) || 
            jobSkill.includes(userSkill)
          )
        ).length;
        
        const skillMatchPercentage = (matchedCount / requiredSkills.length) * 100;
        score += Math.round((skillMatchPercentage / 100) * 25);
      }
      
      // Freshness bonus (15 points)
      const daysSincePosted = (Date.now() - job._creationTime) / (1000 * 60 * 60 * 24);
      if (daysSincePosted < 1) {
        score += 15;
      } else if (daysSincePosted < 3) {
        score += 12;
      } else if (daysSincePosted < 7) {
        score += 9;
      } else if (daysSincePosted < 14) {
        score += 6;
      } else if (daysSincePosted < 30) {
        score += 3;
      }
      
      // Interest signals (10 points total)
      if (savedJobIds.has(job._id)) {
        score += 10; // Strong signal - user saved it
      } else if (viewedJobIds.has(job._id)) {
        score += 5; // Moderate signal - user viewed it
      } else {
        score += 5; // Discovery bonus - new job
      }
      
      // Penalty for already applied
      if (appliedJobIds.has(job._id)) {
        score -= 100;
      }
      
      return {
        ...job,
        score: Math.max(0, score),
      };
    });

    // Sort by score first, then apply user's sort preference
    scoredJobs.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a._creationTime - b._creationTime;
        case "salary-high":
          return (b.salaryMax || 0) - (a.salaryMax || 0);
        case "salary-low":
          return (a.salaryMin || 0) - (b.salaryMin || 0);
        case "newest":
        default:
          return b._creationTime - a._creationTime;
      }
    });

    // Paginate
    const page = scoredJobs.slice(cursorIndex, cursorIndex + numItems);
    const hasMore = cursorIndex + numItems < scoredJobs.length;
    const continueCursor = hasMore ? (cursorIndex + numItems).toString() : null;

    // Return with match percentage
    return {
      page: page.map(job => ({
        ...job,
        matchPercentage: job.score,
        createdAt: job._creationTime,
      })),
      continueCursor,
      isDone: !hasMore,
    };
  },
});

/**
 * Get smart job recommendations with premium algorithm
 * Features: Multi-factor scoring, diversity, freshness, behavioral signals
 */
export const getSmartRecommendations = query({
  args: {
    limit: v.optional(v.number()),
    seed: v.optional(v.number()), // For variety on refresh
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;
    const seed = args.seed ?? Date.now();
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

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

    // Get user's applications (for behavioral signals)
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", user._id))
      .collect();
    
    const appliedJobIds = new Set(applications.map(app => app.jobId));
    
    // Get past application titles for pattern matching
    const pastApplicationTitles: string[] = [];
    for (const app of applications.slice(0, 10)) { // Last 10 applications
      const job = await ctx.db.get(app.jobId);
      if (job?.title) pastApplicationTitles.push(job.title);
    }

    // Get user's viewed jobs
    const viewedJobs = await ctx.db
      .query("jobViews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50); // Recent 50 views
    
    const viewedJobIds = new Set(viewedJobs.map(view => view.jobId));
    
    // Get recent viewed titles for pattern matching
    const recentViewedTitles: string[] = [];
    for (const view of viewedJobs.slice(0, 10)) {
      const job = await ctx.db.get(view.jobId);
      if (job?.title) recentViewedTitles.push(job.title);
    }

    // Get user's saved jobs
    const savedJobs = await ctx.db
      .query("savedJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const savedJobIds = new Set(savedJobs.map(saved => saved.jobId));

    // Get all published jobs
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();

    const now = Date.now();
    
    // Filter out expired jobs
    const availableJobs = allJobs.filter(job => {
      if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < now) {
        return false;
      }
      return true;
    });

    // Score all jobs
    const scoredJobs = availableJobs.map(job => ({
      ...job,
      score: calculateRecommendationScore({
        job,
        interestedFields,
        userSkills: userSkillNames,
        viewedJobIds,
        appliedJobIds,
        savedJobIds,
        pastApplicationTitles,
        recentViewedTitles,
      }),
    }));

    // Sort by score (descending)
    scoredJobs.sort((a, b) => b.score - a.score);

    // Get top candidates (3x limit for diversity pool)
    const poolSize = Math.min(limit * 3, scoredJobs.length);
    const topCandidates = scoredJobs.slice(0, poolSize);

    // Apply deterministic shuffle for variety on refresh
    // Uses seed to ensure same results within a session but different across sessions
    const shuffled = topCandidates
      .map((job, index) => ({
        job,
        // Simple PRNG for deterministic randomization
        randomScore: ((seed + index * 7919) * 9301 + 49297) % 233280,
      }))
      .sort((a, b) => {
        // Weighted: 70% original score, 30% random
        const scoreA = a.job.score * 0.7 + (a.randomScore / 233280) * 30;
        const scoreB = b.job.score * 0.7 + (b.randomScore / 233280) * 30;
        return scoreB - scoreA;
      })
      .map(item => item.job);

    // Select final recommendations
    const selectedJobs = shuffled.slice(0, limit);

    // Return with match percentage for display
    return selectedJobs.map(job => ({
      ...job,
      matchPercentage: job.score,
      createdAt: job._creationTime,
    }));
  },
});
