import { query, mutation, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { assertAdminPermission, assertSuperAdmin, getAdminIdentity } from "./adminAuthHelpers";

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

// ── Admin User Management ─────────────────────────────────────────────────────

/**
 * List all admin users with their roles. Requires admins:view permission.
 */
export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];

    const isAdminUser =
      me.isAdmin === true ||
      me.roles?.includes("admin") ||
      me.primaryRole === "admin";
    if (!isAdminUser) return [];

    // Fetch users with isAdmin:true plus legacy role-based admins
    const byFlag = await ctx.db
      .query("users")
      .withIndex("by_is_admin", (q) => q.eq("isAdmin", true))
      .collect();

    const byRole = await ctx.db
      .query("users")
      .withIndex("by_primary_role", (q) => q.eq("primaryRole", "admin"))
      .collect();

    // Merge and deduplicate
    const seen = new Set<string>();
    const admins: typeof byFlag = [];
    for (const u of [...byFlag, ...byRole]) {
      if (!seen.has(u._id)) {
        seen.add(u._id);
        admins.push(u);
      }
    }

    // Enrich with role info
    return await Promise.all(
      admins.map(async (u) => {
        const role = u.adminRoleId ? await ctx.db.get(u.adminRoleId) : null;
        return {
          _id: u._id,
          email: u.email,
          fullName: u.fullName ?? u.email,
          profilePhoto: u.profilePhoto ?? null,
          isAdmin: u.isAdmin ?? false,
          primaryRole: u.primaryRole,
          adminRoleId: u.adminRoleId ?? null,
          adminRoleName: role?.name ?? null,
          permissions: role?.permissions ?? [],
          isSuperAdmin: (role?.permissions ?? []).includes("*"),
        };
      })
    );
  },
});

/**
 * Assign or change an admin's role. Requires admins:update + super-admin.
 */
export const setAdminRoleById = mutation({
  args: { userId: v.id("users"), adminRoleId: v.optional(v.id("adminRoles")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const myRole = me.adminRoleId ? await ctx.db.get(me.adminRoleId) : null;
    const isSuperAdmin = myRole?.permissions.includes("*") ?? false;
    if (!isSuperAdmin) throw new Error("Only super-admins can change admin roles");

    await ctx.db.patch(args.userId, {
      adminRoleId: args.adminRoleId,
      isAdmin: true,
      roles: (await ctx.db.get(args.userId))?.roles?.includes("admin")
        ? (await ctx.db.get(args.userId))!.roles
        : [...((await ctx.db.get(args.userId))?.roles ?? []), "admin"],
      primaryRole: "admin",
    });
    return { success: true };
  },
});

/**
 * Promote a user to admin and assign a role. Requires super-admin.
 */
export const promoteToAdmin = mutation({
  args: {
    userId: v.id("users"),
    adminRoleId: v.optional(v.id("adminRoles")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const myRole = me.adminRoleId ? await ctx.db.get(me.adminRoleId) : null;
    const isSuperAdmin =
      myRole?.permissions.includes("*") ||
      me.roles?.includes("admin"); // Legacy super-admin
    if (!isSuperAdmin) throw new Error("Only super-admins can promote users to admin");

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");

    const existingRoles = target.roles ?? [];
    const updatedRoles = existingRoles.includes("admin")
      ? existingRoles
      : [...existingRoles, "admin"];

    await ctx.db.patch(args.userId, {
      isAdmin: true,
      adminRoleId: args.adminRoleId,
      roles: updatedRoles,
      primaryRole: "admin",
    });
    return { success: true };
  },
});

/**
 * Revoke admin access from a user. Requires super-admin.
 */
export const revokeAdminAccess = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const myRole = me.adminRoleId ? await ctx.db.get(me.adminRoleId) : null;
    const isSuperAdmin = myRole?.permissions.includes("*") ?? false;
    if (!isSuperAdmin) throw new Error("Only super-admins can revoke admin access");

    // Cannot revoke own access
    if (args.userId === me._id) throw new Error("You cannot revoke your own admin access");

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      isAdmin: false,
      adminRoleId: undefined,
      roles: (target.roles ?? []).filter((r) => r !== "admin"),
      primaryRole: target.roles?.includes("employer")
        ? "employer"
        : target.roles?.includes("job_seeker")
        ? "job_seeker"
        : "job_seeker",
    });
    return { success: true };
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

    const [allUsers, allJobs, allApplications] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("jobs").collect(),
      ctx.db.query("applications").collect(),
    ]);

    const jobSeekers = allUsers.filter(u => u.roles?.includes("job_seeker") || u.primaryRole === "job_seeker");
    const employers = allUsers.filter(u => u.roles?.includes("employer") || u.primaryRole === "employer");

    const activeJobStatuses = ["published"];
    const inactiveJobStatuses = ["draft", "closed", "archived", "expired"];
    const openAppStatuses = ["submitted", "under_review", "shortlisted", "interview"];
    const closedAppStatuses = ["accepted", "rejected"];

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
        total: allJobs.length,
        active: allJobs.filter(j => activeJobStatuses.includes(j.status)).length,
        inactive: allJobs.filter(j => inactiveJobStatuses.includes(j.status)).length,
      },
      applications: {
        total: allApplications.length,
        active: allApplications.filter(a => openAppStatuses.includes(a.status)).length,
        closed: allApplications.filter(a => closedAppStatuses.includes(a.status)).length,
      },
      recentActivity: {
        newUsersToday: allUsers.filter(u => u._creationTime > oneDayAgo).length,
        newJobsToday: allJobs.filter(j => j._creationTime > oneDayAgo).length,
        newApplicationsToday: allApplications.filter(a => a._creationTime > oneDayAgo).length,
      },
    };
  },
});

// Lightweight badge count for the sidebar: pending verifications + pending profile edits
export const getPendingEmployerActionCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") return 0;

    const [pendingVerifications, pendingEdits] = await Promise.all([
      ctx.db
        .query("employerProfiles")
        .withIndex("by_verification_status", (q) => q.eq("verificationStatus", "under_review"))
        .collect()
        .then((r) => r.length),
      ctx.db
        .query("employerPendingEdits")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .collect()
        .then((r) => r.length),
    ]);

    return pendingVerifications + pendingEdits;
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
        const AWAITING = new Set(["pending", "documents_submitted", "under_review"]);
        filteredEmployers = filteredEmployers.filter(
          (emp) => !!emp.profile?.verificationStatus && AWAITING.has(emp.profile.verificationStatus)
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
    // Only the statuses that represent active verification queue items
    const AWAITING_STATUSES = new Set(["pending", "documents_submitted", "under_review"]);

    const verifiedCount = employersWithProfiles.filter(
      (e) => e.profile?.verificationStatus === "verified"
    ).length;
    const pendingCount = employersWithProfiles.filter(
      (e) => !!e.profile?.verificationStatus && AWAITING_STATUSES.has(e.profile.verificationStatus)
    ).length;
    const rejectedCount = employersWithProfiles.filter(
      (e) => e.profile?.verificationStatus === "rejected"
    ).length;
    const suspendedCount = employersWithProfiles.filter(
      (e) => e.profile?.verificationStatus === "suspended"
    ).length;

    // Pending profile edits (employers with unapproved field changes)
    const allPendingEdits = await ctx.db
      .query("employerPendingEdits")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const pendingEditsCount = allPendingEdits.length;

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
        rejected: rejectedCount,
        suspended: suspendedCount,
        pendingEdits: pendingEditsCount,
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

    // Apply status filter
    if (args.status && args.status !== "all") {
      if (args.status === "active") {
        filteredJobSeekers = filteredJobSeekers.filter((js) => js.onboardingCompleted);
      } else if (args.status === "inactive") {
        filteredJobSeekers = filteredJobSeekers.filter((js) => !js.onboardingCompleted);
      } else if (args.status === "open_to_work") {
        filteredJobSeekers = filteredJobSeekers.filter((js) => js.profile?.openToWork);
      }
    }

    // Calculate pagination
    const total = filteredJobSeekers.length;
    const totalPages = Math.ceil(total / args.pageSize);
    const start = (args.page - 1) * args.pageSize;
    const end = start + args.pageSize;
    const paginatedJobSeekers = filteredJobSeekers.slice(start, end);

    // Global stats — always from full unfiltered set for the summary cards
    const globalTotal = jobSeekersWithProfiles.length;
    const globalCompleted = jobSeekersWithProfiles.filter((js) => js.onboardingCompleted).length;
    const globalOpenToWork = jobSeekersWithProfiles.filter((js) => js.profile?.openToWork).length;

    return {
      jobSeekers: paginatedJobSeekers,
      pagination: {
        page: args.page,
        pageSize: args.pageSize,
        total,
        totalPages,
      },
      stats: {
        total: globalTotal,
        completedOnboarding: globalCompleted,
        openToWork: globalOpenToWork,
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

export const getAllUserEmails = query({
  args: {},
  handler: async (ctx): Promise<Array<{ email: string; name: string }>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!caller || (caller.primaryRole !== "admin" && !caller.roles?.includes("admin"))) {
      throw new Error("Admin access required");
    }
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => !!u.email)
      .map((u) => ({ email: u.email, name: u.fullName ?? u.email }));
  },
});

export const searchUsers = query({
  args: { search: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<Array<{ _id: string; email: string; fullName?: string; primaryRole?: string }>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!caller || (caller.primaryRole !== "admin" && !caller.roles?.includes("admin"))) {
      throw new Error("Admin access required");
    }
    const q = args.search.toLowerCase();
    const limit = args.limit ?? 8;
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => !!u.email && (
        u.email.toLowerCase().includes(q) ||
        (u.fullName ?? "").toLowerCase().includes(q)
      ))
      .slice(0, limit)
      .map((u) => ({
        _id: u._id,
        email: u.email,
        fullName: u.fullName,
        primaryRole: u.primaryRole,
      }));
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

export const getEmployerDocumentUrls = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") throw new Error("Unauthorized");

    let user: any;
    try {
      user = await ctx.db.get(args.userId as any);
    } catch {
      return null;
    }
    if (!user) return null;

    const profile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) return { incorporationCertUrl: null, kraCertUrl: null, registrationDocUrl: null };

    const [incorporationCertUrl, kraCertUrl, registrationDocUrl] = await Promise.all([
      profile.incorporationCertStorageId
        ? ctx.storage.getUrl(profile.incorporationCertStorageId as any)
        : null,
      profile.kraCertStorageId
        ? ctx.storage.getUrl(profile.kraCertStorageId as any)
        : null,
      profile.registrationDocStorageId
        ? ctx.storage.getUrl(profile.registrationDocStorageId as any)
        : null,
    ]);

    return { incorporationCertUrl, kraCertUrl, registrationDocUrl };
  },
});

export const getEmployerDetails = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") throw new Error("Unauthorized");

    let user: any;
    try {
      user = await ctx.db.get(args.userId as any);
    } catch {
      return null;
    }
    if (!user) return null;

    const profile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_employer", (q) => q.eq("employerId", user._id))
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
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") throw new Error("Unauthorized");

    let user: any;
    try {
      user = await ctx.db.get(args.userId as any);
    } catch {
      return null;
    }
    if (!user) return null;

    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", user._id))
      .collect();

    const applicationsWithJobs = await Promise.all(
      applications.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        return { ...app, job };
      })
    );

    // Return the raw storage ID — the client resolves it to a URL via serviceOrders.getFileUrl
    // onboarding.ts stores the raw storage ID in profile.resumeUrl; cvUpload.ts uses user.resumeStorageId
    const resumeStorageId: string | null =
      profile?.resumeUrl || (user as any).resumeStorageId || null;

    return {
      user,
      profile,
      applications: applicationsWithJobs,
      resumeStorageId,
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

    // Also delete the user from Clerk
    if (user.clerkId) {
      await ctx.scheduler.runAfter(0, internal.clerkActions.deleteClerkUser, {
        clerkId: user.clerkId,
      });
    }

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

    if (job.employerId) {
      await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerJobAction, {
        jobId: args.jobId,
        jobTitle: job.title,
        employerId: job.employerId,
        action: "published",
        expiresAt,
      });
    }

    return { success: true, expiresAt };
  },
});

// ─── Admin: Post a job on behalf of a registered employer ────────────────────
// Mirrors jobMutations.create but is admin-gated and stamps postedByAdmin=true.
// The job is attributed to the employer (employerId) so it appears in their
// dashboard and counts toward their stats — the admin is just the operator.
export const adminPostJobOnBehalf = mutation({
  args: {
    // Who the job belongs to
    employerId: v.id("users"),
    // Core job fields
    title: v.string(),
    companyName: v.string(),
    department: v.optional(v.string()),
    employmentType: v.string(),
    workplaceType: v.string(),
    location: v.string(),
    county: v.optional(v.string()),
    description: v.string(),
    responsibilities: v.string(),
    requirements: v.string(),
    requiredSkills: v.optional(v.array(v.string())),
    preferredSkills: v.optional(v.array(v.string())),
    niceToHave: v.optional(v.string()),
    salaryDisclosure: v.string(),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    currency: v.optional(v.string()),
    benefits: v.optional(v.string()),
    applicationDeadline: v.optional(v.string()),
    positions: v.number(),
    experienceLevel: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    // Admin-only fields
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") {
      throw new Error("Admin access required");
    }

    // Verify the target employer exists and is an employer
    const employer = await ctx.db.get(args.employerId);
    if (!employer) throw new Error("Employer not found");
    if (!employer.roles?.includes("employer") && employer.primaryRole !== "employer") {
      throw new Error("Target user is not an employer");
    }

    const { adminNote, ...jobFields } = args;

    const jobId = await ctx.db.insert("jobs", {
      ...jobFields,
      postedByAdmin: true,
      adminNote: adminNote ?? undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt:
        args.status === "published"
          ? Date.now() + 30 * 24 * 60 * 60 * 1000
          : undefined,
    });

    // Generate SEO slug: "senior-software-engineer-at-safaricom-km4abc12"
    const slugify = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const shortId = jobId.slice(-8);
    const slug = `${slugify(args.title)}-at-${slugify(args.companyName)}-${shortId}`;
    await ctx.db.patch(jobId, { slug });

    return { jobId, slug };
  },
});

// ─── Admin auth guard helper (inline) ─────────────────────────────────────────
async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const admin = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();
  if (!admin || (!admin.roles?.includes("admin") && admin.primaryRole !== "admin")) {
    throw new Error("Admin access required");
  }
  return admin;
}

// ─── Get a single job by ID (admin) ──────────────────────────────────────────
export const adminGetJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!admin || (!admin.roles?.includes("admin") && admin.primaryRole !== "admin")) {
      throw new Error("Admin access required");
    }
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    const [applicationsCount, viewsCount] = await Promise.all([
      ctx.db
        .query("applications")
        .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
        .collect()
        .then((a) => a.length),
      ctx.db
        .query("jobViews")
        .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
        .collect()
        .then((v) => v.length),
    ]);
    // Fetch employer profile for company logo
    let companyLogoUrl: string | undefined;
    let companyName: string | undefined;
    if (job.employerId) {
      const employerProfile = await ctx.db
        .query("employerProfiles")
        .withIndex("by_user", (q) => q.eq("userId", job.employerId as any))
        .first();
      if (employerProfile) {
        companyName = employerProfile.companyName;
        if (employerProfile.companyLogoStorageId) {
          companyLogoUrl = (await ctx.storage.getUrl(employerProfile.companyLogoStorageId)) || undefined;
        } else if (employerProfile.companyLogo) {
          companyLogoUrl = employerProfile.companyLogo;
        }
      }
    }
    return { ...job, applicationsCount, viewsCount, companyLogoUrl, employerCompanyName: companyName };
  },
});

// ─── Close / unpublish a job ──────────────────────────────────────────────────
export const adminCloseJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    await ctx.db.patch(args.jobId, { status: "closed", updatedAt: Date.now() });
    if (job.employerId) {
      await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerJobAction, {
        jobId: args.jobId,
        jobTitle: job.title,
        employerId: job.employerId,
        action: "closed",
      });
    }
    return { success: true };
  },
});

// ─── Archive a job ────────────────────────────────────────────────────────────
export const adminArchiveJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    await ctx.db.patch(args.jobId, { status: "archived", updatedAt: Date.now() });
    if (job.employerId) {
      await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerJobAction, {
        jobId: args.jobId,
        jobTitle: job.title,
        employerId: job.employerId,
        action: "archived",
      });
    }
    return { success: true };
  },
});

// ─── Toggle featured status ───────────────────────────────────────────────────
export const adminFeatureJob = mutation({
  args: { jobId: v.id("jobs"), featured: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    await ctx.db.patch(args.jobId, { featured: args.featured, updatedAt: Date.now() });
    if (job.employerId) {
      await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerJobAction, {
        jobId: args.jobId,
        jobTitle: job.title,
        employerId: job.employerId,
        action: args.featured ? "featured" : "unfeatured",
      });
    }
    return { success: true };
  },
});

// ─── Flag a job for policy review ────────────────────────────────────────────
export const adminFlagJob = mutation({
  args: { jobId: v.id("jobs"), reason: v.optional(v.string()), clear: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    if (args.clear) {
      await ctx.db.patch(args.jobId, { flagged: false, flagReason: undefined, updatedAt: Date.now() });
      if (job.employerId) {
        await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerJobAction, {
          jobId: args.jobId,
          jobTitle: job.title,
          employerId: job.employerId,
          action: "flag_cleared",
        });
      }
    } else {
      await ctx.db.patch(args.jobId, {
        flagged: true,
        flagReason: args.reason ?? "Flagged by admin",
        status: "closed",
        updatedAt: Date.now(),
      });
      if (job.employerId) {
        await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerJobAction, {
          jobId: args.jobId,
          jobTitle: job.title,
          employerId: job.employerId,
          action: "flagged",
          flagReason: args.reason,
        });
      }
    }
    return { success: true };
  },
});

// ─── Extend job expiry by N days ─────────────────────────────────────────────
export const adminExtendJobExpiry = mutation({
  args: { jobId: v.id("jobs"), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    const days = args.days ?? 30;
    const base = job.expiresAt && job.expiresAt > Date.now() ? job.expiresAt : Date.now();
    const expiresAt = base + days * 24 * 60 * 60 * 1000;
    await ctx.db.patch(args.jobId, {
      expiresAt,
      status: "published",
      updatedAt: Date.now(),
    });
    if (job.employerId) {
      await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerJobAction, {
        jobId: args.jobId,
        jobTitle: job.title,
        employerId: job.employerId,
        action: "extended",
        expiresAt,
      });
    }
    return { success: true, expiresAt };
  },
});

// ─── Hard delete a job ────────────────────────────────────────────────────────
export const adminDeleteJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    // Notify employer before deleting
    if (job.employerId) {
      await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerJobAction, {
        jobId: args.jobId,
        jobTitle: job.title,
        employerId: job.employerId,
        action: "deleted",
      });
    }
    // Delete all applications for this job first
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();
    await Promise.all(applications.map((a) => ctx.db.delete(a._id)));
    await ctx.db.delete(args.jobId);
    return { success: true };
  },
});

// ── Admin Invite Flow ─────────────────────────────────────────────────────────

/**
 * List all pending admin invites. Requires admins:invite permission.
 */
export const listInvites = query({
  args: {},
  handler: async (ctx) => {
    await assertAdminPermission(ctx, "admins:invite");
    const invites = await ctx.db.query("adminInvites").order("desc").collect();
    const roles = await ctx.db.query("adminRoles").collect();
    return invites.map((inv) => ({
      ...inv,
      role: roles.find((r) => r._id === inv.adminRoleId) ?? null,
    }));
  },
});

/**
 * Send an admin invite email.
 * Creates a pending invite record + schedules the email.
 * Requires admins:invite permission (super-admin only by default).
 */
export const sendAdminInvite = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    adminRoleId: v.optional(v.id("adminRoles")),
  },
  handler: async (ctx, args) => {
    await assertAdminPermission(ctx, "admins:invite");
    const { user } = await getAdminIdentity(ctx);

    // Normalise email
    const email = args.email.toLowerCase().trim();

    // Prevent duplicate active invites for the same email
    const existing = await ctx.db
      .query("adminInvites")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing && existing.status === "pending" && existing.inviteExpiresAt > Date.now()) {
      throw new Error("An active invite already exists for this email address.");
    }

    // Also prevent inviting someone who is already an admin
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existingUser?.isAdmin) {
      throw new Error("This email already belongs to an admin user.");
    }

    const inviteToken = crypto.randomUUID();
    const inviteExpiresAt = Date.now() + 48 * 60 * 60 * 1000; // 48 hours

    const inviteId = await ctx.db.insert("adminInvites", {
      email,
      fullName: args.fullName,
      adminRoleId: args.adminRoleId,
      inviteToken,
      inviteExpiresAt,
      status: "pending",
      invitedBy: user._id,
      createdAt: Date.now(),
    });

    // Fire-and-forget the email
    await ctx.scheduler.runAfter(0, internal.admin.sendAdminInviteEmail, {
      email,
      fullName: args.fullName,
      inviteToken,
    });

    return { inviteId, inviteToken };
  },
});

/**
 * Internal action — sends the invite email via Resend.
 * Kept internal so it cannot be called from the client directly.
 */
export const sendAdminInviteEmail = internalAction({
  args: {
    email: v.string(),
    fullName: v.string(),
    inviteToken: v.string(),
  },
  handler: async (_ctx, args) => {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const adminAppUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.kazicloud.com";
    const inviteUrl = `${adminAppUrl}/accept-invite?token=${args.inviteToken}`;
    const year = new Date().getFullYear();

    await resend.emails.send({
      from: "Kazicloud Admin <admin@kazicloud.com>",
      to: args.email,
      subject: "You've been invited to Kazicloud Admin",
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.08);">
    <!-- Header -->
    <div style="padding:28px 40px 24px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:12px;">
      <img src="https://kazicloud.com/images/kazicloud-logo.jpg" alt="Kazicloud" style="width:36px;height:36px;border-radius:8px;object-fit:cover;" />
      <span style="font-size:18px;font-weight:700;color:#0f172a;">Kazi<span style="color:#DC842C;">cloud</span></span>
    </div>
    <!-- Body -->
    <div style="padding:40px;">
      <p style="margin:0 0 6px;font-size:15px;color:#64748b;">Hello ${args.fullName},</p>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#0f172a;line-height:1.25;">You've been invited to<br/>the <span style="color:#DC842C;">Admin Panel</span></h1>
      <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.7;">
        A Kazicloud super-admin has granted you access to the admin panel. Click the button below to accept your invitation, set your password, and start managing the platform.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${inviteUrl}" style="display:inline-block;background:#DC842C;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;">Accept Invitation</a>
      </div>
      <p style="font-size:13px;color:#94a3b8;margin:0 0 8px;">Or paste this link in your browser:</p>
      <p style="font-size:13px;color:#DC842C;word-break:break-all;margin:0 0 24px;">${inviteUrl}</p>
      <div style="background:#fff3e0;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#c2410c;font-weight:600;">⏰ This invitation expires in 48 hours.</p>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">© ${year} Kazicloud. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    });
  },
});

/**
 * Accept an admin invite.
 * Called from the accept-invite page after the invitee creates their Clerk account.
 * No auth check — the token is the credential.
 */
export const acceptAdminInvite = mutation({
  args: {
    inviteToken: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("adminInvites")
      .withIndex("by_token", (q) => q.eq("inviteToken", args.inviteToken))
      .first();

    if (!invite) throw new Error("Invalid or unknown invite link.");
    if (invite.status !== "pending") throw new Error("This invitation has already been used.");
    if (invite.inviteExpiresAt < Date.now()) {
      await ctx.db.patch(invite._id, { status: "expired" });
      throw new Error("This invitation has expired. Please ask an admin to send a new one.");
    }

    // Mark invite accepted
    await ctx.db.patch(invite._id, { status: "accepted" });

    // Find or create the user record
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      // First time — create the user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: invite.email,
        fullName: invite.fullName,
        roles: ["admin"],
        primaryRole: "admin",
        isAdmin: true,
        adminRoleId: invite.adminRoleId,
      });
      return { userId };
    } else {
      // Existing user — promote to admin
      const existingRoles = user.roles ?? [];
      await ctx.db.patch(user._id, {
        isAdmin: true,
        adminRoleId: invite.adminRoleId,
        roles: existingRoles.includes("admin")
          ? existingRoles
          : [...existingRoles, "admin"],
        primaryRole: "admin",
      });
      return { userId: user._id };
    }
  },
});

/**
 * Validate an invite token (used by the accept-invite page to show name/email before sign-up).
 * No auth required — public query, token is the credential.
 */
export const getInviteByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("adminInvites")
      .withIndex("by_token", (q) => q.eq("inviteToken", args.token))
      .first();
    if (!invite) return null;
    const role = invite.adminRoleId ? await ctx.db.get(invite.adminRoleId) : null;
    return {
      email: invite.email,
      fullName: invite.fullName,
      status: invite.status,
      isExpired: invite.inviteExpiresAt < Date.now(),
      roleName: role?.name ?? null,
    };
  },
});

/**
 * Resend an existing invite (resets token + expiry).
 */
export const resendAdminInvite = mutation({
  args: { inviteId: v.id("adminInvites") },
  handler: async (ctx, args) => {
    await assertAdminPermission(ctx, "admins:invite");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found.");
    if (invite.status === "accepted") throw new Error("Invite already accepted.");

    const newToken = crypto.randomUUID();
    const newExpiry = Date.now() + 48 * 60 * 60 * 1000;

    await ctx.db.patch(args.inviteId, {
      inviteToken: newToken,
      inviteExpiresAt: newExpiry,
      status: "pending",
    });

    await ctx.scheduler.runAfter(0, internal.admin.sendAdminInviteEmail, {
      email: invite.email,
      fullName: invite.fullName,
      inviteToken: newToken,
    });

    return { success: true };
  },
});

/**
 * Cancel / delete a pending invite.
 */
export const cancelAdminInvite = mutation({
  args: { inviteId: v.id("adminInvites") },
  handler: async (ctx, args) => {
    await assertAdminPermission(ctx, "admins:invite");
    await ctx.db.delete(args.inviteId);
    return { success: true };
  },
});
