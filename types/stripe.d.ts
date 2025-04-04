import type React from "react";
// This file extends TypeScript's JSX namespace to include custom elements

declare namespace JSX {
  interface IntrinsicElements {
    "stripe-pricing-table": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        "pricing-table-id"?: string;
        "publishable-key"?: string;
        "client-reference-id"?: string;
        "success-url"?: string;
      },
      HTMLElement
    >;
  }
}
