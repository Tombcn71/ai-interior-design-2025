import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { streamToString } from "@/lib/utils";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Define the credits per price ID mapping
const oneCreditPriceId = process.env.STRIPE_PRICE_BASIC as string;
const threeCreditsPriceId = process.env.STRIPE_PRICE_STANDARD as string;
const fiveCreditsPriceId = process.env.STRIPE_PRICE_PREMIUM as string;

// Log the price IDs to make sure they're set correctly
console.log("Price IDs:", {
  oneCreditPriceId,
  threeCreditsPriceId,
  fiveCreditsPriceId,
});

const creditsPerPriceId: {
  [key: string]: number;
} = {
  [oneCreditPriceId]: 5,
  [threeCreditsPriceId]: 15,
  [fiveCreditsPriceId]: 50,
};

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Add OPTIONS method handler for preflight requests
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
    },
  });
}

export async function POST(req: Request) {
  console.log("🔔 Webhook received at:", new Date().toISOString());
  console.log("Request from: ", req.url);
  console.log("Request method:", req.method);

  try {
    // Check if stripe is initialized
    if (!stripe) {
      console.error(
        "❌ Stripe is not initialized. Check your STRIPE_SECRET_KEY."
      );
      return new NextResponse("Stripe configuration error", { status: 500 });
    }

    // Get the raw body as a string - using a more reliable method
    let rawBody: string;
    try {
      // Use the streamToString utility to get the raw body
      rawBody = await streamToString(req.body as ReadableStream);
      console.log("📄 Raw body length:", rawBody.length);
      // Log a small preview of the body for debugging
      console.log("📄 Body preview:", rawBody.substring(0, 100) + "...");
    } catch (error) {
      console.error("❌ Failed to read request body:", error);
      return new NextResponse("Failed to read request body", { status: 400 });
    }

    // Get the stripe signature from request headers
    const sig = req.headers.get("stripe-signature");
    console.log("📝 Stripe signature:", sig ? "Present" : "Missing");

    if (!sig) {
      console.error("❌ Missing stripe signature");
      return new NextResponse("Missing stripe signature", { status: 400 });
    }

    // Check if webhook secret is configured
    if (!webhookSecret) {
      console.error("❌ Missing Stripe webhook secret");
      return new NextResponse("Missing Stripe webhook secret", { status: 500 });
    }

    let event: Stripe.Event;

    try {
      console.log("🔐 Verifying webhook signature...");
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      console.log("✅ Webhook signature verified");
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      // Log more details about the error
      console.error("Signature:", sig);
      console.error("Secret length:", webhookSecret.length);
      console.error("Body length:", rawBody.length);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log("📦 Event received:", event.type, event.id);

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      console.log("💰 Processing checkout.session.completed event");
      const checkoutSessionCompleted = event.data
        .object as Stripe.Checkout.Session;
      console.log(
        "Session data:",
        JSON.stringify(checkoutSessionCompleted, null, 2)
      );

      const userId = checkoutSessionCompleted.client_reference_id;

      if (!userId) {
        console.error("❌ Missing client_reference_id");
        return new NextResponse("Missing client_reference_id", { status: 400 });
      }

      console.log("👤 User ID:", userId);

      try {
        // Get the line items to determine the credits
        console.log(
          "🔍 Retrieving line items for session:",
          checkoutSessionCompleted.id
        );
        const lineItems = await stripe.checkout.sessions.listLineItems(
          checkoutSessionCompleted.id
        );

        console.log("📋 Line items:", JSON.stringify(lineItems, null, 2));

        if (!lineItems.data.length) {
          console.error("❌ No line items found");
          return new NextResponse("No line items found", { status: 400 });
        }

        const quantity = lineItems.data[0].quantity || 1;
        const priceId = lineItems.data[0].price?.id;

        if (!priceId) {
          console.error("❌ No price ID found");
          return new NextResponse("No price ID found", { status: 400 });
        }

        console.log("💲 Price ID:", priceId);
        console.log("🔢 Quantity:", quantity);

        // Check if the price ID is in our mapping
        if (!creditsPerPriceId[priceId]) {
          console.warn(
            `⚠️ Price ID ${priceId} not found in mapping, using default credits`
          );
        }

        const creditsPerUnit = creditsPerPriceId[priceId] || 5; // Default to 5 if not found
        const totalCreditsPurchased = quantity * creditsPerUnit;

        console.log("🎁 Credits per unit:", creditsPerUnit);
        console.log("💯 Total credits purchased:", totalCreditsPurchased);

        // Update the user's credits
        console.log("🔍 Finding user in database...");
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, credits: true },
        });

        if (!user) {
          console.error(`❌ User with ID ${userId} not found`);
          return new NextResponse("User not found", { status: 404 });
        }

        console.log("👤 User found:", user);
        console.log("💰 Current credits:", user.credits);
        console.log("➕ Adding credits:", totalCreditsPurchased);

        // Update existing user's credits
        console.log("📝 Updating user credits...");
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { credits: user.credits + totalCreditsPurchased },
        });

        console.log("✅ User credits updated:", updatedUser);

        // Create a record of the purchase
        console.log("📝 Creating purchase record...");
        const purchase = await prisma.creditPurchase.create({
          data: {
            userId: userId,
            amount: totalCreditsPurchased,
            transactionId: checkoutSessionCompleted.id,
            paymentStatus: "completed",
          },
        });

        console.log("✅ Purchase record created:", purchase);
        console.log(
          `✨ Added ${totalCreditsPurchased} credits to user ${userId}`
        );

        return new NextResponse(
          JSON.stringify({
            message: "success",
            userId,
            creditsBefore: user.credits,
            creditsAdded: totalCreditsPurchased,
            creditsAfter: updatedUser.credits,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("❌ Error processing checkout session:", error);
        return new NextResponse(
          JSON.stringify({
            message: "Error processing checkout session",
            error: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      console.log(`⏩ Ignoring event type: ${event.type}`);
    }

    // Handle other event types
    return new NextResponse(
      JSON.stringify({ message: `Unhandled event type ${event.type}` }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Unexpected error in webhook handler:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Unexpected error in webhook handler",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
