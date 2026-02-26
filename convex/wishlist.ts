import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggle = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("savedJobs")
      .withIndex("by_user_and_job", (q) => 
        q.eq("userId", user._id).eq("jobId", args.jobId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    } else {
      await ctx.db.insert("savedJobs", {
        userId: user._id,
        jobId: args.jobId,
        savedAt: Date.now(),
      });
      return { saved: true };
    }
  },
});

export const isWishlisted = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return false;

    const saved = await ctx.db
      .query("savedJobs")
      .withIndex("by_user_and_job", (q) => 
        q.eq("userId", user._id).eq("jobId", args.jobId)
      )
      .first();

    return !!saved;
  },
});

export const getUserWishlist = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const savedJobs = await ctx.db
      .query("savedJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const jobs = await Promise.all(
      savedJobs.map(async (saved) => {
        const job = await ctx.db.get(saved.jobId);
        return job ? { ...job, savedAt: saved.savedAt } : null;
      })
    );

    return jobs.filter((job) => job !== null && job.status === "published");
  },
});
