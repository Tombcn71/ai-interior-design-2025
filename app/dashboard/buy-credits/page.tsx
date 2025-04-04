import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StripePricingTable } from "@/components/stripe-pricing-table";

export default async function BuyCreditsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get Stripe configuration from environment variables
  const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Ensure Stripe configuration exists
  if (!pricingTableId || !publishableKey) {
    return (
      <div className="container py-10 px-4 md:px-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Credits Kopen</h1>
          <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">
              Stripe configuratie ontbreekt
            </h2>
            <p className="text-yellow-700">
              De Stripe configuratie is niet volledig. Neem contact op met de
              beheerder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 px-4 md:px-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Credits Kopen</h1>
        <p className="text-muted-foreground mb-8">
          Koop credits om nieuwe interieurontwerpen te genereren. Elk ontwerp
          kost 1 credit.
        </p>

        <StripePricingTable
          pricingTableId={pricingTableId}
          publishableKey={publishableKey}
          successUrl={`${appUrl}/dashboard?payment=success`}
          userId={session.user.id}
          userEmail={session.user.email || undefined}
        />
      </div>
    </div>
  );
}
