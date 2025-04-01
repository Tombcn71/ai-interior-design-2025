import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Vereenvoudigde versie zonder Stripe
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

    const pkg = PACKAGES[packageId as keyof typeof PACKAGES];

    // Controleer of we een app URL hebben
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Vereenvoudigde implementatie zonder Stripe
    try {
      // Voeg credits toe aan de gebruiker
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
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { message: "Something went wrong" },
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
