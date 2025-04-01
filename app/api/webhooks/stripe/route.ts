import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { addUserCredits } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: Request) {
  try {
    // Als Stripe niet beschikbaar is, stuur een succesvolle response terug
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("Stripe not properly configured, returning mock success");
      return NextResponse.json({ received: true });
    }

    // Lees de request body
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.warn("Missing Stripe signature");
      return NextResponse.json({ received: true });
    }

    // Verifieer de webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ received: true });
    }

    // Verwerk het event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Controleer of we alle benodigde metadata hebben
      if (session.metadata?.userId && session.metadata?.credits) {
        const userId = session.metadata.userId;
        const credits = Number.parseInt(session.metadata.credits, 10);

        // Controleer of deze sessie al is verwerkt
        const existingPurchase = await prisma.creditPurchase.findFirst({
          where: {
            transactionId: session.id,
          },
        });

        if (!existingPurchase) {
          // Maak een aankoop record
          await prisma.creditPurchase.create({
            data: {
              userId,
              amount: credits,
              transactionId: session.id,
              paymentStatus: "completed",
            },
          });

          // Voeg credits toe aan de gebruiker
          await addUserCredits(userId, credits);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ received: true });
  }
}
