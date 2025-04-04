import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Design } from "@/types/design";

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the design ID and prediction ID from the query parameters
    const url = new URL(req.url);
    const designId = url.searchParams.get("designId");
    const predictionId = url.searchParams.get("predictionId");

    if (!designId && !predictionId) {
      return NextResponse.json(
        { error: "Design ID or Prediction ID is required" },
        { status: 400 }
      );
    }

    let design: Design | null = null;
    let predictionIdToCheck = predictionId;

    if (designId) {
      // Get the design from the database
      design = (await prisma.design.findUnique({
        where: { id: designId },
      })) as Design | null;

      if (!design) {
        return NextResponse.json(
          { error: "Design not found" },
          { status: 404 }
        );
      }

      // Check if the design belongs to the user
      if (design.userId !== session.user.id) {
        return NextResponse.json(
          { error: "You don't have permission to access this design" },
          { status: 403 }
        );
      }

      // Use the prediction ID from the design if available
      predictionIdToCheck = predictionIdToCheck || design.predictionId || null;
    }

    // If we don't have a prediction ID, we can't check the status
    if (!predictionIdToCheck) {
      return NextResponse.json({
        success: true,
        design,
        message: "No prediction ID provided, cannot check status",
      });
    }

    // Check the status of the prediction
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionIdToCheck}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Replicate API error:", errorData);
      return NextResponse.json(
        { error: "Failed to check prediction status", details: errorData },
        { status: response.status }
      );
    }

    const prediction = await response.json();

    // If the prediction is complete and we have a design ID, update the design
    if (designId && prediction.status === "succeeded") {
      // Get the output URL from the prediction
      const outputUrl = prediction.output?.[0] || null;

      if (outputUrl) {
        // Update the design with the result URL
        design = (await prisma.design.update({
          where: { id: designId },
          data: {
            status: "completed",
            resultUrl: outputUrl,
          },
        })) as Design;
      }
    } else if (designId && prediction.status === "failed") {
      // Update the design with the failed status
      design = (await prisma.design.update({
        where: { id: designId },
        data: {
          status: "failed",
          errorMessage: prediction.error || "Generation failed",
        },
      })) as Design;
    }

    return NextResponse.json({
      success: true,
      design,
      prediction,
    });
  } catch (error) {
    console.error("Error in Replicate status check:", error);
    return NextResponse.json(
      {
        error: "Failed to check prediction status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
