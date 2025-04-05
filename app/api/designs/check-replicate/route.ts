import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function GET() {
  try {
    // Check if the API token is set
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "REPLICATE_API_TOKEN is not set" },
        { status: 500 }
      );
    }

    // Initialize the Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Try to list models to verify the connection
    const models = await replicate.models.list();

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Replicate API",
      modelCount: models.results.length,
    });
  } catch (error) {
    console.error("Error checking Replicate connection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to Replicate API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
