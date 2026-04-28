import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Submit a profile change request (employer only)
export const submitChangeRequest = mutation({
  args: { reason: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check for existing pending request
    const existing = await ctx.db
      .query("profileChangeRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const hasPending = existing.some((r) => r.status === "pending");
    if (hasPending) throw new Error("You already have a pending change request");

    return await ctx.db.insert("profileChangeRequests", {
      userId: user._id,
      reason: args.reason,
      status: "pending",
    });
  },
});

// Get current user's latest change request status
export const getMyChangeRequest = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    const requests = await ctx.db
      .query("profileChangeRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Return the most recent one
    return requests.sort((a, b) => b._creationTime - a._creationTime)[0] || null;
  },
});

// Admin: get change requests for a specific employer
export const getChangeRequestsForUser = query({
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
      .query("profileChangeRequests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Admin: get all pending change requests
export const getPendingChangeRequests = query({
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
      .query("profileChangeRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Attach user info
    return await Promise.all(
      pending.map(async (req) => {
        const user = await ctx.db.get(req.userId);
        const profile = await ctx.db
          .query("employerProfiles")
          .withIndex("by_user", (q) => q.eq("userId", req.userId))
          .first();
        return {
          ...req,
          userName: user?.fullName,
          userEmail: user?.email,
          companyName: profile?.companyName,
        };
      })
    );
  },
});

// Admin: approve or reject a change request
export const resolveChangeRequest = mutation({
  args: {
    requestId: v.id("profileChangeRequests"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
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

    await ctx.db.patch(args.requestId, {
      status: args.status,
      adminNote: args.adminNote,
      resolvedAt: Date.now(),
      resolvedBy: admin._id,
    });

    return { success: true };
  },
});
