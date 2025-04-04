import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return NextResponse.json({
    success: true,
    message:
      "This is a test endpoint for the Stripe webhook. The actual webhook endpoint is at /api/stripe-webhook.",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  console.log("Test webhook POST received at:", new Date().toISOString());

  try {
    // Try to read the request body
    const body = await req.text();

    return NextResponse.json({
      success: true,
      message: "POST request received successfully",
      timestamp: new Date().toISOString(),
      bodyLength: body.length,
      bodyPreview: body.substring(0, 100) + "...",
    });
  } catch (error) {
    console.error("Error in test webhook:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing POST request",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
