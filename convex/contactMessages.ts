import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// ── Public: submit a contact message from the marketing site ─────────────────
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim() || !args.email.trim() || !args.subject.trim() || !args.message.trim()) {
      throw new Error("All fields are required.");
    }
    const id = await ctx.db.insert("contactMessages", {
      name: args.name.trim(),
      email: args.email.trim().toLowerCase(),
      subject: args.subject.trim(),
      message: args.message.trim(),
      status: "unread",
      createdAt: Date.now(),
    });
    return { id };
  },
});

// ── Admin: list all messages with optional status filter ─────────────────────
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("all"),
        v.literal("unread"),
        v.literal("read"),
        v.literal("replied"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) {
      throw new Error("Unauthorized");
    }

    let messages;
    if (!args.status || args.status === "all") {
      messages = await ctx.db.query("contactMessages").order("desc").collect();
    } else {
      messages = await ctx.db
        .query("contactMessages")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    }
    return messages;
  },
});

// ── Admin: get unread count ───────────────────────────────────────────────────
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) return 0;

    const unread = await ctx.db
      .query("contactMessages")
      .withIndex("by_status", (q) => q.eq("status", "unread"))
      .collect();
    return unread.length;
  },
});

// ── Admin: mark message as read ───────────────────────────────────────────────
export const markRead = mutation({
  args: { id: v.id("contactMessages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) {
      throw new Error("Unauthorized");
    }
    const msg = await ctx.db.get(args.id);
    if (!msg) throw new Error("Message not found");
    if (msg.status === "unread") {
      await ctx.db.patch(args.id, { status: "read" });
    }
  },
});

// ── Admin: update status (archive, etc.) ─────────────────────────────────────
export const updateStatus = mutation({
  args: {
    id: v.id("contactMessages"),
    status: v.union(
      v.literal("read"),
      v.literal("replied"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// ── Admin: save reply payload after email is sent ─────────────────────────────
// Appends to the `replies` array so the full conversation is preserved.
// Migrates old single-reply records on first append.
export const saveReply = mutation({
  args: {
    id: v.id("contactMessages"),
    adminReply: v.string(),
    adminName: v.string(),
    // SMTP Message-ID returned by the email action — used for In-Reply-To threading
    emailMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) {
      throw new Error("Unauthorized");
    }
    const msg = await ctx.db.get(args.id);
    if (!msg) throw new Error("Message not found");

    // Migrate legacy single-reply record into the array on first append
    const existing = msg.replies ?? [];
    const migrated =
      existing.length === 0 && msg.adminReply
        ? [
            {
              role: "admin" as const,
              text: msg.adminReply,
              authorName: msg.repliedBy ?? "Admin",
              timestamp: msg.repliedAt ?? msg.createdAt,
            },
          ]
        : existing;

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "replied",
      replies: [
        ...migrated,
        {
          role: "admin" as const,
          text: args.adminReply,
          authorName: args.adminName,
          timestamp: now,
          ...(args.emailMessageId ? { emailMessageId: args.emailMessageId } : {}),
        },
      ],
      // Keep legacy fields updated to the latest reply for backward compat
      adminReply: args.adminReply,
      repliedAt: now,
      repliedBy: args.adminName,
    });
  },
});

// ── Inbound: save a user reply received via email (Resend inbound webhook) ────
// Called from the HTTP handler when a user replies to an admin email.
export const saveUserInboundReply = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    replyText: v.string(),
    // Local part of the In-Reply-To SMTP header (without angle brackets / domain)
    inReplyToMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const messages = await ctx.db
      .query("contactMessages")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .collect();

    if (messages.length === 0) {
      // No prior conversation — create a fresh contact message
      await ctx.db.insert("contactMessages", {
        name: args.name,
        email,
        subject: "Follow-up",
        message: args.replyText,
        status: "unread",
        createdAt: Date.now(),
      });
      return;
    }

    // Try to find the exact message by the In-Reply-To header value first
    let targetMsg = messages[0]!; // default: most recent
    if (args.inReplyToMessageId) {
      const matched = messages.find((m) =>
        m.replies?.some((r) => r.emailMessageId === args.inReplyToMessageId)
      );
      if (matched) targetMsg = matched;
    }

    const existing = targetMsg.replies ?? [];
    await ctx.db.patch(targetMsg._id, {
      status: "unread",
      replies: [
        ...existing,
        {
          role: "user" as const,
          text: args.replyText,
          authorName: args.name,
          timestamp: Date.now(),
        },
      ],
    });
  },
});

// ── Admin: paginated list (cursor pagination, 15 per page, preview data) ─────
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("all"),
        v.literal("unread"),
        v.literal("read"),
        v.literal("replied"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) {
      throw new Error("Unauthorized");
    }

    if (!args.status || args.status === "all") {
      return await ctx.db
        .query("contactMessages")
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      return await ctx.db
        .query("contactMessages")
        .withIndex("by_status", (q) => q.eq("status", args.status as "unread" | "read" | "replied" | "archived"))
        .order("desc")
        .paginate(args.paginationOpts);
    }
  },
});

// ── Admin: get a single message by ID (full detail for the detail panel) ─────
export const getById = query({
  args: { id: v.id("contactMessages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.get(args.id);
  },
});

// ── Admin: per-tab counts for badge display (independent of pagination) ───────
export const statusCounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) return null;

    const [allMsgs, unreadMsgs, readMsgs, repliedMsgs, archivedMsgs] = await Promise.all([
      ctx.db.query("contactMessages").collect(),
      ctx.db.query("contactMessages").withIndex("by_status", (q) => q.eq("status", "unread")).collect(),
      ctx.db.query("contactMessages").withIndex("by_status", (q) => q.eq("status", "read")).collect(),
      ctx.db.query("contactMessages").withIndex("by_status", (q) => q.eq("status", "replied")).collect(),
      ctx.db.query("contactMessages").withIndex("by_status", (q) => q.eq("status", "archived")).collect(),
    ]);

    return {
      all: allMsgs.length,
      unread: unreadMsgs.length,
      read: readMsgs.length,
      replied: repliedMsgs.length,
      archived: archivedMsgs.length,
    };
  },
});

// ── Admin: full-corpus search (bypasses pagination) ───────────────────────────
// Searches by name, email, subject; fuzzy-contains on message body.
export const search = query({
  args: {
    query: v.string(),
    status: v.optional(
      v.union(
        v.literal("all"),
        v.literal("unread"),
        v.literal("read"),
        v.literal("replied"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) {
      throw new Error("Unauthorized");
    }

    if (!args.query.trim()) return [];

    let messages;
    if (!args.status || args.status === "all") {
      messages = await ctx.db.query("contactMessages").order("desc").collect();
    } else {
      messages = await ctx.db
        .query("contactMessages")
        .withIndex("by_status", (q) => q.eq("status", args.status as "unread" | "read" | "replied" | "archived"))
        .order("desc")
        .collect();
    }

    const q = args.query.toLowerCase().trim();
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  },
});

// ── Admin: all messages from a given email — used for right-panel thread view ─
// Returns messages in ascending order so the thread reads top-to-bottom.
export const getThreadByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (!user.roles?.includes("admin") && user.primaryRole !== "admin")) {
      throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("contactMessages")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .order("asc")
      .collect();
  },
});
