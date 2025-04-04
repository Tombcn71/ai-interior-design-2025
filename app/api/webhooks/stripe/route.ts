import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    // Check if stripe is initialized
    if (!stripe) {
      console.error("Stripe is not initialized. Check your STRIPE_SECRET_KEY.");
      return new NextResponse("Stripe configuration error", { status: 500 });
    }

    const body = await req.text();

    // Get the stripe signature from request headers
    // Using a different approach to get headers
    const requestHeaders = req.headers;
    const signature = requestHeaders.get("stripe-signature");

    if (!signature) {
      return new NextResponse("Missing stripe signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        throw new Error("Missing Stripe webhook secret");
      }

      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Retrieve the session to get line items
      const checkoutSession = await stripe.checkout.sessions.retrieve(
        session.id,
        { expand: ["line_items"] }
      );

      if (!session?.metadata?.userId || !session?.metadata?.credits) {
        console.error("Missing metadata in session", session.id);
        return new NextResponse("Missing metadata", { status: 400 });
      }

      const userId = session.metadata.userId;
      const credits = Number.parseInt(session.metadata.credits, 10);

      // Add credits to user
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
      });

      // Create purchase record
      await prisma.creditPurchase.create({
        data: {
          userId,
          amount: credits,
          transactionId: session.id,
          paymentStatus: "completed",
        },
      });

      console.log(`Added ${credits} credits to user ${userId}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
