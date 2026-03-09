import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerName, companyName, email, phone, location, employerId } = body;

    // Validate required fields
    if (!employerName || !companyName || !email || !employerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email
    const result = await emailService.sendNewEmployerNotification({
      employerName,
      companyName,
      email,
      phone,
      location,
      employerId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
