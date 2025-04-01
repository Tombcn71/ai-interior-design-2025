"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface StripePricingTableProps {
  pricingTableId: string;
  publishableKey: string;
}

export function StripePricingTable({
  pricingTableId,
  publishableKey,
}: StripePricingTableProps) {
  const router = useRouter();

  // Vereenvoudigde versie die direct naar de CreditPackages component verwijst
  useEffect(() => {
    // Redirect naar de fallback component
    router.push("/dashboard/buy-credits?fallback=true");
  }, [router]);

  return (
    <div className="text-center py-8">
      <p className="mb-4">Stripe Pricing Table wordt geladen...</p>
      <Button
        onClick={() => router.push("/dashboard/buy-credits?fallback=true")}>
        Gebruik alternatieve betaalmethode
      </Button>
    </div>
  );
}
