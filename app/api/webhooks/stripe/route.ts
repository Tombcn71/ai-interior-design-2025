import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { addUserCredits } from "@/lib/user";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Controleer of Stripe beschikbaar is
    const stripe = getStripe();
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("Stripe not properly configured, returning mock success");
      return NextResponse.json({ received: true });
    }

    let body: string;
    try {
      body = await req.text();
    } catch (error) {
      console.error("Error reading request body:", error);
      return NextResponse.json({ received: true });
    }

    // Veilig headers ophalen
    let signature: string | null = null;
    try {
      signature = req.headers.get("Stripe-Signature");
    } catch (error) {
      console.error("Error getting headers:", error);
      return NextResponse.json({ received: true });
    }

    if (!signature) {
      console.warn("Missing Stripe signature, returning mock success");
      return NextResponse.json({ received: true });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json({ received: true });
    }

    // Alleen verwerk checkout.session.completed events
    if (event.type === "checkout.session.completed") {
      try {
        const session = event.data.object as Stripe.Checkout.Session;

        // Controleer of we alle benodigde metadata hebben
        if (session.metadata?.userId && session.metadata?.credits) {
          const userId = session.metadata.userId;
          const credits = Number.parseInt(session.metadata.credits, 10);

          // Voeg credits toe aan de gebruiker
          await addUserCredits(userId, credits);

          // Maak een record van de aankoop
          await prisma.creditPurchase.create({
            data: {
              userId,
              amount: credits,
              transactionId: session.id,
              paymentStatus: "completed",
            },
          });
        }
      } catch (error) {
        console.error("Error processing checkout session:", error);
      }
    }

    // Stuur altijd een succesvolle response terug om te voorkomen dat Stripe de webhook opnieuw probeert
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Stuur nog steeds een succesvolle response terug
    return NextResponse.json({ received: true });
  }
}
