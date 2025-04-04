"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DesignForm({ userId }: { userId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [style, setStyle] = useState("modern");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image to upload");
      return;
    }

    setIsUploading(true);

    try {
      // Create a FormData object to send the image and style
      const formData = new FormData();
      formData.append("image", image);
      formData.append("style", style);
      formData.append("userId", userId);

      // Send the form data to your API
      const response = await fetch("/api/designs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create design");
      }

      const data = await response.json();

      // Redirect to the design page
      router.push(`/design/${data.id}`);
    } catch (error) {
      console.error("Error creating design:", error);
      alert("Failed to create design. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload a photo of your room
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {image && (
          <p className="mt-2 text-sm text-gray-500">
            Selected file: {image.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a style
        </label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
          <option value="modern">Modern</option>
          <option value="minimalist">Minimalist</option>
          <option value="scandinavian">Scandinavian</option>
          <option value="industrial">Industrial</option>
          <option value="bohemian">Bohemian</option>
          <option value="mid-century">Mid-Century Modern</option>
          <option value="traditional">Traditional</option>
          <option value="rustic">Rustic</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={isUploading || !image}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {isUploading ? "Creating Design..." : "Create Design"}
        </button>
      </div>
    </form>
  );
}
