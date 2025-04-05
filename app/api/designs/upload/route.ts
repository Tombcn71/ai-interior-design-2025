import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const roomType = formData.get("roomType") as string;
    const style = formData.get("style") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type is required" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(
      `rooms/${session.user.id}/${Date.now()}-${file.name}`,
      file,
      {
        access: "public",
      }
    );

    console.log("Blob upload successful:", blob);

    // Create a design record in the database
    const design = await prisma.design.create({
      data: {
        userId: session.user.id,
        imageUrl: blob.url,
        roomType,
        style,
        description: description || null,
        status: "pending",
      },
    });

    console.log("Designs API called");

    return NextResponse.json({
      success: true,
      design,
      blob,
    });
  } catch (error) {
    console.error("Error in design upload:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
