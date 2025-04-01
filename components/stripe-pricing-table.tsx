"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Laad het Stripe Pricing Table script
    const loadScript = async () => {
      try {
        if (
          document.querySelector(
            'script[src="https://js.stripe.com/v3/pricing-table.js"]'
          )
        ) {
          setScriptLoaded(true);
          setIsLoading(false);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/pricing-table.js";
        script.async = true;
        script.onload = () => {
          setScriptLoaded(true);
          setIsLoading(false);
        };
        script.onerror = () => {
          setError("Kon Stripe Pricing Table niet laden");
          setIsLoading(false);
        };
        document.body.appendChild(script);
      } catch (err) {
        setError("Er is een fout opgetreden bij het laden van Stripe");
        setIsLoading(false);
      }
    };

    loadScript();

    // Cleanup
    return () => {
      // Verwijder event listeners indien nodig
    };
  }, []);

  // Gebruik fallback als er een fout is
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={() => router.push("/dashboard/buy-credits?fallback=true")}>
          Gebruik alternatieve betaalmethode
        </Button>
      </div>
    );
  }

  // Toon loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Gebruik dangerouslySetInnerHTML om de custom element te renderen
  const stripePricingTableHTML = `
    <stripe-pricing-table
      pricing-table-id="${pricingTableId}"
      publishable-key="${publishableKey}"
      client-reference-id="${session?.user?.id || ""}"
    ></stripe-pricing-table>
  `;

  return (
    <div className="w-full">
      {scriptLoaded && (
        <div dangerouslySetInnerHTML={{ __html: stripePricingTableHTML }} />
      )}
    </div>
  );
}
