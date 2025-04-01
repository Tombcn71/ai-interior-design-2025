import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StripePricingTable } from "@/components/stripe-pricing-table";

export default async function BuyCreditsPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  // Haal de Stripe configuratie op uit de environment variables
  const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!pricingTableId || !publishableKey) {
    return (
      <div className="container py-10 px-4 md:px-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Buy Credits</h1>
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
            Stripe configuration is missing. Please set the
            NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID and
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variables.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 px-4 md:px-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Buy Credits</h1>
        <p className="text-muted-foreground mb-8">
          Purchase credits to generate new interior designs. Each design costs 1
          credit.
        </p>

        <StripePricingTable
          pricingTableId={pricingTableId}
          publishableKey={publishableKey}
        />
      </div>
    </div>
  );
}
