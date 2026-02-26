import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Education
export const addEducation = mutation({
  args: {
    userId: v.id("users"),
    institution: v.string(),
    qualificationLevel: v.union(
      v.literal("certificate"),
      v.literal("diploma"),
      v.literal("degree"),
      v.literal("masters"),
      v.literal("phd"),
      v.literal("tvet")
    ),
    fieldOfStudy: v.string(),
    startYear: v.string(),
    endYear: v.string(),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;
    
    const existing = await ctx.db
      .query("education")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const id = await ctx.db.insert("education", {
      ...data,
      userId,
      order: existing.length,
    });
    
    return id;
  },
});

export const deleteEducation = mutation({
  args: {
    id: v.id("education"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateEducation = mutation({
  args: {
    id: v.id("education"),
    institution: v.optional(v.string()),
    qualificationLevel: v.optional(v.union(
      v.literal("certificate"),
      v.literal("diploma"),
      v.literal("degree"),
      v.literal("masters"),
      v.literal("phd"),
      v.literal("tvet")
    )),
    certificateType: v.optional(v.string()),
    fieldOfStudy: v.optional(v.string()),
    startYear: v.optional(v.string()),
    endYear: v.optional(v.string()),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});


// Skills
export const addSkill = mutation({
  args: {
    userId: v.id("users"),
    skillName: v.string(),
    category: v.union(
      v.literal("technical"),
      v.literal("soft"),
      v.literal("language"),
      v.literal("computer")
    ),
    proficiency: v.union(
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("skills", args);
    return id;
  },
});

export const deleteSkill = mutation({
  args: {
    id: v.id("skills"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Languages
export const addLanguage = mutation({
  args: {
    userId: v.id("users"),
    language: v.string(),
    proficiency: v.union(
      v.literal("basic"),
      v.literal("conversational"),
      v.literal("fluent"),
      v.literal("native")
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("languages", args);
    return id;
  },
});

export const deleteLanguage = mutation({
  args: {
    id: v.id("languages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
