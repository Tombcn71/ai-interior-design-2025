import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { addUserCredits } from "@/lib/user";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // Controleer of we in productie zijn en of de Stripe API key is ingesteld
  if (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === "dummy_key_for_build" ||
    !process.env.STRIPE_WEBHOOK_SECRET
  ) {
    console.warn("Stripe API keys not configured, returning mock response");
    return NextResponse.json({ received: true });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { message: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Add credits to user
    if (session.metadata?.userId && session.metadata?.credits) {
      const userId = session.metadata.userId;
      const credits = Number.parseInt(session.metadata.credits, 10);

      await addUserCredits(userId, credits);

      // Create a record of the purchase
      await prisma.creditPurchase.create({
        data: {
          userId,
          amount: credits,
          transactionId: session.id,
          paymentStatus: "completed",
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
