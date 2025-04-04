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
  // Use a more TypeScript-friendly approach with a dynamic element
  const attributes: Record<string, string> = {
    "pricing-table-id": pricingTableId,
    "publishable-key": publishableKey,
  };

  if (userId) attributes["client-reference-id"] = userId;
  if (userEmail) attributes["customer-email"] = userEmail;
  if (successUrl) attributes["success-url"] = successUrl;

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
