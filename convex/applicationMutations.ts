import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    jobId: v.id("jobs"),
    jobSeekerId: v.id("users"),
    coverLetter: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const applicationId = await ctx.db.insert("applications", {
      ...args,
      status: "submitted",
    });
    return applicationId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("applications"),
    status: v.union(
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("shortlisted"),
      v.literal("interview"),
      v.literal("rejected"),
      v.literal("accepted")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
