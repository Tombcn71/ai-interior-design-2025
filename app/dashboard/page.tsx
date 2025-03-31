import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getUserCredits } from "@/lib/user"
import { CreditCard, History, Plus } from "lucide-react"
import { DesignHistory } from "@/components/design-history"

export default async function DashboardPage() {
  const session = await getServerSession(authConfig)

  if (!session) {
    redirect("/login")
  }

  const credits = await getUserCredits(session.user.id)

  return (
    <div className="container py-10 px-4 md:px-8 mx-auto">
      <div className="grid gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/new-design">
              <Plus className="mr-2 h-4 w-4" /> New Design
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{credits}</div>
              <p className="text-xs text-muted-foreground">Use credits to generate new designs</p>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/dashboard/buy-credits">Buy More Credits</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <History className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{/* This would be dynamic in a real app */}3 Designs</div>
              <p className="text-xs text-muted-foreground">In the last 30 days</p>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/dashboard/history">View History</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Designs</h2>
          <DesignHistory limit={3} />
        </div>
      </div>
    </div>
  )
}

