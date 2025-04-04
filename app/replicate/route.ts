import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Design } from "@/types/design";

// Define the Replicate API URL
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

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

    // Get the input image URL (assuming it's stored in the design record)
    const inputImageUrl = design.imageUrl;
    if (!inputImageUrl) {
      return NextResponse.json(
        { error: "Design has no image" },
        { status: 400 }
      );
    }

    // Prepare the payload for Replicate
    const payload = {
      version:
        "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // Example model version
      input: {
        image: inputImageUrl,
        prompt: `Interior design in ${
          design.style || "modern"
        } style for a ${getRoomTypeName(design.roomType || "living_room")}`,
        additional_prompt: design.description || "",
      },
    };

    // Call the Replicate API
    const response = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Replicate API error:", errorData);
      return NextResponse.json(
        { error: "Failed to start generation", details: errorData },
        { status: response.status }
      );
    }

    const replicateResponse = await response.json();

    // Update the design with the prediction ID
    await prisma.design.update({
      where: { id: designId },
      data: {
        status: "processing",
        predictionId: replicateResponse.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Design generation started",
      prediction: replicateResponse,
      designId,
    });
  } catch (error) {
    console.error("Error in Replicate API route:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error),
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
