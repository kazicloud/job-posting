import { query } from "./_generated/server";
import { v } from "convex/values";

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const workExperience = await ctx.db
      .query("workExperience")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const education = await ctx.db
      .query("education")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const skills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const languages = await ctx.db
      .query("languages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      ...user,
      workExperience: workExperience.sort((a, b) => a.order - b.order),
      education: education.sort((a, b) => a.order - b.order),
      skills,
      languages,
    };
  },
});

export const getWorkExperience = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workExperience")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getEducation = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("education")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getSkills = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
