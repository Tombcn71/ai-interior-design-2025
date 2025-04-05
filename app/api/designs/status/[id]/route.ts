import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Replicate from "replicate";

// Initialize the Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const designId = params.id;
    if (!designId) {
      return NextResponse.json(
        { error: "Design ID is required" },
        { status: 400 }
      );
    }

    // Get the design from the database
    const design = await prisma.design.findUnique({
      where: { id: designId },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    // Check if the design belongs to the user
    if (design.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to access this design" },
        { status: 403 }
      );
    }

    // If the design has a prediction ID and is still processing, check the status
    if (design.predictionId && design.status === "processing") {
      try {
        const prediction = await replicate.predictions.get(design.predictionId);

        // Update the design status based on the prediction status
        if (prediction.status === "succeeded") {
          const outputUrl = Array.isArray(prediction.output)
            ? prediction.output[0]
            : prediction.output;

          if (outputUrl) {
            await prisma.design.update({
              where: { id: designId },
              data: {
                status: "completed",
                resultUrl: outputUrl,
              },
            });

            // Update the design object for the response
            const updatedDesign = await prisma.design.findUnique({
              where: { id: designId },
            });

            return NextResponse.json({
              design: updatedDesign,
              prediction,
            });
          }
        } else if (prediction.status === "failed") {
          await prisma.design.update({
            where: { id: designId },
            data: {
              status: "failed",
              errorMessage: prediction.error || "Generation failed",
            },
          });

          // Get the updated design
          const updatedDesign = await prisma.design.findUnique({
            where: { id: designId },
          });

          return NextResponse.json({
            design: updatedDesign,
            prediction,
          });
        }

        return NextResponse.json({
          design,
          prediction,
        });
      } catch (error) {
        console.error("Error fetching prediction status:", error);
        // Continue and return the design without prediction details
      }
    }

    // Return the design data
    return NextResponse.json({ design });
  } catch (error) {
    console.error("Error fetching design status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch design status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
