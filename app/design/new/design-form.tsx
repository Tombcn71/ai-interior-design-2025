"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewDesignFormProps {
  disabled?: boolean;
  userId: string;
}

// Define room types
const roomTypes = [
  { value: "living_room", label: "Woonkamer" },
  { value: "bedroom", label: "Slaapkamer" },
  { value: "kitchen", label: "Keuken" },
  { value: "bathroom", label: "Badkamer" },
  { value: "dining_room", label: "Eetkamer" },
  { value: "office", label: "Thuiskantoor" },
  { value: "kids_room", label: "Kinderkamer" },
  { value: "hallway", label: "Gang" },
  { value: "other", label: "Andere Ruimte" },
];

export default function DesignForm({ disabled, userId }: NewDesignFormProps) {
  const [roomType, setRoomType] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [style, setStyle] = useState("minimalist");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomType) {
      toast({
        title: "Fout",
        description: "Selecteer een type ruimte",
        variant: "destructive",
      });
      return;
    }

    if (!image) {
      toast({
        title: "Fout",
        description: "Upload een afbeelding van je kamer",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGenerationStatus("uploading");

    try {
      // Step 1: Upload the image and create the design record
      const formData = new FormData();
      formData.append("roomType", roomType);
      formData.append("style", style);
      formData.append("description", description);
      formData.append("image", image);
      formData.append("userId", userId);

      const response = await fetch("/api/designs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ontwerp maken mislukt");
      }

      const data = await response.json();
      const newDesignId = data.id;

      // Step 2: Start the AI generation process
      setGenerationStatus("generating");

      const generationResponse = await fetch("/api/replicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ designId: newDesignId }),
      });

      if (!generationResponse.ok) {
        const error = await generationResponse.json();
        throw new Error(error.error || "Generatie starten mislukt");
      }

      const generationData = await generationResponse.json();

      toast({
        title: "Succes",
        description:
          "Je ontwerp wordt gegenereerd. Je wordt doorgestuurd naar de detailpagina.",
      });

      // Redirect to the design detail page where the user can see the generation progress
      router.push(`/design/${newDesignId}`);
    } catch (error) {
      toast({
        title: "Fout",
        description:
          error instanceof Error ? error.message : "Er is iets misgegaan",
        variant: "destructive",
      });
      setGenerationStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="roomType">Type Ruimte</Label>
        <Select
          value={roomType}
          onValueChange={setRoomType}
          disabled={disabled || isLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecteer een type ruimte" />
          </SelectTrigger>
          <SelectContent>
            {roomTypes.map((room) => (
              <SelectItem key={room.value} value={room.value}>
                {room.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Kamer Afbeelding</Label>
        <Card className="relative border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <input
              type="file"
              id="image"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
              disabled={disabled || isLoading}
            />
            {imagePreview ? (
              <div className="relative w-full aspect-video">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Kamer voorbeeld"
                  fill
                  className="object-contain"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  disabled={disabled || isLoading}>
                  Afbeelding Wijzigen
                </Button>
              </div>
            ) : (
              <Label
                htmlFor="image"
                className="flex flex-col items-center justify-center gap-2 py-10 cursor-pointer w-full">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="font-medium">Klik om te uploaden</span>
                <span className="text-sm text-muted-foreground">
                  JPG, PNG, WEBP tot 5MB
                </span>
              </Label>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2">
        <Label>Ontwerp Stijl</Label>
        <RadioGroup
          defaultValue="minimalist"
          value={style}
          onValueChange={setStyle}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
          disabled={disabled || isLoading}>
          <Label
            htmlFor="minimalist"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem
              value="minimalist"
              id="minimalist"
              className="sr-only"
            />
            <span className="text-center">Minimalistisch</span>
          </Label>
          <Label
            htmlFor="modern"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem value="modern" id="modern" className="sr-only" />
            <span className="text-center">Modern</span>
          </Label>
          <Label
            htmlFor="scandinavian"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem
              value="scandinavian"
              id="scandinavian"
              className="sr-only"
            />
            <span className="text-center">Scandinavisch</span>
          </Label>
          <Label
            htmlFor="industrial"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem
              value="industrial"
              id="industrial"
              className="sr-only"
            />
            <span className="text-center">Industrieel</span>
          </Label>
          <Label
            htmlFor="bohemian"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem
              value="bohemian"
              id="bohemian"
              className="sr-only"
            />
            <span className="text-center">Bohemian</span>
          </Label>
          <Label
            htmlFor="luxury"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem value="luxury" id="luxury" className="sr-only" />
            <span className="text-center">Luxe</span>
          </Label>
        </RadioGroup>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Extra Details (Optioneel)</Label>
        <Textarea
          id="description"
          placeholder="Beschrijf eventuele specifieke wensen of voorkeuren voor je herontwerp"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled || isLoading}
        />
      </div>

      <Button
        type="submit"
        disabled={disabled || isLoading || !image || !roomType}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {generationStatus === "uploading" && "Uploaden..."}
            {generationStatus === "generating" && "Ontwerp Genereren..."}
            {!generationStatus && "Verwerken..."}
          </>
        ) : (
          "Ontwerp Genereren"
        )}
      </Button>
    </form>
  );
}
