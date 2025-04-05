import { put, list, del } from "@vercel/blob";

// Helper function to log errors with more context
function logError(action: string, error: unknown) {
  console.error(`Vercel Blob ${action} error:`, error);
  if (error instanceof Error) {
    console.error(`Error name: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
  }

  // Log environment info
  console.error("Environment:", {
    nodeEnv: process.env.NODE_ENV,
    blobTokenExists: !!process.env.BLOB_READ_WRITE_TOKEN,
    blobTokenLength: process.env.BLOB_READ_WRITE_TOKEN
      ? process.env.BLOB_READ_WRITE_TOKEN.length
      : 0,
  });
}

// Upload a file to Vercel Blob
export async function uploadToBlob(
  path: string,
  file: File | Blob | ArrayBuffer | Buffer
) {
  console.log(`Starting Blob upload for path: ${path}`);

  try {
    // Validate inputs
    if (!path) throw new Error("Path is required for Blob storage");
    if (!file) throw new Error("File is required for Blob storage");

    // Log file details if possible
    if (file instanceof File) {
      console.log("Uploading File:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
    } else if (file instanceof Blob) {
      console.log("Uploading Blob:", {
        type: file.type,
        size: file.size,
      });
    } else {
      console.log("Uploading buffer/ArrayBuffer");
    }

    // Check if BLOB_READ_WRITE_TOKEN exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not set!");
      throw new Error("Missing BLOB_READ_WRITE_TOKEN environment variable");
    }

    // Perform the upload
    console.log("Calling Vercel Blob put function...");
    const result = await put(path, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Log only properties that exist on PutBlobResult
    console.log("Blob upload successful:", {
      url: result.url,
      pathname: result.pathname,
      uploadedAt: new Date(result.uploadedAt).toISOString(),
    });

    return result;
  } catch (error) {
    logError("upload", error);
    throw error;
  }
}

// List blobs with a given prefix
export async function listBlobs(prefix?: string) {
  try {
    const result = await list({ prefix });

    // Log the result without accessing potentially non-existent properties
    console.log(
      `Listed ${result.blobs.length} blobs with prefix "${prefix || ""}"`
    );

    return result;
  } catch (error) {
    logError("list", error);
    throw error;
  }
}

// Delete a blob by URL
export async function deleteBlob(url: string) {
  try {
    return await del(url);
  } catch (error) {
    logError("delete", error);
    throw error;
  }
}
