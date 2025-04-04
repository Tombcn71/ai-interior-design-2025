import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Changed from authConfig to authOptions
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

// Definieer de packages
const PACKAGES = {
  basic: {
    name: "Basis Pakket",
    credits: 5,
    price: 499, // in cents
    priceId: process.env.STRIPE_PRICE_BASIC,
  },
  standard: {
    name: "Standaard Pakket",
    credits: 15,
    price: 1299, // in cents
    priceId: process.env.STRIPE_PRICE_STANDARD,
  },
  premium: {
    name: "Premium Pakket",
    credits: 50,
    price: 3999, // in cents
    priceId: process.env.STRIPE_PRICE_PREMIUM,
  },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions); // Changed from authConfig to authOptions

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packageId } = body;

    if (!packageId || !PACKAGES[packageId as keyof typeof PACKAGES]) {
      return NextResponse.json({ message: "Invalid package" }, { status: 400 });
    }

    const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Als Stripe niet beschikbaar is of er geen priceId is, gebruik de fallback
    if (!stripe || !pkg.priceId) {
      console.warn("Stripe not available or missing price ID, using fallback");

      // Voeg credits direct toe
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: pkg.credits } },
      });

      // Maak een mock aankoop record
      await prisma.creditPurchase.create({
        data: {
          userId: session.user.id,
          amount: pkg.credits,
          transactionId: `mock_${Date.now()}`,
          paymentStatus: "completed",
        },
      });

      return NextResponse.json({
        url: `${appUrl}/dashboard/payment-success?session_id=mock_session_id`,
      });
    }

    // Maak een Stripe checkout sessie met correcte types
    try {
      // Definieer de checkout parameters
      const params: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price: pkg.priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${appUrl}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard/buy-credits`,
        metadata: {
          userId: session.user.id,
          credits: pkg.credits.toString(),
          packageId,
        },
        allow_promotion_codes: true,
      };

      // Maak de checkout sessie
      const checkoutSession = await stripe.checkout.sessions.create(params);

      return NextResponse.json({ url: checkoutSession.url });
    } catch (stripeError: any) {
      console.error("Stripe checkout error:", stripeError);
      return NextResponse.json(
        { message: "Payment processing error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
