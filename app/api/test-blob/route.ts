import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Check if the isAdmin column exists
    let hasIsAdmin = false;
    try {
      // Try to query a user with isAdmin field
      await prisma.user.findFirst({
        select: { isAdmin: true },
      });
      hasIsAdmin = true;
    } catch (error) {
      console.log("isAdmin field doesn't exist yet");
    }

    // If isAdmin doesn't exist, add it using raw SQL
    if (!hasIsAdmin) {
      // This is a PostgreSQL-specific query - adjust for your database
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false`;
      console.log("Added isAdmin column to User table");
    }

    return NextResponse.json({
      success: true,
      message: "Database migration completed successfully",
      hasIsAdmin,
    });
  } catch (error) {
    console.error("Database migration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database migration failed",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
