import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Replicate from "replicate";
import type { Design } from "@/types/design";

export async function POST(req: Request) {
  try {
    // Check if Replicate API token is set
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set");
      return NextResponse.json(
        {
          error: "Replicate API token is not configured",
          details: "Please set the REPLICATE_API_TOKEN environment variable",
        },
        { status: 500 }
      );
    }

    // Initialize the Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

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
    const design = (await prisma.design.findUnique({
      where: { id: designId },
    })) as Design | null;

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
    const inputImageUrl = design.imageUrl;
    if (!inputImageUrl) {
      return NextResponse.json(
        { error: "Design has no image" },
        { status: 400 }
      );
    }

    console.log("Starting Replicate prediction with image:", inputImageUrl);

    // Create the prompt based on design details
    const prompt = `Interior design in ${
      design.style || "modern"
    } style for a ${getRoomTypeName(design.roomType || "living_room")}`;
    const additionalPrompt = design.description || "";

    const fullPrompt = additionalPrompt
      ? `${prompt}. ${additionalPrompt}`
      : prompt;

    console.log("Using prompt:", fullPrompt);

    // Update the design status to processing
    await prisma.design.update({
      where: { id: designId },
      data: {
        status: "processing",
      },
    });

    // Create a prediction using the Replicate client
    const prediction = await replicate.predictions.create({
      version:
        "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
      input: {
        image: inputImageUrl,
        prompt: fullPrompt,
      },
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/replicate/webhook`,
      webhook_events_filter: ["completed", "start"], // Changed from "failed" to valid event types
    });

    console.log("Replicate prediction created:", prediction);

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

    // Check if it's a Replicate API error
    if (error instanceof Error && error.message.includes("Replicate")) {
      return NextResponse.json(
        {
          error: "Replicate API error",
          details: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to get the English name for a room type (for the AI prompt)
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
