import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Create a sample design to see what fields are available
    const sampleDesign = {
      userId: "sample-user-id",
      // Add other required fields based on your current schema
    };

    // Log the structure without actually creating it
    console.log("Design structure:", sampleDesign);

    // Get the Prisma model metadata
    const modelInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Design'
    `;

    return NextResponse.json({
      message: "Schema information retrieved",
      modelInfo,
    });
  } catch (error) {
    console.error("Error checking schema:", error);
    return NextResponse.json(
      {
        message: "Failed to check schema",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
