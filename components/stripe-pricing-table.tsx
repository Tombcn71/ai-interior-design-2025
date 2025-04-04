"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface StripePricingTableProps {
  pricingTableId: string;
  publishableKey: string;
  successUrl?: string;
  userId?: string;
  userEmail?: string;
}

export function StripePricingTable({
  pricingTableId,
  publishableKey,
  successUrl,
  userId,
  userEmail,
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

    // Add user ID as client reference ID
    if (userId) {
      stripePricingTable.setAttribute("client-reference-id", userId);
    }

    // Add customer email if available
    if (userEmail) {
      stripePricingTable.setAttribute("customer-email", userEmail);
    }

    // Add success URL if available
    if (successUrl) {
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
  }, [pricingTableId, publishableKey, successUrl, userId, userEmail]);

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
