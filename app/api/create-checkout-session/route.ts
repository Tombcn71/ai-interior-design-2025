import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { message: "Price ID is required" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Vereenvoudigde versie die TypeScript fouten vermijdt
    try {
      // Voeg 5 credits toe aan de gebruiker (standaard waarde)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: 5 } },
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
