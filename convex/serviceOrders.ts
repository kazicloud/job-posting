import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    serviceType: v.union(
      v.literal("ats_cv"),
      v.literal("cv_revamp"),
      v.literal("job_search_support"),
      v.literal("career_coaching")
    ),
    amount: v.number(),
    currency: v.string(),
    requirements: v.optional(v.string()),
    paymentReference: v.optional(v.string()),
    uploadedFileStorageId: v.optional(v.string()),
    uploadedFileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("serviceOrders", {
      userId: user._id,
      serviceType: args.serviceType,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      paymentReference: args.paymentReference,
      requirements: args.requirements,
      uploadedFileStorageId: args.uploadedFileStorageId,
      uploadedFileName: args.uploadedFileName,
      createdAt: Date.now(),
    });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("serviceOrders")
      .order("desc")
      .collect();

    // Get user details for each order
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          user: user ? {
            fullName: user.fullName,
            email: user.email,
          } : null,
        };
      })
    );

    return ordersWithUsers;
  },
});

export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("serviceOrders")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("serviceOrders"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    assignedTo: v.optional(v.id("users")),
    deliverables: v.optional(v.string()),
    deliverableFileStorageId: v.optional(v.string()),
    deliverableFileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
    };

    if (args.assignedTo) updates.assignedTo = args.assignedTo;
    if (args.deliverables) updates.deliverables = args.deliverables;
    if (args.deliverableFileStorageId) updates.deliverableFileStorageId = args.deliverableFileStorageId;
    if (args.deliverableFileName) updates.deliverableFileName = args.deliverableFileName;
    if (args.status === "completed") updates.completedAt = Date.now();

    return await ctx.db.patch(args.orderId, updates);
  },
});

export const getById = query({
  args: { orderId: v.id("serviceOrders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const user = await ctx.db.get(order.userId);
    return {
      ...order,
      user: user ? {
        fullName: user.fullName,
        email: user.email,
      } : null,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId as any);
  },
});
