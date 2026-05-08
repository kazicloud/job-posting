import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─── Employer: submit or update pending profile edits ────────────────────────
// Upserts: merges new changes into any existing pending record so the employer
// can save section-by-section and all changes accumulate into one pending edit.
export const submitPendingEdits = mutation({
  args: { changes: v.any() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("employerPendingEdits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) {
      // Merge new changes into the existing pending record
      const merged = { ...(existing.changes as object), ...(args.changes as object) };
      await ctx.db.patch(existing._id, {
        changes: merged,
        submittedAt: Date.now(),
      });
      // Re-notify admin with updated field count (only on first submission; suppress on subsequent merges
      // by checking whether the record was previously empty — always notify to keep admin up to date)
      const ep = await ctx.db
        .query("employerProfiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      await ctx.scheduler.runAfter(0, internal.emails.notifyAdminPendingEditsInternal, {
        employerName: user.fullName || user.email || "Employer",
        companyName: ep?.companyName || "Company",
        employerEmail: user.email || "",
        fieldCount: Object.keys(merged).length,
        employerId: user._id,
      });
      return existing._id;
    }

    const newId = await ctx.db.insert("employerPendingEdits", {
      userId: user._id,
      changes: args.changes,
      status: "pending",
      submittedAt: Date.now(),
    });
    const ep = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    await ctx.scheduler.runAfter(0, internal.emails.notifyAdminPendingEditsInternal, {
      employerName: user.fullName || user.email || "Employer",
      companyName: ep?.companyName || "Company",
      employerEmail: user.email || "",
      fieldCount: Object.keys(args.changes as object).length,
      employerId: user._id,
    });
    return newId;
  },
});

// ─── Employer: cancel their pending edits ────────────────────────────────────
export const cancelPendingEdits = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("employerPendingEdits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// ─── Employer: get their own pending edits ───────────────────────────────────
export const getMyPendingEdits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return null;

    return await ctx.db
      .query("employerPendingEdits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
  },
});

// ─── Admin: get pending edits for a specific employer ────────────────────────
export const getPendingEditsForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("employerPendingEdits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
  },
});

// ─── Admin: get all pending edits across all employers ───────────────────────
export const getAllPendingEdits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!admin?.roles?.includes("admin") && admin?.primaryRole !== "admin") {
      throw new Error("Unauthorized");
    }

    const pending = await ctx.db
      .query("employerPendingEdits")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return await Promise.all(
      pending.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        const epProfile = await ctx.db
          .query("employerProfiles")
          .withIndex("by_user", (q) => q.eq("userId", record.userId))
          .first();
        return {
          ...record,
          userName: user?.fullName,
          userEmail: user?.email,
          companyName: epProfile?.companyName,
          currentProfile: epProfile,
        };
      })
    );
  },
});

// ─── Admin: approve pending edits (applies to live profile) ──────────────────
export const approvePendingEdits = mutation({
  args: {
    editId: v.id("employerPendingEdits"),
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
      throw new Error("Unauthorized");
    }

    const record = await ctx.db.get(args.editId);
    if (!record || record.status !== "pending") {
      throw new Error("Pending edit not found or already resolved");
    }

    const epProfile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", record.userId))
      .first();
    if (!epProfile) throw new Error("Employer profile not found");

    // Apply the proposed changes to the live employer profile
    await ctx.db.patch(epProfile._id, record.changes as any);

    // Mark the pending edit as approved
    await ctx.db.patch(args.editId, {
      status: "approved",
      reviewedAt: Date.now(),
      reviewedBy: admin._id,
      adminNote: args.adminNote,
    });

    // Notify employer by email
    const employer = await ctx.db.get(record.userId);
    if (employer?.email) {
      await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerEditsApproved, {
        employerEmail: employer.email,
        employerName: employer.fullName || employer.email,
        companyName: epProfile.companyName || "Your Company",
        fieldCount: Object.keys(record.changes as object).length,
        adminNote: args.adminNote,
      });
    }

    return { userId: record.userId };
  },
});

// ─── Admin: reject pending edits ─────────────────────────────────────────────
export const rejectPendingEdits = mutation({
  args: {
    editId: v.id("employerPendingEdits"),
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
      throw new Error("Unauthorized");
    }

    const record = await ctx.db.get(args.editId);
    if (!record || record.status !== "pending") {
      throw new Error("Pending edit not found or already resolved");
    }

    await ctx.db.patch(args.editId, {
      status: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: admin._id,
      adminNote: args.adminNote,
    });

    // Notify employer by email
    const employer = await ctx.db.get(record.userId);
    const epProfile = await ctx.db
      .query("employerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", record.userId))
      .first();
    if (employer?.email) {
      await ctx.scheduler.runAfter(0, internal.emails.notifyEmployerEditsRejected, {
        employerEmail: employer.email,
        employerName: employer.fullName || employer.email,
        companyName: epProfile?.companyName || "Your Company",
        fieldCount: Object.keys(record.changes as object).length,
        adminNote: args.adminNote,
      });
    }

    return { userId: record.userId };
  },
});
