import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { serviceType, amount, currency, paymentReference, customerName, customerEmail, orderId } = await request.json();

    // Send admin notification via admin app API
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
    
    try {
      await fetch(`${adminUrl}/api/emails/service-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          serviceType,
          amount,
          currency,
          orderId,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send admin notification:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Service notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
