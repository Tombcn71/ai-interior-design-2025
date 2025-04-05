import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function GET(req: Request) {
  try {
    // Check if Replicate API token is set
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "REPLICATE_API_TOKEN is not set",
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasToken: false,
          },
        },
        { status: 500 }
      );
    }

    // Initialize the Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Get a list of models to verify the connection
    const models = await replicate.models.list();

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Replicate API using the client",
      models: models.results.slice(0, 3), // Just return a few models
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasToken: true,
        tokenLength: process.env.REPLICATE_API_TOKEN.length,
      },
    });
  } catch (error) {
    console.error("Error testing Replicate client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test Replicate client",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Check if Replicate API token is set
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not set" },
        { status: 500 }
      );
    }

    // Initialize the Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Parse the request body
    const body = await req.json();
    const { imageUrl, prompt } = body;

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          required: ["imageUrl", "prompt"],
        },
        { status: 400 }
      );
    }

    console.log("Starting test prediction with:", { imageUrl, prompt });

    // Create a prediction
    const prediction = await replicate.predictions.create({
      version:
        "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
      input: {
        image: imageUrl,
        prompt: prompt,
      },
    });

    return NextResponse.json({
      success: true,
      prediction: prediction,
    });
  } catch (error) {
    console.error("Error running test prediction:", error);
    return NextResponse.json(
      {
        error: "Failed to run test prediction",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
