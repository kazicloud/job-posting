import { mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const clearAllDataExceptAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    
    // Find admin users (keep them)
    const adminUsers = allUsers.filter(user => user.roles?.includes("admin"));
    const adminUserIds = new Set(adminUsers.map(u => u._id));
    
    // Delete all non-admin users
    const nonAdminUsers = allUsers.filter(user => !user.roles?.includes("admin"));
    
    // Store Clerk IDs for deletion
    const clerkIdsToDelete = nonAdminUsers
      .map(user => user.clerkId)
      .filter((id): id is string => Boolean(id));
    
    for (const user of nonAdminUsers) {
      await ctx.db.delete(user._id);
    }
    
    // Delete all job seeker profiles
    const jobSeekerProfiles = await ctx.db.query("jobSeekerProfiles").collect();
    for (const profile of jobSeekerProfiles) {
      await ctx.db.delete(profile._id);
    }
    
    // Delete all employer profiles
    const employerProfiles = await ctx.db.query("employerProfiles").collect();
    for (const profile of employerProfiles) {
      await ctx.db.delete(profile._id);
    }
    
    // Delete all jobs
    const jobs = await ctx.db.query("jobs").collect();
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }
    
    // Delete all applications
    const applications = await ctx.db.query("applications").collect();
    for (const application of applications) {
      await ctx.db.delete(application._id);
    }
    
    // Delete all application notes
    const applicationNotes = await ctx.db.query("applicationNotes").collect();
    for (const note of applicationNotes) {
      await ctx.db.delete(note._id);
    }
    
    // Delete all education records
    const education = await ctx.db.query("education").collect();
    for (const edu of education) {
      await ctx.db.delete(edu._id);
    }
    
    // Delete all work experience
    const workExperience = await ctx.db.query("workExperience").collect();
    for (const work of workExperience) {
      await ctx.db.delete(work._id);
    }
    
    // Delete all job views
    const jobViews = await ctx.db.query("jobViews").collect();
    for (const view of jobViews) {
      await ctx.db.delete(view._id);
    }
    
    // Delete all saved jobs
    const savedJobs = await ctx.db.query("savedJobs").collect();
    for (const saved of savedJobs) {
      await ctx.db.delete(saved._id);
    }
    
    // Delete all onboarding progress
    const onboardingProgress = await ctx.db.query("onboardingProgress").collect();
    for (const progress of onboardingProgress) {
      await ctx.db.delete(progress._id);
    }
    
    // Delete all service orders
    const serviceOrders = await ctx.db.query("serviceOrders").collect();
    for (const order of serviceOrders) {
      await ctx.db.delete(order._id);
    }
    
    // Delete all subscriptions
    const subscriptions = await ctx.db.query("subscriptions").collect();
    for (const subscription of subscriptions) {
      await ctx.db.delete(subscription._id);
    }
    
    // Delete all transactions
    const transactions = await ctx.db.query("transactions").collect();
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }
    
    return {
      success: true,
      deleted: {
        users: nonAdminUsers.length,
        jobSeekerProfiles: jobSeekerProfiles.length,
        employerProfiles: employerProfiles.length,
        jobs: jobs.length,
        applications: applications.length,
        applicationNotes: applicationNotes.length,
        education: education.length,
        workExperience: workExperience.length,
        jobViews: jobViews.length,
        savedJobs: savedJobs.length,
        onboardingProgress: onboardingProgress.length,
        serviceOrders: serviceOrders.length,
        subscriptions: subscriptions.length,
        transactions: transactions.length,
      },
      keptAdmins: adminUsers.length,
      clerkIdsToDelete,
    };
  },
});

export const clearAllDataExceptAdminAction = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    // First, clear data from Convex and get Clerk IDs
    const result = await ctx.runMutation(internal.clearData.clearAllDataExceptAdmin) as {
      success: boolean;
      deleted: Record<string, number>;
      keptAdmins: number;
      clerkIdsToDelete: string[];
    };
    
    // Delete users from Clerk
    const clerkApiKey = process.env.CLERK_SECRET_KEY;
    if (!clerkApiKey) {
      return {
        ...result,
        clerkDeletionError: "CLERK_SECRET_KEY not found in environment variables",
      };
    }
    
    const deletedFromClerk: string[] = [];
    const failedClerkDeletions: string[] = [];
    
    for (const clerkId of result.clerkIdsToDelete) {
      try {
        const response = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${clerkApiKey}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          deletedFromClerk.push(clerkId);
        } else {
          failedClerkDeletions.push(clerkId);
        }
      } catch (error) {
        failedClerkDeletions.push(clerkId);
      }
    }
    
    return {
      ...result,
      clerkDeletion: {
        deleted: deletedFromClerk.length,
        failed: failedClerkDeletions.length,
        failedIds: failedClerkDeletions,
      },
    };
  },
});


export const clearNonAdminFromClerk = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    const clerkApiKey = process.env.CLERK_SECRET_KEY;
    if (!clerkApiKey) {
      return {
        error: "CLERK_SECRET_KEY not found in environment variables",
      };
    }

    // Get all users from Clerk
    const usersResponse = await fetch("https://api.clerk.com/v1/users?limit=500", {
      headers: {
        Authorization: `Bearer ${clerkApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!usersResponse.ok) {
      return {
        error: "Failed to fetch users from Clerk",
      };
    }

    const clerkUsers = await usersResponse.json();
    
    const deletedFromClerk: string[] = [];
    const failedClerkDeletions: string[] = [];
    const keptAdmins: string[] = [];

    // Delete all users from Clerk except those with admin-like emails
    for (const clerkUser of clerkUsers) {
      const email = clerkUser.email_addresses?.[0]?.email_address;
      
      // Skip if this looks like an admin email
      if (email && (email.includes('admin') || email.includes('@kazicloud'))) {
        keptAdmins.push(clerkUser.id);
        continue;
      }

      try {
        const response = await fetch(`https://api.clerk.com/v1/users/${clerkUser.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${clerkApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          deletedFromClerk.push(clerkUser.id);
        } else {
          failedClerkDeletions.push(clerkUser.id);
        }
      } catch (error) {
        failedClerkDeletions.push(clerkUser.id);
      }
    }

    return {
      success: true,
      totalClerkUsers: clerkUsers.length,
      deleted: deletedFromClerk.length,
      failed: failedClerkDeletions.length,
      keptAdmins: keptAdmins.length,
      deletedIds: deletedFromClerk,
      failedIds: failedClerkDeletions,
    };
  },
});
