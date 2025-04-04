import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DesignDetail } from "./design-detail";
import type { Design } from "@/types/design";

export default async function DesignDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { predictionId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect(`/login?callbackUrl=/design/${params.id}`);
  }

  // Get the design from the database
  const design = (await prisma.design.findUnique({
    where: { id: params.id },
  })) as Design | null;

  if (!design) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Design Not Found</h1>
        <p>The design you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  // Check if the design belongs to the user
  if (design.userId !== session.user.id) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to view this design.</p>
      </div>
    );
  }

  // Get the prediction ID from the URL if available
  const predictionId =
    searchParams.predictionId || design.predictionId || undefined;

  return (
    <div className="container mx-auto p-4">
      <DesignDetail design={design} initialPredictionId={predictionId} />
    </div>
  );
}
