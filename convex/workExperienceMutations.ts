import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addWorkExperience = mutation({
  args: {
    userId: v.id("users"),
    company: v.string(),
    title: v.string(),
    industry: v.string(),
    employmentType: v.union(
      v.literal("permanent"),
      v.literal("contract"),
      v.literal("internship"),
      v.literal("freelance"),
      v.literal("attachment")
    ),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    currentlyWorking: v.boolean(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;
    
    // Get current count for ordering
    const existing = await ctx.db
      .query("workExperience")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const id = await ctx.db.insert("workExperience", {
      ...data,
      userId,
      order: existing.length,
    });
    
    return id;
  },
});

export const updateWorkExperience = mutation({
  args: {
    id: v.id("workExperience"),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    industry: v.optional(v.string()),
    employmentType: v.optional(v.union(
      v.literal("permanent"),
      v.literal("contract"),
      v.literal("internship"),
      v.literal("freelance"),
      v.literal("attachment")
    )),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    currentlyWorking: v.optional(v.boolean()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data as any);
    return id;
  },
});

export const deleteWorkExperience = mutation({
  args: {
    id: v.id("workExperience"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
