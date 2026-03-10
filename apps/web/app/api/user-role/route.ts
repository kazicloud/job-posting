import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user from Convex
    const user = await convex.query(api.users.getUserByClerkId, { clerkId: userId });
    
    return NextResponse.json({ 
      primaryRole: user?.primaryRole || "job_seeker",
      roles: user?.roles || ["job_seeker"],
      onboardingCompleted: user?.onboardingCompleted || false
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json({ 
      primaryRole: "job_seeker",
      roles: ["job_seeker"]
    });
  }
}
