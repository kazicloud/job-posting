/**
 * Admin RBAC permission helpers — KaziCloud Platform
 *
 * Permission strings follow "resource:action" format, e.g.:
 *   "employers:view"   "employers:verify"   "jobs:delete"   "*"
 *
 * Super-admin roles carry ["*"] which bypasses all checks.
 *
 * Industry pattern (Stripe / Linear / GitHub teams):
 *  - Roles are named entities stored in DB with a permissions[] array.
 *  - Every server-side mutation/query that touches sensitive data calls
 *    assertAdminPermission() before doing anything.
 *  - The client reads the permissions list to show/hide UI — but the
 *    server is the real enforcer.
 */

import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// ── Permission definitions ────────────────────────────────────────────────────

export const ADMIN_PERMISSIONS = {
  // ── Dashboard ─────────────────────────────────────────────────
  "dashboard:view": "View platform statistics",

  // ── Employers ─────────────────────────────────────────────────
  "employers:view": "View employer accounts",
  "employers:verify": "Approve or reject employer verification",
  "employers:suspend": "Suspend / unsuspend employer accounts",
  "employers:edit": "Edit employer profiles",

  // ── Job Seekers ───────────────────────────────────────────────
  "job_seekers:view": "View job seeker accounts",
  "job_seekers:manage": "Manage job seeker accounts",

  // ── Jobs ──────────────────────────────────────────────────────
  "jobs:view": "View all job listings",
  "jobs:feature": "Feature or flag job listings",
  "jobs:delete": "Delete job listings",
  "jobs:post": "Post jobs on behalf of employers",

  // ── Applications ──────────────────────────────────────────────
  "applications:view": "View all applications",

  // ── Messages & Support ────────────────────────────────────────
  "messages:view": "View contact form messages",
  "messages:reply": "Reply to contact messages",
  "chats:view": "View all in-app support chats",
  "chats:reply": "Reply to support chats",
  "chats:assign": "Assign support chats to admins",

  // ── Subscriptions & Services ──────────────────────────────────
  "subscriptions:view": "View subscription data",
  "services:view": "View service orders",
  "services:manage": "Update service order status & deliverables",

  // ── Settings & Admin Management (Super-Admin only by default) ─
  "settings:view": "View platform settings",
  "roles:view": "View admin roles",
  "roles:create": "Create admin roles",
  "roles:update": "Update admin roles",
  "roles:delete": "Delete admin roles",
  "admins:view": "View admin users",
  "admins:invite": "Invite new admins",
  "admins:update": "Update admin roles",
  "admins:remove": "Remove admin access",
} as const;

export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fetches the current user from Convex along with their admin role and
 * permissions. Throws if the user is not authenticated or not in the DB.
 */
export async function getAdminIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new ConvexError("User not found");

  const isAdmin =
    user.isAdmin === true ||
    user.roles?.includes("admin") ||
    user.primaryRole === "admin";

  const adminRole = user.adminRoleId ? await ctx.db.get(user.adminRoleId) : null;
  const permissions: string[] = adminRole?.permissions ?? [];

  return { user, isAdmin, adminRole, permissions };
}

/**
 * Throws a ConvexError if the current user doesn't have the given permission.
 * Super-admin ("*") bypasses all checks.
 */
export async function assertAdminPermission(
  ctx: QueryCtx | MutationCtx,
  permission: AdminPermission | string
) {
  const { isAdmin, permissions } = await getAdminIdentity(ctx);

  if (!isAdmin) throw new ConvexError("Forbidden: admin access required");

  // Wildcard — super-admin
  if (permissions.includes("*")) return;

  if (!permissions.includes(permission)) {
    throw new ConvexError(`Forbidden: missing permission "${permission}"`);
  }
}

/**
 * Returns true if the current user has the given permission, false otherwise.
 * Does NOT throw.
 */
export async function hasAdminPermission(
  ctx: QueryCtx | MutationCtx,
  permission: AdminPermission | string
): Promise<boolean> {
  try {
    const { isAdmin, permissions } = await getAdminIdentity(ctx);
    if (!isAdmin) return false;
    return permissions.includes("*") || permissions.includes(permission);
  } catch {
    return false;
  }
}

/**
 * Asserts the current user is a super-admin (has "*" permission).
 * Used for role & admin management operations.
 */
export async function assertSuperAdmin(ctx: QueryCtx | MutationCtx) {
  const { isAdmin, permissions } = await getAdminIdentity(ctx);
  if (!isAdmin || !permissions.includes("*")) {
    throw new ConvexError("Forbidden: super-admin access required");
  }
}
