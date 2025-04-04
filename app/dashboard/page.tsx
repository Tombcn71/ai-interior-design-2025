import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get the session
  const session = await getServerSession(authOptions);

  // If no session, redirect to login
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Make sure we have a user ID before querying the database
  if (!session.user.id) {
    console.error("User ID is undefined in session:", session);
    redirect("/login?callbackUrl=/dashboard&error=missing_user_id");
  }

  // Now safely query the database with a valid user ID
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  // Rest of your dashboard code...

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Credits: {user?.credits || 0}</p>
      {/* Rest of your dashboard UI */}
    </div>
  );
}
