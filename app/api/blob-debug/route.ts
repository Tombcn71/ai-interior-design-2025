import { NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/blob-client";

export async function POST(req: Request) {
  console.log("Blob debug API called");

  try {
    // Get the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Log file details
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Log environment variables (redacted)
    console.log("Environment check:", {
      blobTokenExists: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobTokenLength: process.env.BLOB_READ_WRITE_TOKEN
        ? process.env.BLOB_READ_WRITE_TOKEN.length
        : 0,
      nodeEnv: process.env.NODE_ENV,
    });

    // Try to upload with our new client
    console.log("Attempting to upload to Vercel Blob...");
    const blob = await uploadToBlob(`debug/${Date.now()}-${file.name}`, file);

    console.log("Upload successful:", blob);
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: blob.url,
      pathname: blob.pathname,
      uploadedAt: blob.uploadedAt,
    });
  } catch (error) {
    console.error("Error in blob debug API:", error);

    // Create a detailed error response
    const errorResponse = {
      success: false,
      message: "Failed to upload file",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.name : typeof error,
      blobTokenExists: !!process.env.BLOB_READ_WRITE_TOKEN,
    };

    console.error("Error response:", errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  // Check if the Blob token exists
  const tokenExists = !!process.env.BLOB_READ_WRITE_TOKEN;
  const tokenLength = process.env.BLOB_READ_WRITE_TOKEN
    ? process.env.BLOB_READ_WRITE_TOKEN.length
    : 0;

  return NextResponse.json({
    message: "Blob debug endpoint",
    instructions:
      "Send a POST request with a file in the 'file' field to test Blob uploads",
    environment: {
      blobTokenExists: tokenExists,
      blobTokenLength: tokenLength,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
