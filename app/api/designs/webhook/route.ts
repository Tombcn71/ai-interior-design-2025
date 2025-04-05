import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

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
    const design = await prisma.design.findFirst({
      where: {
        predictionId: predictionId,
      },
    });

    if (!design) {
      console.warn(`No design found for prediction ${predictionId}`);
      return NextResponse.json({ success: false, message: "Design not found" });
    }

    // Update the design based on the prediction status
    if (status === "succeeded") {
      // Get the output URL from the prediction
      const outputUrl = Array.isArray(output) ? output[0] : output;

      if (outputUrl) {
        // Store the result in Vercel Blob for persistence
        try {
          // Fetch the image from the Replicate URL
          const response = await fetch(outputUrl);
          if (!response.ok)
            throw new Error(`Failed to fetch image: ${response.statusText}`);

          const imageBlob = await response.blob();

          // Upload to Vercel Blob
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
    } else if (status === "failed" || error) {
      await prisma.design.update({
        where: { id: design.id },
        data: {
          status: "failed",
          errorMessage: error || "Generation failed",
        },
      });
    } else if (status === "starting" || status === "processing") {
      // Update the design status to processing if it's starting
      await prisma.design.update({
        where: { id: design.id },
        data: {
          status: "processing",
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
