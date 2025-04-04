import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { payment?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      credits: true,
      name: true,
      email: true,
      designs: {
        select: {
          id: true,
          // Add other design fields you need
        },
        orderBy: {
          id: "desc",
        },
        take: 5,
      },
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const showPaymentSuccess = searchParams.payment === "success";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {showPaymentSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Betaling succesvol!</AlertTitle>
          <AlertDescription>
            Je credits zijn toegevoegd aan je account en zijn direct beschikbaar
            om te gebruiken.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Welkom, {user.name || "Gebruiker"}
        </h2>
        <p className="mb-4">
          Je huidige credits:{" "}
          <span className="font-bold">{user.credits || 0}</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/design/new">Nieuw Ontwerp Maken</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/dashboard/buy-credits">Credits Kopen</Link>
          </Button>
        </div>
      </div>

      {/* Design History Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recente Ontwerpen</h2>
          <Link
            href="/dashboard/credit-history"
            className="text-blue-600 hover:underline text-sm">
            Bekijk alle ontwerpen
          </Link>
        </div>

        {user.designs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.designs.map((design) => (
              <div key={design.id} className="border rounded-lg p-4">
                <div className="font-medium mb-2">
                  Ontwerp ID: {design.id.substring(0, 8)}...
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/design/${design.id}`}>Bekijken</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Je hebt nog geen ontwerpen gemaakt.</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/design/new">Maak je eerste ontwerp</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
