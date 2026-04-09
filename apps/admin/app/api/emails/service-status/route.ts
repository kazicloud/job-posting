import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { 
      customerName, 
      customerEmail, 
      serviceType, 
      status, 
      deliverables 
    } = await request.json();

    const result = await emailService.sendServiceStatusUpdate({
      customerName,
      customerEmail,
      serviceType,
      status,
      deliverables,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Service status email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
