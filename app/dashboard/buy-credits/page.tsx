import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreditPackages } from "@/components/credit-packages"

export default async function BuyCreditsPage() {
  const session = await getServerSession(authConfig)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-10 px-4 md:px-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Buy Credits</h1>
        <p className="text-muted-foreground mb-8">
          Purchase credits to generate new interior designs. Each design costs 1 credit.
        </p>

        <CreditPackages userId={session.user.id} />
      </div>
    </div>
  )
}

