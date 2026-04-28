import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return false;

    // Check both fields — admin may have been set via primaryRole or roles array
    return user.roles?.includes("admin") || user.primaryRole === "admin";
  },
});

// Promote a user to admin by email — updates ALL records with that email
// to ensure the right one is hit regardless of which clerkId is active.
export const setAdminRole = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    if (allUsers.length === 0) throw new Error(`No user found with email: ${args.email}`);

    const updatedIds: string[] = [];
    for (const user of allUsers) {
      const roles = user.roles ?? [];
      if (!roles.includes("admin")) roles.push("admin");
      await ctx.db.patch(user._id, { roles, primaryRole: "admin" });
      updatedIds.push(user._id);
    }

    return {
      success: true,
      recordsUpdated: updatedIds.length,
      email: args.email,
      note: updatedIds.length > 1
        ? `WARNING: ${updatedIds.length} duplicate records found for this email. Run admin:deduplicateUserByEmail to clean up.`
        : "OK",
    };
  },
});

// Deduplicates all Convex user records sharing the same email.
// Keeps the record whose clerkId is provided (the real Clerk user ID),
// copies admin role onto it, then deletes all others.
export const deduplicateUserByEmail = mutation({
  args: { email: v.string(), keepClerkId: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    if (allUsers.length <= 1) return { success: true, message: "No duplicates found" };

    const keeper = allUsers.find((u) => u.clerkId === args.keepClerkId);
    if (!keeper) throw new Error(`No record found with clerkId: ${args.keepClerkId}`);

    // Merge roles from all duplicate records into the keeper
    const mergedRoles = new Set<string>(keeper.roles ?? []);
    for (const u of allUsers) {
      for (const r of u.roles ?? []) mergedRoles.add(r);
    }
    const roles = Array.from(mergedRoles);

    await ctx.db.patch(keeper._id, {
      roles,
      primaryRole: roles.includes("admin") ? "admin" : keeper.primaryRole,
    });

    // Delete all duplicate records (not the keeper)
    const deleted: string[] = [];
    for (const u of allUsers) {
      if (u._id !== keeper._id) {
        await ctx.db.delete(u._id);
        deleted.push(u._id);
      }
    }

    return { success: true, keptId: keeper._id, deletedIds: deleted };
  },
});

// Debug query to check current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { identity: null, user: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return {
      identity: {
        subject: identity.subject,
        email: identity.email,
      },
      user: user ? {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        primaryRole: user.primaryRole,
      } : null,
    };
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.roles?.includes("admin") && user?.primaryRole !== "admin") throw new Error("Unauthorized");

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const allUsers = await ctx.db.query("users").collect();
    const jobSeekers = allUsers.filter(u => u.roles?.includes("job_seeker") || u.primaryRole === "job_seeker");
    const employers = allUsers.filter(u => u.roles?.includes("employer") || u.primaryRole === "employer");

    return {
      jobSeekers: {
        total: jobSeekers.length,
        active: jobSeekers.filter(u => u.onboardingCompleted).length,
        inactive: jobSeekers.filter(u => !u.onboardingCompleted).length,
      },
      employers: {
        total: employers.length,
        active: employers.filter(u => u.onboardingCompleted).length,
        inactive: employers.filter(u => !u.onboardingCompleted).length,
      },
      jobs: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      applications: {
        total: 0,
        active: 0,
        closed: 0,
      },
      recentActivity: {
        newUsersToday: allUsers.filter(u => u._creationTime > oneDayAgo).length,
        newJobsToday: 0,
        newApplicationsToday: 0,
      },
    };
  },
});

export const getAllEmployers = query({
  args: { 
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.roles?.includes("admin") && user?.primaryRole !== "admin") throw new Error("Unauthorized");

    let allUsers = await ctx.db.query("users").collect();
    let employers = allUsers.filter(u => u.roles?.includes("employer") || u.primaryRole === "employer");

    // Sort by newest first
    employers.sort((a, b) => b._creationTime - a._creationTime);

    // Fetch employer profiles for search
    const employersWithProfiles = await Promise.all(
      employers.map(async (emp) => {
        const profile = await ctx.db
          .query("employerProfiles")
          .withIndex("by_user", (q) => q.eq("userId", emp._id))
          .first();
        
        return {
          ...emp,
          profile: profile ? {
            companyName: profile.companyName,
            companySize: profile.companySize,
            website: profile.website,
            headquarters: profile.headquarters,
            industry: profile.companyIndustries?.[0] || null,
            verificationStatus: profile.verificationStatus,
          } : null,
        };
      })
    );

    // Apply status filter
    let filteredEmployers = employersWithProfiles;
    if (args.status && args.status !== "all") {
      if (args.status === "verified") {
        filteredEmployers = filteredEmployers.filter(
          (emp) => emp.profile?.verificationStatus === "verified"
        );
      } else if (args.status === "pending") {
        filteredEmployers = filteredEmployers.filter(
          (emp) => emp.profile?.verificationStatus !== "verified"
        );
      }
    }

    // Apply search filter
    if (args.search && args.search.trim() !== "") {
      const searchLower = args.search.toLowerCase();
      filteredEmployers = filteredEmployers.filter((emp) =>
        emp.fullName?.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.profile?.companyName?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = filteredEmployers.length;
    const totalPages = Math.ceil(total / args.pageSize);
    const start = (args.page - 1) * args.pageSize;
    const end = start + args.pageSize;
    const paginatedEmployers = filteredEmployers.slice(start, end);

    // Calculate stats based on verificationStatus (source of truth)
    const verifiedCount = employersWithProfiles.filter(
      (e) => e.profile?.verificationStatus === "verified"
    ).length;
    const pendingCount = employersWithProfiles.filter(
      (e) => e.profile?.verificationStatus !== "verified"
    ).length;

    return {
      employers: paginatedEmployers,
      pagination: {
        page: args.page,
        pageSize: args.pageSize,
        total,
        totalPages,
      },
      stats: {
        total,
        verified: verifiedCount,
        pending: pendingCount,
      },
    };
  },
});

export const getAllJobSeekers = query({
  args: { 
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.roles?.includes("admin") && user?.primaryRole !== "admin") throw new Error("Unauthorized");

    let allUsers = await ctx.db.query("users").collect();
    let jobSeekers = allUsers.filter(u => u.roles?.includes("job_seeker") || u.primaryRole === "job_seeker");

    // Sort by newest first
    jobSeekers.sort((a, b) => b._creationTime - a._creationTime);

    // Fetch job seeker profiles for search
    const jobSeekersWithProfiles = await Promise.all(
      jobSeekers.map(async (js) => {
        const profile = await ctx.db
          .query("jobSeekerProfiles")
          .withIndex("by_user", (q) => q.eq("userId", js._id))
          .first();
        
        const applicationsCount = await ctx.db
          .query("applications")
          .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", js._id))
          .collect()
          .then((apps) => apps.length);
        
        return {
          ...js,
          applicationsCount,
          profile: profile ? {
            openToWork: profile.openToWork,
            desiredJobTitle: profile.desiredJobTitle,
          } : null,
        };
      })
    );

    // Apply search filter
    let filteredJobSeekers = jobSeekersWithProfiles;
    if (args.search && args.search.trim() !== "") {
      const searchLower = args.search.toLowerCase();
      filteredJobSeekers = jobSeekersWithProfiles.filter((js) =>
        js.fullName?.toLowerCase().includes(searchLower) ||
        js.email.toLowerCase().includes(searchLower) ||
        js.profile?.desiredJobTitle?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = filteredJobSeekers.length;
    const totalPages = Math.ceil(total / args.pageSize);
    const start = (args.page - 1) * args.pageSize;
    const end = start + args.pageSize;
    const paginatedJobSeekers = filteredJobSeekers.slice(start, end);

    return {
      jobSeekers: jobSeekersWithProfiles,
      pagination: {
        page: args.page,
        pageSize: args.pageSize,
        total,
        totalPages,
      },
    };
  },
});

export const getAllJobs = query({
  args: { 
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.roles?.includes("admin") && user?.primaryRole !== "admin") throw new Error("Unauthorized");

    let allJobs = await ctx.db.query("jobs").collect();

    // Sort by newest first
    allJobs.sort((a, b) => b._creationTime - a._creationTime);

    // Filter by status
    if (args.status && args.status !== "all") {
      allJobs = allJobs.filter((job) => job.status === args.status);
    }

    // Get applications count for each job
    const jobsWithCounts = await Promise.all(
      allJobs.map(async (job) => {
        const applicationsCount = await ctx.db
          .query("applications")
          .withIndex("by_job", (q) => q.eq("jobId", job._id))
          .collect()
          .then((apps) => apps.length);
        
        return { ...job, applicationsCount };
      })
    );

    // Apply search filter
    let filteredJobs = jobsWithCounts;
    if (args.search && args.search.trim() !== "") {
      const searchLower = args.search.toLowerCase();
      filteredJobs = jobsWithCounts.filter((job) =>
        job.title.toLowerCase().includes(searchLower) ||
        job.companyName.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = filteredJobs.length;
    const totalPages = Math.ceil(total / args.pageSize);
    const start = (args.page - 1) * args.pageSize;
    const end = start + args.pageSize;
    const paginatedJobs = filteredJobs.slice(start, end);

    return {
      jobs: paginatedJobs,
      pagination: {
        page: args.page,
        pageSize: args.pageSize,
        total,
        totalPages,
      },
    };
  },
});

export const getAllApplications = query({
  args: { 
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.roles?.includes("admin") && user?.primaryRole !== "admin") throw new Error("Unauthorized");

    let allApplications = await ctx.db.query("applications").collect();

    // Sort by newest first
    allApplications.sort((a, b) => b._creationTime - a._creationTime);

    // Filter by status
    if (args.status && args.status !== "all") {
      allApplications = allApplications.filter((app) => app.status === args.status);
    }

    // Get job and job seeker details for each application
    const applicationsWithDetails = await Promise.all(
      allApplications.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        const jobSeeker = await ctx.db.get(app.jobSeekerId);
        return { ...app, job, jobSeeker };
      })
    );

    // Apply search filter
    let filteredApplications = applicationsWithDetails;
    if (args.search && args.search.trim() !== "") {
      const searchLower = args.search.toLowerCase();
      filteredApplications = applicationsWithDetails.filter((app) =>
        app.jobSeeker?.fullName?.toLowerCase().includes(searchLower) ||
        app.jobSeeker?.email.toLowerCase().includes(searchLower) ||
        app.job?.title.toLowerCase().includes(searchLower) ||
        app.job?.companyName.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = filteredApplications.length;
    const totalPages = Math.ceil(total / args.pageSize);
    const start = (args.page - 1) * args.pageSize;
    const end = start + args.pageSize;
    const paginatedApplications = filteredApplications.slice(start, end);

    return {
      applications: paginatedApplications,
      pagination: {
        page: args.page,
        pageSize: args.pageSize,
        total,
        totalPages,
      },
    };
  },
});

export const verifyEmployer = mutation({
  args: {
    userId: v.id("users"),
    verified: v.boolean(),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") throw new Error("Unauthorized");

    // Update the boolean on users for quick access
    await ctx.db.patch(args.userId, {
      verified: args.verified,
    });

    // Update verificationStatus on employerProfiles — this is what the employer
    // dashboard reads to gate posting jobs and show status banners
    const profile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      const profileUpdate: any = {
        verificationStatus: args.verified ? "verified" : "rejected",
      };
      if (args.verified) {
        profileUpdate.verifiedAt = Date.now();
      }
      if (!args.verified && args.rejectionReason) {
        profileUpdate.rejectionReason = args.rejectionReason;
      }
      await ctx.db.patch(profile._id, profileUpdate);
    }

    return {
      userId: args.userId,
      verified: args.verified,
      rejectionReason: args.rejectionReason,
    };
  },
});

export const getEmployerDetails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") throw new Error("Unauthorized");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const profile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_employer", (q) => q.eq("employerId", args.userId))
      .collect();

    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applicationsCount = await ctx.db
          .query("applications")
          .withIndex("by_job", (q) => q.eq("jobId", job._id))
          .collect()
          .then((apps) => apps.length);
        return { ...job, applicationsCount };
      })
    );

    return {
      user,
      profile,
      jobs: jobsWithApplications,
      stats: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === "published").length,
        totalApplications: jobsWithApplications.reduce((sum, j) => sum + j.applicationsCount, 0),
      },
    };
  },
});

export const getJobSeekerDetails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") throw new Error("Unauthorized");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", args.userId))
      .collect();

    const applicationsWithJobs = await Promise.all(
      applications.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        return { ...app, job };
      })
    );

    return {
      user,
      profile,
      applications: applicationsWithJobs,
      stats: {
        totalApplications: applications.length,
        activeApplications: applications.filter((a) => 
          a.status === "submitted" || a.status === "under_review" || a.status === "shortlisted" || a.status === "interview"
        ).length,
        acceptedApplications: applications.filter((a) => a.status === "accepted").length,
      },
    };
  },
});

export const getApplicationDetails = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") throw new Error("Unauthorized");

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    const job = await ctx.db.get(application.jobId);
    const jobSeeker = await ctx.db.get(application.jobSeekerId);
    
    const jobSeekerProfile = jobSeeker ? await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", jobSeeker._id))
      .first() : null;

    const employer = job ? await ctx.db.get(job.employerId) : null;

    const notes = await ctx.db
      .query("applicationNotes")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    return {
      application,
      job,
      jobSeeker,
      jobSeekerProfile,
      employer,
      notes,
    };
  },
});

// Delete a user account (admin only). Cascades to all related data.
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") throw new Error("Unauthorized");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Cascade delete all related records
    const relatedTables = [
      "jobSeekerProfiles",
      "employerProfiles",
      "employerOnboardingProgress",
      "recruiterProfiles",
      "workExperience",
      "education",
      "skills",
      "certifications",
      "languages",
      "jobViews",
      "savedJobs",
      "onboardingProgress",
      "subscriptions",
      "transactions",
      "serviceOrders",
    ] as const;

    for (const table of relatedTables) {
      const records = await ctx.db
        .query(table)
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    // Delete the user record
    await ctx.db.delete(args.userId);

    return {
      success: true,
      deletedEmail: user.email,
      deletedName: user.fullName,
    };
  },
});

// Force-publish a job regardless of employer verification status
// Always sets a fresh 30-day expiry so the cron never immediately expires it
export const forcePublishJob = mutation({
  args: {
    jobId: v.id("jobs"),
    durationDays: v.optional(v.number()), // default 30
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin || !(admin.roles?.includes("admin") || admin.primaryRole === "admin")) {
      throw new Error("Admin access required");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const days = args.durationDays ?? 30;
    const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.jobId, {
      status: "published",
      updatedAt: Date.now(),
      expiresAt,
    });

    return { success: true, expiresAt };
  },
});
