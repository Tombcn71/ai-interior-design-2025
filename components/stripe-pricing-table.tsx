"use client";

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
  return (
    <>
      <Script
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="afterInteractive"
      />
      <div
        dangerouslySetInnerHTML={{
          __html: `<stripe-pricing-table 
          pricing-table-id="${pricingTableId}" 
          publishable-key="${publishableKey}"
          ${userId ? `client-reference-id="${userId}"` : ""}
          ${userEmail ? `customer-email="${userEmail}"` : ""}
          ${successUrl ? `success-url="${successUrl}"` : ""}
        ></stripe-pricing-table>`,
        }}
      />
    </>
  );
}
