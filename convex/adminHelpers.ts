import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to add admin role to a user
// Run this from Convex dashboard to make a user an admin
export const makeUserAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    if (user.roles.includes("admin")) {
      return { success: true, message: "User is already an admin" };
    }

    await ctx.db.patch(user._id, {
      roles: [...user.roles, "admin"],
    });

    return { success: true, message: `Admin role added to ${args.email}` };
  },
});

// Helper function to remove admin role from a user
export const removeAdminRole = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    if (!user.roles.includes("admin")) {
      return { success: true, message: "User is not an admin" };
    }

    await ctx.db.patch(user._id, {
      roles: user.roles.filter((role) => role !== "admin"),
    });

    return { success: true, message: `Admin role removed from ${args.email}` };
  },
});
