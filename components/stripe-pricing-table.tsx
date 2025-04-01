"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface StripePricingTableProps {
  pricingTableId: string;
  publishableKey: string;
}

export function StripePricingTable({
  pricingTableId,
  publishableKey,
}: StripePricingTableProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Laad Stripe.js en Pricing Table script
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      setIsLoading(false);
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Luister naar Stripe events
  useEffect(() => {
    if (!scriptLoaded) return;

    const handlePriceClick = async (event: any) => {
      if (event.detail.priceId) {
        try {
          setIsLoading(true);
          const response = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              priceId: event.detail.priceId,
              userId: session?.user?.id,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to create checkout session"
            );
          }

          // Redirect naar Stripe checkout
          window.location.href = data.url;
        } catch (error) {
          toast({
            title: "Error",
            description:
              error instanceof Error ? error.message : "Something went wrong",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }
    };

    // Voeg event listener toe
    window.addEventListener(
      "stripe-pricing-table:price-click",
      handlePriceClick
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "stripe-pricing-table:price-click",
        handlePriceClick
      );
    };
  }, [scriptLoaded, session, toast, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {scriptLoaded && (
        // @ts-ignore - Stripe custom element
        <stripe-pricing-table
          pricing-table-id={pricingTableId}
          publishable-key={publishableKey}
          client-reference-id={session?.user?.id}></stripe-pricing-table>
      )}
    </div>
  );
}
