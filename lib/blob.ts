import {
  put as blobPut,
  list as blobList,
  del as blobDelete,
} from "@vercel/blob";

// Wrapper function for put with better error handling
export async function put(
  path: string,
  file: File | Blob | ArrayBuffer | Buffer,
  options?: { access?: "public"; addRandomSuffix?: boolean }
) {
  try {
    // Log the environment for debugging
    console.log(
      "BLOB_READ_WRITE_TOKEN exists:",
      !!process.env.BLOB_READ_WRITE_TOKEN
    );

    // Validate inputs
    if (!path) throw new Error("Path is required for Blob storage");
    if (!file) throw new Error("File is required for Blob storage");

    // Perform the upload
    const result = await blobPut(path, file, {
      access: "public", // Only "public" is supported in the current version
      addRandomSuffix: options?.addRandomSuffix || false,
    });

    return result;
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    throw error;
  }
}

// Wrapper for list with better error handling
export async function list(options?: { prefix?: string; limit?: number }) {
  try {
    return await blobList(options);
  } catch (error) {
    console.error("Vercel Blob list error:", error);
    throw error;
  }
}

// Wrapper for delete with better error handling
export async function del(url: string) {
  try {
    return await blobDelete(url);
  } catch (error) {
    console.error("Vercel Blob delete error:", error);
    throw error;
  }
}
