import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { addUserCredits } from "@/lib/user"
import type Stripe from "stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ message: "Webhook signature verification failed" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Add credits to user
    if (session.metadata?.userId && session.metadata?.credits) {
      const userId = session.metadata.userId
      const credits = Number.parseInt(session.metadata.credits, 10)

      await addUserCredits(userId, credits)

      // Create a record of the purchase
      await prisma.creditPurchase.create({
        data: {
          userId,
          amount: credits,
          transactionId: session.id,
          paymentStatus: "completed",
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}

