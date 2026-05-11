import { mutation, query, action, internalMutation, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Submit job application
export const apply = action({
  args: {
    jobId: v.id("jobs"),
    coverLetter: v.optional(v.string()),
  },
  handler: async (ctx: ActionCtx, args): Promise<Id<"applications">> => {
    const applicationId = await ctx.runMutation(internal.applications.applyInternal, args);
    
    // Send email notification to employer (fire-and-forget)
    await ctx.runAction(internal.emails.notifyEmployerNewApplication, { applicationId });
    // Send confirmation email to job seeker (fire-and-forget)
    await ctx.runAction(internal.emails.notifyJobSeekerApplicationReceived, { applicationId });
    
    return applicationId;
  },
});

// Internal mutation for applying
export const applyInternal = internalMutation({
  args: {
    jobId: v.id("jobs"),
    coverLetter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if already applied
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .filter((q) => q.eq(q.field("jobSeekerId"), user._id))
      .first();

    if (existing) throw new Error("Already applied to this job");

    return await ctx.db.insert("applications", {
      jobId: args.jobId,
      jobSeekerId: user._id,
      status: "submitted",
      coverLetter: args.coverLetter,
    });
  },
});

// Submit job application with detailed information (NEW)
export const applyWithDetails = action({
  args: {
    jobId: v.id("jobs"),
    coverLetter: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
    availability: v.optional(v.string()),
    salaryExpectations: v.optional(v.string()),
    workAuthorization: v.optional(v.string()),
    willingToRelocate: v.optional(v.boolean()),
    customAnswers: v.optional(v.array(v.object({
      questionIndex: v.number(),
      answer: v.union(v.string(), v.array(v.string())),
    }))),
  },
  handler: async (ctx: ActionCtx, args): Promise<Id<"applications">> => {
    const applicationId = await ctx.runMutation(internal.applications.applyWithDetailsInternal, args);
    
    // Send email notification to employer (fire-and-forget)
    await ctx.runAction(internal.emails.notifyEmployerNewApplication, { applicationId });
    // Send confirmation email to job seeker (fire-and-forget)
    await ctx.runAction(internal.emails.notifyJobSeekerApplicationReceived, { applicationId });
    
    return applicationId;
  },
});

// Internal mutation for applying with details
export const applyWithDetailsInternal = internalMutation({
  args: {
    jobId: v.id("jobs"),
    coverLetter: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
    availability: v.optional(v.string()),
    salaryExpectations: v.optional(v.string()),
    workAuthorization: v.optional(v.string()),
    willingToRelocate: v.optional(v.boolean()),
    customAnswers: v.optional(v.array(v.object({
      questionIndex: v.number(),
      answer: v.union(v.string(), v.array(v.string())),
    }))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if already applied
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .filter((q) => q.eq(q.field("jobSeekerId"), user._id))
      .first();

    if (existing) throw new Error("Already applied to this job");

    return await ctx.db.insert("applications", {
      jobId: args.jobId,
      jobSeekerId: user._id,
      status: "submitted",
      coverLetter: args.coverLetter,
      portfolioUrl: args.portfolioUrl,
      linkedInUrl: args.linkedInUrl,
      availability: args.availability,
      salaryExpectations: args.salaryExpectations,
      workAuthorization: args.workAuthorization,
      willingToRelocate: args.willingToRelocate,
      customAnswers: args.customAnswers,
    });
  },
});

// Check if user has applied to a job
export const hasApplied = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return false;

    const application = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .filter((q) => q.eq(q.field("jobSeekerId"), user._id))
      .first();

    return !!application;
  },
});

// Get applications for employer's jobs
export const getEmployerApplications = query({
  args: {
    jobId: v.optional(v.id("jobs")),
    status: v.optional(v.union(
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("shortlisted"),
      v.literal("interview"),
      v.literal("rejected"),
      v.literal("accepted")
    )),
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], continueCursor: null, isDone: true };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.primaryRole !== "employer") return { page: [], continueCursor: null, isDone: true };

    // If specific job requested, fetch only for that job
    if (args.jobId) {
      const job = await ctx.db.get(args.jobId);
      if (!job || job.employerId !== user._id) return { page: [], continueCursor: null, isDone: true };

      const jobId = args.jobId; // Type narrowing

      let query = ctx.db
        .query("applications")
        .withIndex("by_job", (q) => q.eq("jobId", jobId))
        .order("desc");

      // Apply status filter if provided
      const result = await query.paginate(args.paginationOpts || { numItems: 20, cursor: null });
      
      let applications = result.page;
      if (args.status) {
        applications = applications.filter(app => app.status === args.status);
      }

      // Get details for paginated results only
      const applicationsWithDetails = await Promise.all(
        applications.map(async (app) => {
          const jobSeeker = await ctx.db.get(app.jobSeekerId);
          
          const jobSeekerProfile = jobSeeker ? await ctx.db
            .query("jobSeekerProfiles")
            .withIndex("by_user", (q) => q.eq("userId", jobSeeker._id))
            .first() : null;

          const skills = jobSeeker ? await ctx.db
            .query("skills")
            .withIndex("by_user", (q) => q.eq("userId", jobSeeker._id))
            .collect() : [];

          let matchScore = 0;
          if (job?.requiredSkills && job.requiredSkills.length > 0 && skills.length > 0) {
            const jobSkills = job.requiredSkills.map(s => s.toLowerCase());
            const candidateSkills = skills.map(s => s.skillName.toLowerCase());
            const matchedCount = jobSkills.filter(js => 
              candidateSkills.some(cs => cs.includes(js) || js.includes(cs))
            ).length;
            matchScore = Math.round((matchedCount / jobSkills.length) * 100);
          }

          return {
            ...app,
            job,
            jobSeeker: jobSeeker ? {
              _id: jobSeeker._id,
              name: jobSeeker.fullName,
              email: jobSeeker.email,
              phone: jobSeeker.phone,
              skills: skills.map(s => s.skillName),
            } : null,
            matchScore,
          };
        })
      );

      return {
        page: applicationsWithDetails,
        continueCursor: result.continueCursor,
        isDone: result.isDone,
      };
    }

    // If no specific job, return empty (force job selection)
    return { page: [], continueCursor: null, isDone: true };
  },
});

// Get user's applications with pagination
export const myApplications = query({
  args: {
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], continueCursor: null, isDone: true };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { page: [], continueCursor: null, isDone: true };

    const result = await ctx.db
      .query("applications")
      .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", user._id))
      .order("desc")
      .paginate(args.paginationOpts || { numItems: 20, cursor: null });

    // Get job details for each application
    const applicationsWithJobs = await Promise.all(
      result.page.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        return { ...app, job };
      })
    );

    return {
      page: applicationsWithJobs,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

// Update application status (employer only)
export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("shortlisted"),
      v.literal("interview"),
      v.literal("rejected"),
      v.literal("accepted")
    ),
    interviewDetails: v.optional(v.object({
      date: v.string(),
      time: v.string(),
      format: v.string(),
      location: v.optional(v.string()),
      meetingLink: v.optional(v.string()),
      interviewerName: v.optional(v.string()),
      additionalNotes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.primaryRole !== "employer") {
      throw new Error("Only employers can update application status");
    }

    // Get the application
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    // Verify the job belongs to this employer
    const job = await ctx.db.get(application.jobId);
    if (!job || job.employerId !== user._id) {
      throw new Error("Unauthorized");
    }

    const previousStatus = application.status;

    // Update status and track first action time
    const updateData: any = {
      status: args.status,
    };

    // Set firstActionAt if this is the first time employer is taking action
    if (!application.firstActionAt && application.status === "submitted") {
      updateData.firstActionAt = Date.now();
    }

    // Store interview details if provided
    if (args.status === "interview" && args.interviewDetails) {
      updateData.interviewDetails = args.interviewDetails;
    }

    await ctx.db.patch(args.applicationId, updateData);

    // Schedule job-seeker email notifications (fire-and-forget)
    if (previousStatus !== args.status) {
      if (args.status === "shortlisted") {
        await ctx.scheduler.runAfter(0, internal.emails.notifyJobSeekerShortlisted, {
          applicationId: args.applicationId,
        });
      } else if (args.status === "interview" && args.interviewDetails) {
        await ctx.scheduler.runAfter(0, internal.emails.notifyJobSeekerInterview, {
          applicationId: args.applicationId,
          interviewDetails: args.interviewDetails,
        });
      } else if (args.status === "rejected") {
        await ctx.scheduler.runAfter(0, internal.emails.notifyJobSeekerRejected, {
          applicationId: args.applicationId,
        });
      }
    }

    return { success: true };
  },
});

// Get application counts for a specific job
export const getJobApplicationCounts = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.primaryRole !== "employer") return null;

    const job = await ctx.db.get(args.jobId);
    if (!job || job.employerId !== user._id) return null;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    return {
      all: applications.length,
      submitted: applications.filter(a => a.status === "submitted").length,
      shortlisted: applications.filter(a => a.status === "shortlisted").length,
      interview: applications.filter(a => a.status === "interview").length,
      rejected: applications.filter(a => a.status === "rejected").length,
    };
  },
});

// Get application counts for all employer jobs (for dropdown)
export const getAllJobsApplicationCounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.primaryRole !== "employer") return {};

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_employer", (q) => q.eq("employerId", user._id))
      .collect();

    const counts: Record<string, number> = {};
    
    await Promise.all(
      jobs.map(async (job) => {
        const applications = await ctx.db
          .query("applications")
          .withIndex("by_job", (q) => q.eq("jobId", job._id))
          .collect();
        counts[job._id] = applications.length;
      })
    );

    return counts;
  },
});

// Get single application by ID with full details
export const getApplicationById = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.primaryRole !== "employer") return null;

    const application = await ctx.db.get(args.applicationId);
    if (!application) return null;

    // Get job and verify ownership
    const job = await ctx.db.get(application.jobId);
    if (!job || job.employerId !== user._id) return null;

    // Get job seeker details
    const jobSeeker = await ctx.db.get(application.jobSeekerId);
    if (!jobSeeker) return null;

    const jobSeekerProfile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", jobSeeker._id))
      .first();

    const skills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", jobSeeker._id))
      .collect();

    // Get work experience
    const workExperience = await ctx.db
      .query("workExperience")
      .withIndex("by_user", (q) => q.eq("userId", jobSeeker._id))
      .collect();

    // Get education
    const education = await ctx.db
      .query("education")
      .withIndex("by_user", (q) => q.eq("userId", jobSeeker._id))
      .collect();

    // Get certifications
    const certifications = await ctx.db
      .query("certifications")
      .withIndex("by_user", (q) => q.eq("userId", jobSeeker._id))
      .collect();

    // Calculate match score
    let matchScore = 0;
    if (job?.requiredSkills && job.requiredSkills.length > 0 && skills.length > 0) {
      const jobSkills = job.requiredSkills.map(s => s.toLowerCase());
      const candidateSkills = skills.map(s => s.skillName.toLowerCase());
      const matchedCount = jobSkills.filter(js => 
        candidateSkills.some(cs => cs.includes(js) || js.includes(cs))
      ).length;
      matchScore = Math.round((matchedCount / jobSkills.length) * 100);
    }

    return {
      ...application,
      job,
      jobSeeker: {
        _id: jobSeeker._id,
        name: jobSeeker.fullName,
        email: jobSeeker.email,
        phone: jobSeeker.phone,
        location: jobSeeker.location,
        profilePhoto: jobSeeker.profilePhoto,
        resumeStorageId: jobSeeker.resumeStorageId,
        skills: skills.map(s => s.skillName),
        headline: jobSeekerProfile?.headline,
        about: jobSeekerProfile?.about,
        openToWork: jobSeekerProfile?.openToWork,
        yearsOfExperience: jobSeekerProfile?.yearsOfExperience,
        currentStatus: jobSeekerProfile?.currentStatus,
        profileAvailability: jobSeekerProfile?.availability,
        desiredJobTitle: jobSeekerProfile?.desiredJobTitle,
        salaryMin: jobSeekerProfile?.salaryMin,
        salaryCurrency: jobSeekerProfile?.salaryCurrency,
        languages: jobSeekerProfile?.languages,
        workExperience: workExperience.sort((a, b) => {
          // Sort by start date, most recent first
          const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
          const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
          return bDate - aDate;
        }),
        education: education.sort((a, b) => {
          // Sort by start year, most recent first
          const aYear = parseInt(a.startYear) || 0;
          const bYear = parseInt(b.startYear) || 0;
          return bYear - aYear;
        }),
        certifications: certifications.sort((a, b) => {
          // Sort by issue date, most recent first
          const aDate = a.issueDate ? new Date(a.issueDate).getTime() : 0;
          const bDate = b.issueDate ? new Date(b.issueDate).getTime() : 0;
          return bDate - aDate;
        }),
      },
      matchScore,
    };
  },
});

// Add internal note to application
export const addApplicationNote = mutation({
  args: {
    applicationId: v.id("applications"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.primaryRole !== "employer") {
      throw new Error("Only employers can add notes");
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    const job = await ctx.db.get(application.jobId);
    if (!job || job.employerId !== user._id) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("applicationNotes", {
      applicationId: args.applicationId,
      authorId: user._id,
      authorName: user.fullName || "Unknown",
      note: args.note,
    });
  },
});

// Get notes for an application
export const getApplicationNotes = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.primaryRole !== "employer") return [];

    const application = await ctx.db.get(args.applicationId);
    if (!application) return [];

    const job = await ctx.db.get(application.jobId);
    if (!job || job.employerId !== user._id) return [];

    const notes = await ctx.db
      .query("applicationNotes")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();

    return notes;
  },
});
