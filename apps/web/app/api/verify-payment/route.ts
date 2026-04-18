import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.NODE_ENV === 'production'
      ? process.env.PAYSTACK_SECRET_KEY_LIVE
      : process.env.PAYSTACK_SECRET_KEY;

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Payment verification failed", details: data },
        { status: 400 }
      );
    }

    if (data.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment was not successful", status: data.data.status },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      amount: data.data.amount / 100,
      currency: data.data.currency,
      reference: data.data.reference,
      status: data.data.status,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
