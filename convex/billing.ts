import { v } from 'convex/values'
import { mutation, query, action } from './_generated/server'
import { api } from './_generated/api'

// Get current user's subscription
export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) return null

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .first()

    return subscription || {
      plan: 'free',
      status: 'active',
      jobPostingsRemaining: 3, // 3 free postings for new users
    }
  },
})

// Get billing history
export const getBillingHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) return []

    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()

    return transactions
  },
})

// Create payment transaction
export const createTransaction = mutation({
  args: {
    reference: v.string(),
    plan: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) throw new Error('User not found')

    const transactionId = await ctx.db.insert('transactions', {
      userId: user._id,
      reference: args.reference,
      plan: args.plan,
      amount: args.amount,
      currency: args.currency,
      status: 'pending',
      createdAt: Date.now(),
    })

    return transactionId
  },
})

// Verify payment and update subscription
export const verifyAndUpdateSubscription = action({
  args: {
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Verify payment with Paystack
      const url = `https://api.paystack.co/transaction/verify/${args.reference}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.status !== true) {
        return {
          success: false,
          message: data.message || 'Payment verification failed',
        }
      }

      // Update transaction status
      const transaction = await ctx.runQuery(
        api.billing.getTransactionByReference,
        { reference: args.reference }
      )

      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found',
        }
      }

      await ctx.runMutation(
        api.billing.updateTransactionStatus,
        {
          transactionId: transaction._id,
          status: 'success',
          paystackData: data.data,
          verifiedAt: Date.now(),
        }
      )

      // Create or update subscription
      const plan = data.data.metadata?.plan || 'basic'
      const jobPostings = plan === 'enterprise' ? -1 : plan === 'growth' ? 5 : plan === 'basic' ? 1 : 2
      const duration = (plan === 'enterprise' || plan === 'growth') ? 30 * 24 * 60 * 60 * 1000 : undefined // 30 days for monthly plans

      await ctx.runMutation(
        api.billing.createSubscriptionForUser,
        {
          userId: transaction.userId,
          plan: plan as 'free' | 'basic' | 'growth' | 'enterprise',
          jobPostings,
          duration,
        }
      )

      return {
        success: true,
        message: 'Payment verified and subscription updated',
        data: data.data,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('[Billing] Verification error:', errorMsg)
      return {
        success: false,
        message: `Verification error: ${errorMsg}`,
      }
    }
  },
})

// Helper queries and mutations for the action
export const getTransactionByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('transactions')
      .withIndex('by_reference', (q) => q.eq('reference', args.reference))
      .first()
  },
})

export const updateTransactionStatus = mutation({
  args: {
    transactionId: v.id('transactions'),
    status: v.union(v.literal('pending'), v.literal('success'), v.literal('failed')),
    paystackData: v.optional(v.any()),
    verifiedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.transactionId, {
      status: args.status,
      paystackData: args.paystackData,
      verifiedAt: args.verifiedAt,
    })
  },
})

export const createSubscriptionForUser = mutation({
  args: {
    userId: v.id('users'),
    plan: v.union(v.literal('free'), v.literal('basic'), v.literal('growth'), v.literal('enterprise')),
    jobPostings: v.number(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Expire old subscriptions
    const oldSubs = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    for (const sub of oldSubs) {
      await ctx.db.patch(sub._id, { status: 'expired' })
    }

    // Create new subscription
    await ctx.db.insert('subscriptions', {
      userId: args.userId,
      plan: args.plan,
      status: 'active',
      jobPostingsRemaining: args.jobPostings,
      startDate: Date.now(),
      endDate: args.duration ? Date.now() + args.duration : undefined,
      autoRenew: false,
    })
  },
})
export const decrementJobPostings = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) throw new Error('User not found')

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .first()

    if (!subscription) {
      throw new Error('No active subscription')
    }

    if (subscription.jobPostingsRemaining === 0) {
      throw new Error('No job postings remaining. Please upgrade your plan.')
    }

    if (subscription.jobPostingsRemaining > 0) {
      await ctx.db.patch(subscription._id, {
        jobPostingsRemaining: subscription.jobPostingsRemaining - 1,
      })
    }

    // -1 means unlimited, don't decrement
  },
})

// Check if user can post new jobs (subscription validation)
export const canPostNewJob = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { canPost: false, reason: 'Not authenticated' }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) return { canPost: false, reason: 'User not found' }

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .first()

    if (!subscription) {
      return { canPost: false, reason: 'No subscription found' }
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
      return { canPost: false, reason: 'Subscription not active' }
    }

    // Check if subscription has expired (for monthly plans: growth and enterprise)
    if (subscription.endDate && Date.now() > subscription.endDate) {
      return { canPost: false, reason: 'Subscription expired' }
    }

    // Check job postings remaining
    if (subscription.jobPostingsRemaining === 0) {
      return { canPost: false, reason: 'No job postings remaining' }
    }

    return { canPost: true, subscription }
  },
})

// Create initial free subscription for new employers
export const createInitialSubscription = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Check if user already has a subscription
    const existingSubscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (existingSubscription) {
      return // User already has a subscription
    }

    // Create initial free subscription with 3 job postings
    await ctx.db.insert('subscriptions', {
      userId: args.userId,
      plan: 'free',
      status: 'active',
      jobPostingsRemaining: 3,
      startDate: Date.now(),
      autoRenew: false,
    })
  },
})

// Admin queries
export const getAllSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const subscriptions = await ctx.db
      .query('subscriptions')
      .order('desc')
      .collect()

    // Get user and employer profile details for each subscription
    const subscriptionsWithUsers = await Promise.all(
      subscriptions.map(async (sub) => {
        const user = await ctx.db.get(sub.userId)
        
        if (!user) {
          return {
            ...sub,
            user: null,
          }
        }
        
        // Get employer profile for company name
        const employerProfile = await ctx.db
          .query('employerProfiles')
          .withIndex('by_user', (q) => q.eq('userId', sub.userId))
          .first()
        
        return {
          ...sub,
          user: {
            fullName: user.fullName || 'Unknown User',
            email: user.email,
            companyName: employerProfile?.companyName || user.fullName || 'No Company',
          },
        }
      })
    )

    return subscriptionsWithUsers
  },
})
