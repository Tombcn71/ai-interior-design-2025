// This script verifies that the BLOB_READ_WRITE_TOKEN is valid
// Run with: npx ts-node scripts/verify-blob-token.ts

import { list } from "@vercel/blob";

async function verifyBlobToken() {
  console.log("Verifying Vercel Blob token...");

  // Check if the token exists
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN is not set in the environment");
    console.log("Please set this environment variable and try again.");
    process.exit(1);
  }

  console.log("✅ BLOB_READ_WRITE_TOKEN is set");
  console.log(
    `Token length: ${process.env.BLOB_READ_WRITE_TOKEN.length} characters`
  );

  try {
    // Try to list blobs to verify the token works
    console.log("Testing token by listing blobs...");
    const blobs = await list({ limit: 1 });

    console.log("✅ Successfully connected to Vercel Blob!");
    console.log(`Found ${blobs.blobs.length} blobs`);

    if (blobs.blobs.length > 0) {
      // Only log properties that exist on ListBlobResultBlob
      console.log("Sample blob:", {
        url: blobs.blobs[0].url,
        pathname: blobs.blobs[0].pathname,
        uploadedAt: blobs.blobs[0].uploadedAt,
      });
    }

    console.log("Your Vercel Blob configuration is working correctly!");
  } catch (error) {
    console.error("❌ Failed to connect to Vercel Blob:");
    console.error(error);

    if (error instanceof Error && error.message.includes("unauthorized")) {
      console.log(
        "The token appears to be invalid or has insufficient permissions."
      );
      console.log("Please generate a new token in the Vercel dashboard.");
    }

    process.exit(1);
  }
}

verifyBlobToken().catch(console.error);
