import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

// Define the credits per price ID mapping
const oneCreditPriceId = process.env.STRIPE_PRICE_BASIC as string;
const threeCreditsPriceId = process.env.STRIPE_PRICE_STANDARD as string;
const fiveCreditsPriceId = process.env.STRIPE_PRICE_PREMIUM as string;

const creditsPerPriceId: {
  [key: string]: number;
} = {
  [oneCreditPriceId]: 5,
  [threeCreditsPriceId]: 15,
  [fiveCreditsPriceId]: 50,
};

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  console.log("Request from: ", req.url);

  // Check if stripe is initialized
  if (!stripe) {
    console.error("Stripe is not initialized. Check your STRIPE_SECRET_KEY.");
    return new NextResponse("Stripe configuration error", { status: 500 });
  }

  const body = await req.text();

  // Get the stripe signature from request headers
  const headersObj = headers();
  const sig = (await headersObj).get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error("Missing Stripe webhook secret");
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const checkoutSessionCompleted = event.data
      .object as Stripe.Checkout.Session;
    const userId = checkoutSessionCompleted.client_reference_id;

    if (!userId) {
      return new NextResponse("Missing client_reference_id", { status: 400 });
    }

    try {
      // Get the line items to determine the credits
      const lineItems = await stripe.checkout.sessions.listLineItems(
        checkoutSessionCompleted.id
      );

      if (!lineItems.data.length) {
        return new NextResponse("No line items found", { status: 400 });
      }

      const quantity = lineItems.data[0].quantity || 1;
      const priceId = lineItems.data[0].price?.id;

      if (!priceId) {
        return new NextResponse("No price ID found", { status: 400 });
      }

      const creditsPerUnit = creditsPerPriceId[priceId] || 5; // Default to 5 if not found
      const totalCreditsPurchased = quantity * creditsPerUnit;

      console.log({ lineItems });
      console.log({ quantity });
      console.log({ priceId });
      console.log({ creditsPerUnit });
      console.log("totalCreditsPurchased: " + totalCreditsPurchased);

      // Update the user's credits
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (user) {
        // Update existing user's credits
        await prisma.user.update({
          where: { id: userId },
          data: { credits: user.credits + totalCreditsPurchased },
        });
      } else {
        return new NextResponse("User not found", { status: 404 });
      }

      // Create a record of the purchase
      await prisma.creditPurchase.create({
        data: {
          userId: userId,
          amount: totalCreditsPurchased,
          transactionId: checkoutSessionCompleted.id,
          paymentStatus: "completed",
        },
      });

      console.log(`Added ${totalCreditsPurchased} credits to user ${userId}`);

      return new NextResponse(JSON.stringify({ message: "success" }), {
        status: 200,
      });
    } catch (error) {
      console.error("Error processing checkout session:", error);
      return new NextResponse("Error processing checkout session", {
        status: 500,
      });
    }
  }

  // Handle other event types
  return new NextResponse(
    JSON.stringify({ message: `Unhandled event type ${event.type}` }),
    { status: 400 }
  );
}
