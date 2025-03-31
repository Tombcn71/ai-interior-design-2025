import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const session = await getServerSession(authConfig)

  if (!session) {
    redirect("/login")
  }

  if (!searchParams.session_id) {
    redirect("/dashboard")
  }

  return (
    <div className="container py-10 px-4 md:px-8 mx-auto">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. Your credits have been added to your account.
        </p>
        <div className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/dashboard/new-design">Create New Design</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

