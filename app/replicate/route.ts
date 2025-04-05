import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Replicate from "replicate";

// Initialize the Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    const { designId } = body;

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

    // Get the input image URL
    const imageUrl = design.imageUrl;
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Design has no image" },
        { status: 400 }
      );
    }

    // Create the prompt based on design details
    const roomType = getRoomTypeName(design.roomType || "living_room");
    const style = design.style || "modern";
    const prompt = `Interior design in ${style} style for a ${roomType}`;
    const additionalPrompt = design.description || "";
    const fullPrompt = additionalPrompt
      ? `${prompt}. ${additionalPrompt}`
      : prompt;

    // Update the design status to processing
    await prisma.design.update({
      where: { id: designId },
      data: {
        status: "processing",
      },
    });

    // Create the prediction
    const prediction = await replicate.predictions.create({
      version:
        "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
      input: {
        image: imageUrl,
        prompt: fullPrompt,
      },
      webhook: `https://ai-interior-design-2025-my-team-801094ad.vercel.app/api/replicate/webhook`,
      webhook_events_filter: ["start", "completed"],
    });

    // Update the design with the prediction ID
    await prisma.design.update({
      where: { id: designId },
      data: {
        predictionId: prediction.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Design generation started",
      prediction: prediction,
      designId,
    });
  } catch (error) {
    console.error("Error in Replicate API route:", error);
    return NextResponse.json(
      {
        error: "Failed to generate design",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Helper function to get the English name for a room type
function getRoomTypeName(roomType: string): string {
  const roomTypes: Record<string, string> = {
    living_room: "living room",
    bedroom: "bedroom",
    kitchen: "kitchen",
    bathroom: "bathroom",
    dining_room: "dining room",
    office: "home office",
    kids_room: "kids room",
    hallway: "hallway",
    other: "room",
  };

  return roomTypes[roomType] || "room";
}
