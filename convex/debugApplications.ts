import { query } from "./_generated/server";
import { v } from "convex/values";

export const checkUserApplications = query({
  args: { fullName: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("fullName"), args.fullName))
      .first();

    if (!user) return { error: "User not found" };

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", user._id))
      .order("desc")
      .collect();

    const lastApplication = applications[0];
    
    if (!lastApplication) {
      return { 
        user: user.fullName,
        totalApplications: 0,
        lastApplicationDate: null,
        daysSince: null
      };
    }

    const daysSince = Math.floor((Date.now() - lastApplication._creationTime) / (1000 * 60 * 60 * 24));

    return {
      user: user.fullName,
      totalApplications: applications.length,
      lastApplicationDate: new Date(lastApplication._creationTime).toISOString(),
      lastApplicationTimestamp: lastApplication._creationTime,
      currentTimestamp: Date.now(),
      daysSince,
    };
  },
});
