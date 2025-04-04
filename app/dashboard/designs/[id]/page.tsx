import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Update your user query to match your actual design schema
  const user = await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
    select: {
      id: true,
      credits: true,
      name: true,
      email: true,
      // Update the design selection to match your schema
      designs: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          // Only include fields that exist in your design model
          createdAt: true,
          // Add any other fields that exist in your design model
        },
      },
    },
  });

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <p>Credits: {user.credits}</p>
          <h2>Your Recent Designs:</h2>
          <ul>
            {user.designs.map((design) => (
              <li key={design.id}>
                Design ID: {design.id} - Created At:{" "}
                {design.createdAt.toString()}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
