import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StripePricingTable } from "@/components/stripe-pricing-table";
import { CreditPackages } from "@/components/credit-packages";

export default async function BuyCreditsPage({
  searchParams,
}: {
  searchParams: { fallback?: string };
}) {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  // Haal de Stripe configuratie op uit de environment variables
  const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  // Gebruik de fallback als de URL parameter aanwezig is of als de Stripe configuratie ontbreekt
  const useFallback =
    searchParams.fallback === "true" || !pricingTableId || !publishableKey;

  return (
    <div className="container py-10 px-4 md:px-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Credits Kopen</h1>
        <p className="text-muted-foreground mb-8">
          Koop credits om nieuwe interieurontwerpen te genereren. Elk ontwerp
          kost 1 credit.
        </p>

        {useFallback ? (
          <CreditPackages userId={session.user.id} />
        ) : (
          <StripePricingTable
            pricingTableId={pricingTableId!}
            publishableKey={publishableKey!}
          />
        )}
      </div>
    </div>
  );
}
