import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting migration to add fields to Design model...");

    // For PostgreSQL
    // Add status field if it doesn't exist
    await prisma.$executeRaw`ALTER TABLE "Design" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending'`;

    // Add predictionId field if it doesn't exist
    await prisma.$executeRaw`ALTER TABLE "Design" ADD COLUMN IF NOT EXISTS "predictionId" TEXT`;

    // Add errorMessage field if it doesn't exist
    await prisma.$executeRaw`ALTER TABLE "Design" ADD COLUMN IF NOT EXISTS "errorMessage" TEXT`;

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
