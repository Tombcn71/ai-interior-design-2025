import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("Simple webhook test received at:", new Date().toISOString());

  try {
    // Parse the request body
    const body = await req.json();
    console.log("Request body:", body);

    // Extract the user ID and credits
    const userId = body.userId || body.client_reference_id;
    const credits = body.credits || 5;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Missing userId or client_reference_id in request body",
          receivedBody: body,
        },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
          userId,
        },
        { status: 404 }
      );
    }

    // Update the user's credits
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: user.credits + credits },
    });

    // Create a purchase record
    const purchase = await prisma.creditPurchase.create({
      data: {
        userId: userId,
        amount: credits,
        transactionId: `test_${Date.now()}`,
        paymentStatus: "completed",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Credits added successfully",
      user: {
        id: updatedUser.id,
        creditsBefore: user.credits,
        creditsAdded: credits,
        creditsAfter: updatedUser.credits,
      },
      purchase,
    });
  } catch (error) {
    console.error("Error in simple webhook test:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing webhook",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
