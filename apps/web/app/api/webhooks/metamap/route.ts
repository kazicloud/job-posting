import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    console.log("MetaMap webhook received:", payload);

    // Extract verification result
    const { verificationId, status, data } = payload;

    // TODO: Update employer profile verification status in Convex
    // This will be called by MetaMap when BRS verification completes
    
    if (status === "completed" && data?.verified === true) {
      // BRS verification successful
      console.log("BRS verification successful:", verificationId);
    } else if (status === "completed" && data?.verified === false) {
      // BRS verification failed
      console.log("BRS verification failed:", verificationId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("MetaMap webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
