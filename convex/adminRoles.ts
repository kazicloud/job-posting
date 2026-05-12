/**
 * Admin Roles — CRUD for the adminRoles table.
 *
 * All write operations require super-admin ("*") permission.
 * Read operations require "roles:view" permission.
 *
 * A seeded "Super Admin" role (permissions: ["*"]) is automatically
 * created the first time `seed` is called, or manually via the
 * Convex dashboard.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { assertAdminPermission, assertSuperAdmin, getAdminIdentity } from "./adminAuthHelpers";

// ── Queries ───────────────────────────────────────────────────────────────────

/** List all admin roles. Requires roles:view. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await assertAdminPermission(ctx, "roles:view");
    return await ctx.db.query("adminRoles").collect();
  },
});

/** Get a single role by ID. */
export const get = query({
  args: { id: v.id("adminRoles") },
  handler: async (ctx, args) => {
    await assertAdminPermission(ctx, "roles:view");
    return await ctx.db.get(args.id);
  },
});

/**
 * Returns the current admin user's role and permissions.
 * Used by the admin layout to gate nav items client-side.
 * Any authenticated admin can call this.
 */
export const getCurrentAdminRole = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { user, isAdmin, adminRole, permissions } = await getAdminIdentity(ctx);
      if (!isAdmin) return null;
      return {
        userId: user._id,
        email: user.email,
        fullName: user.fullName ?? user.email,
        isAdmin,
        role: adminRole
          ? { _id: adminRole._id, name: adminRole.name, permissions }
          : null,
        permissions,
        isSuperAdmin: permissions.includes("*"),
      };
    } catch {
      return null;
    }
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

/** Create a new role. Requires super-admin. */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertSuperAdmin(ctx);
    const now = Date.now();
    return await ctx.db.insert("adminRoles", {
      name: args.name,
      description: args.description,
      permissions: args.permissions,
      isDefault: args.isDefault,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update an existing role. Requires super-admin. */
export const update = mutation({
  args: {
    id: v.id("adminRoles"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertSuperAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Role not found.");
    if (existing.permissions.includes("*")) {
      throw new Error("The Super Admin role is protected and cannot be modified.");
    }
    const { id, ...rest } = args;
    const patch: Record<string, unknown> = { ...rest, updatedAt: Date.now() };
    return await ctx.db.patch(id, patch);
  },
});

/** Delete a role. Requires super-admin. Cannot delete a role still assigned to admins. */
export const remove = mutation({
  args: { id: v.id("adminRoles") },
  handler: async (ctx, args) => {
    await assertSuperAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Role not found.");
    if (existing.permissions.includes("*")) {
      throw new Error("The Super Admin role is protected and cannot be deleted.");
    }
    // Safety: check no admin currently uses this role
    const assigned = await ctx.db
      .query("users")
      .withIndex("by_is_admin", (q) => q.eq("isAdmin", true))
      .collect();
    const inUse = assigned.some((u) => u.adminRoleId === args.id);
    if (inUse) {
      throw new Error("Cannot delete a role that is still assigned to one or more admins. Reassign them first.");
    }
    return await ctx.db.delete(args.id);
  },
});

/**
 * Seed the default roles if they don't exist yet.
 * Run once from the Convex dashboard on first deploy.
 * Idempotent — safe to call multiple times.
 */
export const seedDefaultRoles = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("adminRoles").collect();
    const existingNames = new Set(existing.map((r) => r.name));
    const now = Date.now();
    const created: string[] = [];

    const defaults = [
      {
        name: "Super Admin",
        description: "Full unrestricted access to all platform features and settings.",
        permissions: ["*"],
        isDefault: false,
      },
      {
        name: "Support Agent",
        description: "Can view all data and handle support chats and contact messages.",
        permissions: [
          "dashboard:view",
          "employers:view",
          "job_seekers:view",
          "jobs:view",
          "applications:view",
          "messages:view",
          "messages:reply",
          "chats:view",
          "chats:reply",
          "services:view",
          "services:manage",
          "subscriptions:view",
        ],
        isDefault: true,
      },
      {
        name: "Content Moderator",
        description: "Can review and manage jobs and employer verifications.",
        permissions: [
          "dashboard:view",
          "employers:view",
          "employers:verify",
          "employers:suspend",
          "employers:edit",
          "jobs:view",
          "jobs:feature",
          "jobs:delete",
          "applications:view",
        ],
        isDefault: false,
      },
    ];

    for (const role of defaults) {
      if (!existingNames.has(role.name)) {
        await ctx.db.insert("adminRoles", { ...role, createdAt: now, updatedAt: now });
        created.push(role.name);
      }
    }

    return { created, skipped: defaults.length - created.length };
  },
});
