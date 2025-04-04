import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Design } from "@/types/design";

export async function POST(req: Request) {
  try {
    // Parse the webhook payload
    const payload = await req.json();

    // Verify the webhook signature if Replicate provides one
    // This would require additional implementation

    // Extract the prediction details
    const { id: predictionId, status, output, error } = payload;

    console.log(
      `Received webhook for prediction ${predictionId} with status ${status}`
    );

    // Find the design associated with this prediction
    const design = (await prisma.design.findFirst({
      where: {
        predictionId: predictionId,
      },
    })) as Design | null;

    if (!design) {
      console.warn(`No design found for prediction ${predictionId}`);
      return NextResponse.json({ success: false, message: "Design not found" });
    }

    // Update the design based on the prediction status
    if (status === "succeeded") {
      // Get the output URL from the prediction
      const outputUrl = output?.[0] || null;

      if (outputUrl) {
        await prisma.design.update({
          where: { id: design.id },
          data: {
            status: "completed",
            resultUrl: outputUrl,
          },
        });
      }
    } else if (status === "failed") {
      await prisma.design.update({
        where: { id: design.id },
        data: {
          status: "failed",
          errorMessage: error || "Generation failed",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
