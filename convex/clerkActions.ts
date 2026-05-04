"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Delete a user from Clerk via the Backend API.
 * Called after the Convex user record has been removed.
 */
export const deleteClerkUser = internalAction({
  args: { clerkId: v.string() },
  handler: async (_ctx, args) => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error("CLERK_SECRET_KEY not set — cannot delete Clerk user");
      return { success: false, error: "missing_secret_key" };
    }

    const response = await fetch(
      `https://api.clerk.com/v1/users/${args.clerkId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok || response.status === 404) {
      // 404 means already deleted — that's fine
      return { success: true };
    }

    const body = await response.text();
    console.error(`Failed to delete Clerk user ${args.clerkId}: ${response.status} ${body}`);
    return { success: false, error: body };
  },
});
