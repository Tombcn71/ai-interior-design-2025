"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function BlobTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const checkBlobStatus = async () => {
    try {
      const response = await fetch("/api/blob-debug");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/blob-debug", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Vercel Blob Debug Tool</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Check Blob Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkBlobStatus} className="w-full mb-4">
            Check Blob Status
          </Button>

          {result && !error && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-auto">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/90"
            />
          </div>

          {preview && (
            <div className="mb-4 relative aspect-video w-full overflow-hidden rounded-lg border">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full">
            {uploading ? "Uploading..." : "Upload to Vercel Blob"}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {result && !error && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-auto">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
              {result.url && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Uploaded Image:</p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    <Image
                      src={result.url || "/placeholder.svg"}
                      alt="Uploaded"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
