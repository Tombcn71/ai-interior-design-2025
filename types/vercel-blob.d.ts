// Type definitions for Vercel Blob
// This helps TypeScript understand the shape of the objects returned by Vercel Blob

declare module "@vercel/blob" {
  export interface PutBlobResult {
    url: string;
    pathname: string;
    uploadedAt: string;
    contentDisposition?: string;
    contentType?: string;
  }

  export interface ListBlobResultBlob {
    url: string;
    pathname: string;
    uploadedAt: string;
  }

  export interface ListBlobResult {
    blobs: ListBlobResultBlob[];
    cursor?: string;
  }

  export interface PutOptions {
    access?: "public";
    addRandomSuffix?: boolean;
    cacheControlMaxAge?: number;
  }

  export interface ListOptions {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }

  export function put(
    pathname: string,
    body:
      | string
      | ArrayBuffer
      | ArrayBufferView
      | NodeJS.ReadableStream
      | Blob
      | File,
    options?: PutOptions
  ): Promise<PutBlobResult>;

  export function list(options?: ListOptions): Promise<ListBlobResult>;

  export function del(url: string | string[]): Promise<void>;
}
