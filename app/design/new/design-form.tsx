"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <Card className="w-full border-pink-100 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-pink-100">
          <CardTitle className="text-center text-2xl font-serif text-rose-800">
            Transform Your Space
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white border-b border-pink-100 rounded-none p-0">
              <TabsTrigger
                value="upload"
                className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-800 data-[state=active]:shadow-none rounded-none py-3 font-medium">
                Upload Photo
              </TabsTrigger>
              <TabsTrigger
                value="style"
                className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-800 data-[state=active]:shadow-none rounded-none py-3 font-medium">
                Choose Style
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="p-6 bg-white">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    Share Your Space
                  </h3>
                  <p className="text-sm text-gray-500">
                    Upload a photo of the room you'd like to redesign
                  </p>
                </div>

                <div className="mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-pink-100 border-dashed rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors">
                  <div className="space-y-2 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-pink-300"
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
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-rose-600 hover:text-rose-500">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) =>
                            setImage(e.target.files?.[0] || null)
                          }
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>

                {image && (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-rose-600">
                        {image.name}
                      </span>{" "}
                      selected
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="style" className="p-6 bg-white">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    Select Your Style
                  </h3>
                  <p className="text-sm text-gray-500">
                    Choose the design aesthetic you love
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <StyleOption
                    id="modern"
                    name="Modern"
                    description="Clean lines & contemporary feel"
                    isSelected={style === "modern"}
                    onSelect={() => setStyle("modern")}
                  />
                  <StyleOption
                    id="minimalist"
                    name="Minimalist"
                    description="Simple, uncluttered & serene"
                    isSelected={style === "minimalist"}
                    onSelect={() => setStyle("minimalist")}
                  />
                  <StyleOption
                    id="scandinavian"
                    name="Scandinavian"
                    description="Light, airy & natural"
                    isSelected={style === "scandinavian"}
                    onSelect={() => setStyle("scandinavian")}
                  />
                  <StyleOption
                    id="bohemian"
                    name="Bohemian"
                    description="Eclectic, colorful & free-spirited"
                    isSelected={style === "bohemian"}
                    onSelect={() => setStyle("bohemian")}
                  />
                  <StyleOption
                    id="mid-century"
                    name="Mid-Century"
                    description="Retro-inspired & timeless"
                    isSelected={style === "mid-century"}
                    onSelect={() => setStyle("mid-century")}
                  />
                  <StyleOption
                    id="traditional"
                    name="Traditional"
                    description="Classic, elegant & refined"
                    isSelected={style === "traditional"}
                    onSelect={() => setStyle("traditional")}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-white px-6 py-4 border-t border-pink-100">
          <Button
            type="submit"
            disabled={isUploading || !image}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 rounded-md">
            {isUploading ? "Creating Your Design..." : "Transform My Space"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

// Style option component
function StyleOption({
  id,
  name,
  description,
  isSelected,
  onSelect,
}: {
  id: string;
  name: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`border rounded-lg p-3 cursor-pointer transition-all ${
        isSelected
          ? "border-rose-300 bg-rose-50 ring-1 ring-rose-300"
          : "border-gray-200 hover:border-pink-200 hover:bg-pink-50"
      }`}
      onClick={onSelect}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`w-4 h-4 rounded-full border ${
              isSelected ? "border-rose-500 bg-rose-500" : "border-gray-300"
            }`}>
            {isSelected && (
              <div className="w-2 h-2 mx-auto mt-1 bg-white rounded-full"></div>
            )}
          </div>
        </div>
        <div className="ml-2">
          <h4 className="text-sm font-medium text-gray-900">{name}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
