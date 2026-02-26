import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const verifyKenyaBRS = action({
  args: {
    registrationNumber: v.string(),
    employerProfileId: v.id("employerProfiles"),
  },
  handler: async (ctx, args) => {
    const METAMAP_API_URL = "https://api.prod.metamap.com/govchecks/v1/ke/brs";
    const METAMAP_TOKEN = process.env.METAMAP_API_TOKEN;
    const WEBHOOK_URL = process.env.METAMAP_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/metamap`;

    if (!METAMAP_TOKEN) {
      throw new Error("MetaMap API token not configured");
    }

    try {
      const response = await fetch(METAMAP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${METAMAP_TOKEN}`,
        },
        body: JSON.stringify({
          registrationNumber: args.registrationNumber,
          callbackUrl: WEBHOOK_URL,
        }),
      });

      if (!response.ok) {
        throw new Error(`MetaMap API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Update employer profile with verification ID
      await ctx.runMutation(api.employerOnboarding.updateVerificationStatus, {
        profileId: args.employerProfileId,
        metamapVerificationId: (data as any).verificationId || (data as any).id,
        status: "under_review",
      });

      return { success: true, verificationId: (data as any).verificationId || (data as any).id };
    } catch (error: any) {
      console.error("MetaMap BRS verification error:", error);
      return { success: false, error: error.message };
    }
  },
});
