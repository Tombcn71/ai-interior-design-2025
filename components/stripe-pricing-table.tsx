"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface StripePricingTableProps {
  pricingTableId: string;
  publishableKey: string;
  successUrl?: string;
}

export function StripePricingTable({
  pricingTableId,
  publishableKey,
  successUrl,
}: StripePricingTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === "undefined" || !containerRef.current) return;

    // Clean up any existing pricing tables
    const existingTables = containerRef.current.querySelectorAll(
      "stripe-pricing-table"
    );
    existingTables.forEach((el) => el.remove());

    // Create the stripe pricing table element
    const stripePricingTable = document.createElement("stripe-pricing-table");
    stripePricingTable.setAttribute("pricing-table-id", pricingTableId);
    stripePricingTable.setAttribute("publishable-key", publishableKey);

    if (successUrl) {
      stripePricingTable.setAttribute(
        "client-reference-id",
        `user_${Date.now()}`
      );
      stripePricingTable.setAttribute("success-url", successUrl);
    }

    // Append it to the container
    containerRef.current.appendChild(stripePricingTable);

    // Cleanup function
    return () => {
      if (containerRef.current) {
        const tables = containerRef.current.querySelectorAll(
          "stripe-pricing-table"
        );
        tables.forEach((el) => el.remove());
      }
    };
  }, [pricingTableId, publishableKey, successUrl]);

  return (
    <>
      <Script
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="afterInteractive"
      />
      <div className="w-full" ref={containerRef}></div>
    </>
  );
}
