import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting migration to add isAdmin column...");

    // For PostgreSQL
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false`;

    // For MySQL
    // await prisma.$executeRaw`ALTER TABLE User ADD COLUMN IF NOT EXISTS isAdmin BOOLEAN NOT NULL DEFAULT false`

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
