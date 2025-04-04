import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DesignForm from "./design-form";
import { Button } from "@/components/ui/button";

export default async function NewDesignPage() {
  // Get the session
  const session = await getServerSession(authOptions);

  // If no session, redirect to login
  if (!session) {
    return redirect("/login?callbackUrl=/design/new");
  }

  // Get user data including credits
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      credits: true,
    },
  });

  if (!user) {
    return redirect("/login?callbackUrl=/design/new&error=user_not_found");
  }

  // Check if user has enough credits
  if (user.credits < 1) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create New Design</h1>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You don't have enough credits to create a new design.
              </p>
              <p className="mt-2">
                <Button
                  asChild
                  className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <Link href="/dashboard/buy-credits">Buy credits</Link>
                </Button>
              </p>
            </div>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href="/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Design</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="mb-4">
          Your current credits:{" "}
          <span className="font-bold">{user.credits}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Creating a new design will use 1 credit.
        </p>

        <DesignForm userId={user.id} />
      </div>

      <Button asChild variant="outline" className="mt-4">
        <Link href="/dashboard">← Back to Dashboard</Link>
      </Button>
    </div>
  );
}
