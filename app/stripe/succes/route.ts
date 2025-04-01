import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { addUserCredits } from "@/lib/user";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Haal de session_id uit de URL
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { message: "Missing session ID" },
        { status: 400 }
      );
    }

    // Als het een mock sessie is, stuur een succesvolle response terug
    if (sessionId.startsWith("mock_")) {
      return NextResponse.json({ success: true });
    }

    // Als Stripe niet beschikbaar is, stuur een succesvolle response terug
    if (!stripe) {
      return NextResponse.json({ success: true });
    }

    // Haal de checkout sessie op van Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Controleer of de sessie betaald is
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { message: "Payment not completed" },
        { status: 400 }
      );
    }

    // Controleer of de gebruiker overeenkomt
    if (checkoutSession.metadata?.userId !== session.user.id) {
      return NextResponse.json({ message: "User mismatch" }, { status: 403 });
    }

    // Controleer of deze sessie al is verwerkt
    const existingPurchase = await prisma.creditPurchase.findFirst({
      where: {
        transactionId: sessionId,
      },
    });

    if (existingPurchase) {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // Verwerk de aankoop
    const credits = Number.parseInt(
      checkoutSession.metadata?.credits || "0",
      10
    );

    if (credits <= 0) {
      return NextResponse.json(
        { message: "Invalid credits amount" },
        { status: 400 }
      );
    }

    // Maak een aankoop record
    await prisma.creditPurchase.create({
      data: {
        userId: session.user.id,
        amount: credits,
        transactionId: sessionId,
        paymentStatus: "completed",
      },
    });

    // Voeg credits toe aan de gebruiker
    await addUserCredits(session.user.id, credits);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Stripe success processing error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
