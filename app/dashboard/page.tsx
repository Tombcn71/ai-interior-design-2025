import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Debug session information
    console.log(
      "Dashboard session:",
      JSON.stringify(
        {
          exists: !!session,
          user: session?.user
            ? {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
              }
            : null,
        },
        null,
        2
      )
    );

    // If no session, redirect to login
    if (!session) {
      console.log("No session found, redirecting to login");
      return redirect("/login?callbackUrl=/dashboard");
    }

    // If no user in session, redirect to login
    if (!session.user) {
      console.log("No user in session, redirecting to login");
      return redirect("/login?callbackUrl=/dashboard&error=no_user");
    }

    // If no user ID, try to find user by email
    let user;
    if (!session.user.id && session.user.email) {
      console.log(
        "No user ID in session, trying to find by email:",
        session.user.email
      );
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, credits: true, name: true, email: true },
      });

      if (user) {
        console.log("Found user by email:", user.id);
      } else {
        console.log("User not found by email, redirecting to login");
        return redirect("/login?callbackUrl=/dashboard&error=user_not_found");
      }
    } else if (session.user.id) {
      // Query the database with the user ID from session
      console.log("Looking up user by ID:", session.user.id);
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, credits: true, name: true, email: true },
      });

      if (!user) {
        console.log("User not found by ID, redirecting to login");
        return redirect("/login?callbackUrl=/dashboard&error=user_not_found");
      }
    } else {
      console.log("No user ID or email in session, redirecting to login");
      return redirect("/login?callbackUrl=/dashboard&error=no_user_identifier");
    }

    // At this point, we should have a valid user
    console.log("User found:", user?.id);

    // Render the dashboard
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {user?.name || "User"}
          </h2>
          <p className="mb-4">
            Your current credits:{" "}
            <span className="font-bold">{user?.credits || 0}</span>
          </p>

          {/* Add your dashboard content here */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Recent Designs</h3>
              <p className="text-gray-600">View your recent interior designs</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Buy Credits</h3>
              <p className="text-gray-600">
                Purchase more credits to create designs
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Account Settings</h3>
              <p className="text-gray-600">
                Update your profile and preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Log the error
    console.error("Dashboard error:", error);

    // Return a fallback UI
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>
            There was an error loading your dashboard. Please try again later.
          </p>
          <a
            href="/login"
            className="text-blue-600 underline mt-2 inline-block">
            Return to login
          </a>
        </div>
      </div>
    );
  }
}
