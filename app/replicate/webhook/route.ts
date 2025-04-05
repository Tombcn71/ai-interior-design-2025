import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import type { Design } from "@/types/design";

export async function POST(req: Request) {
  try {
    // Parse the webhook payload
    const payload = await req.json();

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
        // Store the result in Vercel Blob for persistence
        try {
          // Fetch the image from the Replicate URL
          const response = await fetch(outputUrl);
          if (!response.ok)
            throw new Error(`Failed to fetch image: ${response.statusText}`);

          const imageBlob = await response.blob();

          // Upload to Vercel Blob - simplified to avoid date issues
          const blob = await put(
            `results/${design.userId}/${design.id}.jpg`,
            imageBlob,
            {
              access: "public",
            }
          );

          // Update the design with our own stored URL
          await prisma.design.update({
            where: { id: design.id },
            data: {
              status: "completed",
              resultUrl: blob.url,
            },
          });
        } catch (blobError) {
          console.error("Error storing result in Vercel Blob:", blobError);
          // Fallback to using the Replicate URL directly
          await prisma.design.update({
            where: { id: design.id },
            data: {
              status: "completed",
              resultUrl: outputUrl,
            },
          });
        }
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
