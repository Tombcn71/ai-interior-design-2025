"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Download } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import type { Design } from "@/types/design";

interface DesignDetailProps {
  design: Design;
  initialPredictionId?: string;
}

export function DesignDetail({
  design: initialDesign,
  initialPredictionId,
}: DesignDetailProps) {
  const [design, setDesign] = useState<Design>(initialDesign);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Function to start generation if not already started
  const startGeneration = async () => {
    if (design.status === "completed" || design.status === "processing") {
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ designId: design.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start generation");
      }

      // Update the local design state
      setDesign({
        ...design,
        status: "processing",
        predictionId: data.prediction.id,
      });

      toast({
        title: "Design generation started",
        description: "We'll notify you when it's ready",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to start generation",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Function to check the status of the design
  const checkStatus = async () => {
    const predictionId = design.predictionId || initialPredictionId;
    if (!predictionId) {
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch(
        `/api/replicate/status?designId=${design.id}&predictionId=${predictionId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check status");
      }

      // If the API returned updated design data
      if (data.design) {
        setDesign(data.design);
      }

      // Show toast based on status
      if (
        data.prediction?.status === "succeeded" &&
        design.status !== "completed"
      ) {
        toast({
          title: "Design generation complete",
          description: "Your new interior design is ready!",
        });
      } else if (
        data.prediction?.status === "failed" &&
        design.status !== "failed"
      ) {
        toast({
          title: "Generation failed",
          description: data.prediction.error || "Please try again later",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to check status",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Check status on component mount and periodically if still processing
  useEffect(() => {
    // If the design is still processing, check status
    if (design.status === "processing" || initialPredictionId) {
      // Check immediately
      checkStatus();

      // Then set up interval for checking
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [design.status, initialPredictionId]);

  // Get room type name
  const getRoomTypeName = (roomType?: string | null) => {
    if (!roomType) return "Kamer";

    const roomTypes: Record<string, string> = {
      living_room: "Woonkamer",
      bedroom: "Slaapkamer",
      kitchen: "Keuken",
      bathroom: "Badkamer",
      dining_room: "Eetkamer",
      office: "Thuiskantoor",
      kids_room: "Kinderkamer",
      hallway: "Gang",
      other: "Andere Ruimte",
    };

    return roomTypes[roomType] || "Kamer";
  };

  // Get style name
  const getStyleName = (style?: string | null) => {
    if (!style) return "";

    const styles: Record<string, string> = {
      minimalist: "Minimalistisch",
      modern: "Modern",
      scandinavian: "Scandinavisch",
      industrial: "Industrieel",
      bohemian: "Bohemian",
      luxury: "Luxe",
    };

    return styles[style] || style;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {getRoomTypeName(design.roomType)}{" "}
          {getStyleName(design.style) && `- ${getStyleName(design.style)}`}
        </h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">Terug naar Dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Original Image */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Originele Afbeelding</h2>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            {design.imageUrl ? (
              <Image
                src={design.imageUrl || "/placeholder.svg"}
                alt="Original room"
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Geen afbeelding beschikbaar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Design */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Gegenereerd Ontwerp</h2>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            {design.status === "completed" && design.resultUrl ? (
              <Image
                src={design.resultUrl || "/placeholder.svg"}
                alt="Generated design"
                fill
                className="object-contain"
              />
            ) : design.status === "processing" || isChecking ? (
              <div className="flex h-full flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium">
                  {design.status === "pending"
                    ? "Wachten om te beginnen..."
                    : "Ontwerp genereren..."}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Dit kan enkele minuten duren
                </p>
              </div>
            ) : design.status === "failed" ? (
              <div className="flex h-full flex-col items-center justify-center p-4">
                <p className="text-sm font-medium text-red-500">
                  Generatie mislukt
                </p>
                {design.errorMessage && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {design.errorMessage}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Nog geen ontwerp gegenereerd
                </p>
                <Button onClick={startGeneration} disabled={isChecking}>
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Bezig...
                    </>
                  ) : (
                    "Genereer Ontwerp"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {design.status === "processing" && (
              <Button
                onClick={checkStatus}
                disabled={isChecking}
                variant="outline"
                className="w-full">
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Status
                    Controleren
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> Status Controleren
                  </>
                )}
              </Button>
            )}

            {design.status === "completed" && design.resultUrl && (
              <Button
                onClick={() => window.open(design.resultUrl!, "_blank")}
                className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download Ontwerp
              </Button>
            )}

            {design.status === "failed" && (
              <Button
                onClick={startGeneration}
                variant="outline"
                className="w-full"
                disabled={isChecking}>
                <RefreshCw className="mr-2 h-4 w-4" /> Opnieuw Proberen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Design Details */}
      {design.description && (
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">Extra Details</h2>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-card-foreground">{design.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
