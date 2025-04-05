import { NextResponse } from "next/server";

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

    // Log token length for debugging (don't log the actual token)
    console.log(
      `REPLICATE_API_TOKEN length: ${process.env.REPLICATE_API_TOKEN.length}`
    );

    // Make a simple API call to Replicate to verify the token
    const response = await fetch("https://api.replicate.com/v1/models", {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Replicate API error:", errorData);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to Replicate API",
          details: errorData,
          status: response.status,
          statusText: response.statusText,
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasToken: true,
            tokenLength: process.env.REPLICATE_API_TOKEN.length,
          },
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Replicate API",
      models: data.results.slice(0, 3), // Just return a few models to keep the response small
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasToken: true,
        tokenLength: process.env.REPLICATE_API_TOKEN.length,
      },
    });
  } catch (error) {
    console.error("Error testing Replicate connection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test Replicate connection",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
