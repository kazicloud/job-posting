import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveCVFile = mutation({
  args: {
    storageId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Update user record with CV storage ID
    await ctx.db.patch(args.userId, {
      resumeStorageId: args.storageId,
    });

    return args.storageId;
  },
});
