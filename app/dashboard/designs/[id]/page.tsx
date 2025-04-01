import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download, Share } from "lucide-react";
import Image from "next/image";
import { DesignStatus } from "@/components/design-status";

export default async function DesignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  const design = await prisma.design.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!design) {
    notFound();
  }

  return (
    <div className="container py-10 px-4 md:px-8 mx-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Terug</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{design.name}</h1>
          <div className="ml-auto flex gap-2">
            {design.status === "completed" && (
              <>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Downloaden
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="mr-2 h-4 w-4" /> Delen
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-8">
          <DesignStatus status={design.status} />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Originele Kamer</h2>
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                {design.originalImage && (
                  <Image
                    src={design.originalImage || "/placeholder.svg"}
                    alt="Originele kamer"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-medium">Herontworpen Kamer</h2>
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                {design.status === "completed" && design.resultImage ? (
                  <Image
                    src={design.resultImage || "/placeholder.svg"}
                    alt="Herontworpen kamer"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    {design.status === "processing" ? (
                      <p>Je ontwerp wordt verwerkt...</p>
                    ) : design.status === "failed" ? (
                      <p>Ontwerp genereren mislukt</p>
                    ) : (
                      <p>Wachten om verwerking te starten</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h2 className="text-lg font-medium">Ontwerp Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <dt className="text-sm font-medium text-muted-foreground">
                  Stijl
                </dt>
                <dd className="mt-1 text-sm">{design.style}</dd>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <dt className="text-sm font-medium text-muted-foreground">
                  Gemaakt
                </dt>
                <dd className="mt-1 text-sm">
                  {new Date(design.createdAt).toLocaleString()}
                </dd>
              </div>
              {design.completedAt && (
                <div className="bg-muted p-4 rounded-lg">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Voltooid
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(design.completedAt).toLocaleString()}
                  </dd>
                </div>
              )}
              {design.description && (
                <div className="bg-muted p-4 rounded-lg md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Extra Details
                  </dt>
                  <dd className="mt-1 text-sm">{design.description}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex justify-center mt-4">
            <Button asChild>
              <Link href="/dashboard/new-design">Maak Nog Een Ontwerp</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
