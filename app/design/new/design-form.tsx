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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create New Design</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Photo</TabsTrigger>
              <TabsTrigger value="style">Choose Style</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="room-photo">Upload a photo of your room</Label>
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
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
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
                  <p className="text-sm text-gray-600 mt-2">
                    Selected file: {image.name}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Choose a design style</Label>
                <RadioGroup
                  value={style}
                  onValueChange={setStyle}
                  className="grid grid-cols-2 gap-2">
                  <StyleOption
                    id="modern"
                    label="Modern"
                    isSelected={style === "modern"}
                  />
                  <StyleOption
                    id="minimalist"
                    label="Minimalist"
                    isSelected={style === "minimalist"}
                  />
                  <StyleOption
                    id="scandinavian"
                    label="Scandinavian"
                    isSelected={style === "scandinavian"}
                  />
                  <StyleOption
                    id="industrial"
                    label="Industrial"
                    isSelected={style === "industrial"}
                  />
                  <StyleOption
                    id="bohemian"
                    label="Bohemian"
                    isSelected={style === "bohemian"}
                  />
                  <StyleOption
                    id="mid-century"
                    label="Mid-Century"
                    isSelected={style === "mid-century"}
                  />
                  <StyleOption
                    id="traditional"
                    label="Traditional"
                    isSelected={style === "traditional"}
                  />
                  <StyleOption
                    id="rustic"
                    label="Rustic"
                    isSelected={style === "rustic"}
                  />
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={isUploading || !image}
            className="w-full">
            {isUploading ? "Creating Design..." : "Create Design"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

// Style option component
function StyleOption({
  id,
  label,
  isSelected,
}: {
  id: string;
  label: string;
  isSelected: boolean;
}) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={id} id={id} />
      <Label htmlFor={id} className={isSelected ? "font-medium" : ""}>
        {label}
      </Label>
    </div>
  );
}
