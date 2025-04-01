"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CreditPackagesProps {
  userId: string;
}

export function CreditPackages({ userId }: CreditPackagesProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const packages = [
    { id: "basic", name: "Basis", credits: 5, price: 4.99 },
    {
      id: "standard",
      name: "Standaard",
      credits: 15,
      price: 12.99,
      popular: true,
    },
    { id: "premium", name: "Premium", credits: 50, price: 39.99 },
  ];

  const handlePurchase = async (packageId: string) => {
    setIsLoading(packageId);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout sessie aanmaken mislukt");
      }

      // Redirect naar Stripe checkout of success page
      window.location.href = data.url;
    } catch (error) {
      toast({
        title: "Fout",
        description:
          error instanceof Error ? error.message : "Er is iets misgegaan",
        variant: "destructive",
      });
      setIsLoading(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {packages.map((pkg) => (
        <Card
          key={pkg.id}
          className={
            pkg.popular ? "border-primary shadow-md relative" : "relative"
          }>
          {pkg.popular && (
            <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Meest Populair
            </div>
          )}
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription>{pkg.credits} credits</CardDescription>
            <div className="mt-2">
              <div className="text-3xl font-bold">€{pkg.price.toFixed(2)}</div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span>
                <span>{pkg.credits} kamer herontwerpen</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span>
                <span>Hoogwaardige AI generaties</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span>
                <span>Download in hoge resolutie</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handlePurchase(pkg.id)}
              disabled={isLoading !== null}>
              {isLoading === pkg.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verwerken
                </>
              ) : (
                "Nu Kopen"
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
