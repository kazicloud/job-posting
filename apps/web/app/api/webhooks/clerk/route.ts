import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET in environment variables");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } = evt.data;

    try {
      await convex.mutation(api.users.createFromClerk, {
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || "",
        lastName: last_name || "",
        roles: (unsafe_metadata as any)?.roles || ["job_seeker"],
        fields: (unsafe_metadata as any)?.fields,
        otherFieldDescription: (unsafe_metadata as any)?.otherFieldDescription,
        companyInfo: (unsafe_metadata as any)?.companyInfo,
      });

      console.log("✅ User synced to Convex:", id);
      return new Response("User created successfully", { status: 200 });
    } catch (error) {
      console.error("❌ Failed to sync user to Convex:", error);
      return new Response("Error: Failed to sync user", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
