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

/**
 * One-time bootstrap: promote the first super-admin by Convex user ID.
 * Finds the "Super Admin" role (created by seedDefaultRoles) and assigns it.
 * Safe to run from the Convex CLI without authentication.
 * No auth check — intentionally, for initial bootstrapping only.
 */
export const bootstrapSuperAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error(`User ${args.userId} not found`);

    const superAdminRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_name", (q) => q.eq("name", "Super Admin"))
      .first();
    if (!superAdminRole) throw new Error("Super Admin role not found. Run adminRoles:seedDefaultRoles first.");

    const existingRoles = user.roles ?? [];
    await ctx.db.patch(args.userId, {
      isAdmin: true,
      adminRoleId: superAdminRole._id,
      roles: existingRoles.includes("admin") ? existingRoles : [...existingRoles, "admin"],
      primaryRole: "admin",
    });

    return {
      success: true,
      userId: args.userId,
      email: user.email,
      roleName: superAdminRole.name,
      permissions: superAdminRole.permissions,
    };
  },
});
