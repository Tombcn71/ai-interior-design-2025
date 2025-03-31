import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

const PACKAGES = {
  basic: {
    name: "Basic Package",
    credits: 5,
    price: 499, // in cents
  },
  standard: {
    name: "Standard Package",
    credits: 15,
    price: 1299, // in cents
  },
  premium: {
    name: "Premium Package",
    credits: 50,
    price: 3999, // in cents
  },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packageId } = body;

    if (!packageId || !PACKAGES[packageId as keyof typeof PACKAGES]) {
      return NextResponse.json({ message: "Invalid package" }, { status: 400 });
    }

    // Gebruik de mock Stripe client
    try {
      const checkoutSession = await stripe.checkout.sessions.create();
      return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
      console.error("Checkout error:", error);
      // Fallback naar een directe redirect
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return NextResponse.json({
        url: `${appUrl}/dashboard/payment-success?session_id=mock_session_id`,
      });
    }
  } catch (error) {
    console.error("Checkout error:", error);
    // Fallback naar een directe redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.json({
      url: `${appUrl}/dashboard/payment-success?session_id=mock_session_id`,
    });
  }
}
