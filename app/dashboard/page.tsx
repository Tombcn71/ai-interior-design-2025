import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Dashboard() {
  // Get the session with proper typing
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>Please log in</div>;
  }

  try {
    // Get user with their designs (only fetching the ID of each design)
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
          },
        },
      },
    });

    if (!user) {
      return <div>User not found</div>;
    }

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {user.name || "User"}
          </h2>
          <p className="mb-4">
            Your current credits:{" "}
            <span className="font-bold">{user.credits || 0}</span>
          </p>

          <div className="mt-4">
            <Link
              href="/design/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create New Design
            </Link>

            <Link
              href="/dashboard/buy-credits"
              className="ml-4 bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
              Buy Credits
            </Link>
          </div>
        </div>

        {/* Design History Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Recent Designs</h2>

          {user.designs && user.designs.length > 0 ? (
            <div className="space-y-2">
              {user.designs.map((design) => (
                <div
                  key={design.id}
                  className="p-3 border rounded hover:bg-gray-50">
                  <Link
                    href={`/design/${design.id}`}
                    className="text-blue-600 hover:underline">
                    Design #{design.id.substring(0, 8)}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't created any designs yet.</p>
              <Link
                href="/design/new"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Create Your First Design
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>There was an error loading your dashboard.</p>
          <p className="text-sm text-gray-700 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }
}
