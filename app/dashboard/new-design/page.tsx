import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserCredits } from "@/lib/user";
import { NewDesignForm } from "@/components/new-design-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewDesignPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  const credits = await getUserCredits(session.user.id);
  const hasCredits = credits > 0;

  return (
    <div className="container py-10 px-4 md:px-8 mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Design</h1>

        {!hasCredits && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Insufficient Credits</AlertTitle>
            <AlertDescription>
              You need at least 1 credit to create a new design.{" "}
              <Link
                href="/dashboard/buy-credits"
                className="font-medium underline underline-offset-4">
                Buy credits
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Your Available Credits: {credits}
              </h2>
              <p className="text-sm text-muted-foreground">
                Each design costs 1 credit
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/buy-credits">Buy More Credits</Link>
            </Button>
          </div>

          <NewDesignForm />
        </div>
      </div>
    </div>
  );
}
