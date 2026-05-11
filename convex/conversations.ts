import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function requireAuth(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> }; db: { query: Function } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: { eq: Function }) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  return user;
}

async function getAdminUser(ctx: { db: { query: Function } }) {
  const admin = await ctx.db
    .query("users")
    .withIndex("by_primary_role", (q: { eq: Function }) => q.eq("primaryRole", "admin"))
    .first();
  return admin;
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * List all conversations for the current user, sorted by most recent message.
 * Enriches each conversation with the other participant's display info.
 */
export const listMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];

    // Conversations where I am participantA
    const asA = await ctx.db
      .query("conversations")
      .withIndex("by_participant_a", (q) => q.eq("participantA", me._id))
      .collect();

    // Conversations where I am participantB
    const asB = await ctx.db
      .query("conversations")
      .withIndex("by_participant_b", (q) => q.eq("participantB", me._id))
      .collect();

    const all = [
      ...asA.filter((c) => !c.deletedByA),
      ...asB.filter((c) => !c.deletedByB),
    ].sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    // Enrich with other participant info
    const enriched = await Promise.all(
      all.map(async (conv) => {
        const otherId = conv.participantA === me._id ? conv.participantB : conv.participantA;
        const other = await ctx.db.get(otherId);
        const isA = conv.participantA === me._id;
        return {
          ...conv,
          otherUser: other
            ? {
                _id: other._id,
                fullName: other.fullName ?? other.email,
                primaryRole: other.primaryRole,
                profilePhoto: other.profilePhoto ?? null,
              }
            : null,
          myUnread: isA ? conv.unreadA : conv.unreadB,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get messages in a conversation. Returns null if user is not a participant.
 */
export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return null;

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return null;
    if (conv.participantA !== me._id && conv.participantB !== me._id) return null;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_and_time", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    // Enrich each message with sender display name
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          ...msg,
          senderName: sender?.fullName ?? sender?.email ?? "Unknown",
          senderPhoto: sender?.profilePhoto ?? null,
          isMe: msg.senderId === me._id,
        };
      })
    );

    return { conversation: conv, messages: enriched, myId: me._id };
  },
});

/**
 * Get unread message count across all conversations for nav badge.
 */
export const totalUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return 0;

    const asA = await ctx.db
      .query("conversations")
      .withIndex("by_participant_a", (q) => q.eq("participantA", me._id))
      .collect();
    const asB = await ctx.db
      .query("conversations")
      .withIndex("by_participant_b", (q) => q.eq("participantB", me._id))
      .collect();

    const totalA = asA.filter((c) => !c.deletedByA).reduce((s, c) => s + c.unreadA, 0);
    const totalB = asB.filter((c) => !c.deletedByB).reduce((s, c) => s + c.unreadB, 0);
    return totalA + totalB;
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

/**
 * Open (or fetch existing) conversation with admin.
 * Available to any authenticated user.
 */
export const getOrCreateAdminConversation = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const admin = await getAdminUser(ctx);
    if (!admin) throw new Error("Admin not found");

    // Check if conversation already exists (me → admin or admin → me)
    const existing =
      (await ctx.db
        .query("conversations")
        .withIndex("by_participants", (q) =>
          q.eq("participantA", me._id).eq("participantB", admin._id)
        )
        .first()) ??
      (await ctx.db
        .query("conversations")
        .withIndex("by_participants", (q) =>
          q.eq("participantA", admin._id).eq("participantB", me._id)
        )
        .first());

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participantA: me._id,
      participantB: admin._id,
      lastMessageAt: Date.now(),
      lastMessagePreview: "",
      unreadA: 0,
      unreadB: 0,
    });
  },
});

/**
 * Employer opens a conversation with a job seeker.
 * Validates that the job seeker has applied to one of the employer's jobs.
 */
export const getOrCreateEmployerConversation = mutation({
  args: {
    jobSeekerId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    if (me.primaryRole !== "employer" && !me.roles.includes("employer") && me.primaryRole !== "admin") {
      throw new Error("Only employers can initiate conversations with job seekers");
    }

    // Validate: job seeker must have applied to one of this employer's jobs
    if (me.primaryRole !== "admin") {
      const employerJobs = await ctx.db
        .query("jobs")
        .withIndex("by_employer", (q) => q.eq("employerId", me._id))
        .collect();
      const jobIds = employerJobs.map((j) => j._id);

      const applications = await ctx.db
        .query("applications")
        .withIndex("by_job_seeker", (q) => q.eq("jobSeekerId", args.jobSeekerId))
        .collect();

      const hasApplied = applications.some((app) => jobIds.includes(app.jobId));
      if (!hasApplied) {
        throw new Error("This job seeker has not applied to any of your jobs");
      }
    }

    // Check existing
    const existing =
      (await ctx.db
        .query("conversations")
        .withIndex("by_participants", (q) =>
          q.eq("participantA", me._id).eq("participantB", args.jobSeekerId)
        )
        .first()) ??
      (await ctx.db
        .query("conversations")
        .withIndex("by_participants", (q) =>
          q.eq("participantA", args.jobSeekerId).eq("participantB", me._id)
        )
        .first());

    if (existing) return existing._id;

    // Get job info for display
    let jobTitle: string | undefined;
    let companyName: string | undefined;
    if (args.jobId) {
      const job = await ctx.db.get(args.jobId);
      if (job) {
        jobTitle = job.title;
        companyName = job.companyName;
      }
    }

    return await ctx.db.insert("conversations", {
      participantA: me._id,
      participantB: args.jobSeekerId,
      jobId: args.jobId,
      jobTitle,
      companyName,
      lastMessageAt: Date.now(),
      lastMessagePreview: "",
      unreadA: 0,
      unreadB: 0,
    });
  },
});

/**
 * Send a message in a conversation.
 * Both participants can send once the conversation exists.
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const text = args.text.trim();
    if (!text) throw new Error("Message cannot be empty");
    if (text.length > 4000) throw new Error("Message too long");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) throw new Error("User not found");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const isA = conv.participantA === me._id;
    const isB = conv.participantB === me._id;
    if (!isA && !isB) throw new Error("Not a participant in this conversation");

    const preview = text.length > 80 ? text.slice(0, 80) + "…" : text;
    const now = Date.now();

    await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      senderId: me._id,
      text,
      createdAt: now,
    });

    // Update conversation metadata: increment other participant's unread count
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessagePreview: preview,
      unreadA: isB ? conv.unreadA + 1 : conv.unreadA,
      unreadB: isA ? conv.unreadB + 1 : conv.unreadB,
      // Un-delete for both if either had soft-deleted
      deletedByA: false,
      deletedByB: false,
    });
  },
});

/**
 * Mark all messages in a conversation as read for the current user.
 */
export const markConversationRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return;

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;

    const isA = conv.participantA === me._id;
    const isB = conv.participantB === me._id;
    if (!isA && !isB) return;

    await ctx.db.patch(args.conversationId, {
      unreadA: isA ? 0 : conv.unreadA,
      unreadB: isB ? 0 : conv.unreadB,
    });
  },
});

/**
 * Internal mutation: post a system/automated message on behalf of a given sender.
 * Used by background actions (e.g. interview scheduled notifications).
 */
export const sendMessageInternal = internalMutation({
  args: {
    senderId: v.id("users"),
    recipientId: v.id("users"),
    text: v.string(),
    jobId: v.optional(v.id("jobs")),
    jobTitle: v.optional(v.string()),
    companyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const text = args.text.trim();
    if (!text) return;

    // Find or create conversation
    const existing =
      (await ctx.db
        .query("conversations")
        .withIndex("by_participants", (q) =>
          q.eq("participantA", args.senderId).eq("participantB", args.recipientId)
        )
        .first()) ??
      (await ctx.db
        .query("conversations")
        .withIndex("by_participants", (q) =>
          q.eq("participantA", args.recipientId).eq("participantB", args.senderId)
        )
        .first());

    const convId = existing
      ? existing._id
      : await ctx.db.insert("conversations", {
          participantA: args.senderId,
          participantB: args.recipientId,
          jobId: args.jobId,
          jobTitle: args.jobTitle,
          companyName: args.companyName,
          lastMessageAt: Date.now(),
          lastMessagePreview: "",
          unreadA: 0,
          unreadB: 0,
        });

    // If conversation already existed but jobTitle changed, update it
    if (existing && args.jobTitle && existing.jobTitle !== args.jobTitle) {
      await ctx.db.patch(convId, { jobTitle: args.jobTitle, companyName: args.companyName });
    }

    const conv = await ctx.db.get(convId);
    if (!conv) return;

    const isA = conv.participantA === args.senderId;
    const preview = text.length > 80 ? text.slice(0, 80) + "…" : text;
    const now = Date.now();

    await ctx.db.insert("chatMessages", {
      conversationId: convId,
      senderId: args.senderId,
      text,
      createdAt: now,
    });

    await ctx.db.patch(convId, {
      lastMessageAt: now,
      lastMessagePreview: preview,
      // Recipient always gets an unread increment
      unreadA: isA ? conv.unreadA : conv.unreadA + 1,
      unreadB: isA ? conv.unreadB + 1 : conv.unreadB,
      deletedByA: false,
      deletedByB: false,
    });
  },
});
