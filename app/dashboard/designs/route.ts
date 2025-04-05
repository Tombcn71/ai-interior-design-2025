import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the form data
    const formData = await req.formData();
    const roomType = formData.get("roomType") as string;
    const style = formData.get("style") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as File;

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user || user.credits < 1) {
      return NextResponse.json(
        { message: "Not enough credits" },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { message: "No image provided" },
        { status: 400 }
      );
    }

    // Upload the image to Vercel Blob
    const blob = await put(
      `rooms/${session.user.id}/${Date.now()}-${image.name}`,
      image,
      {
        access: "public",
      }
    );

    // Create the design in the database
    const design = await prisma.design.create({
      data: {
        userId: session.user.id,
        roomType: roomType,
        style: style,
        description: description,
        imageUrl: blob.url,
        status: "pending",
      },
    });

    // Deduct 1 credit from the user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json({ id: design.id });
  } catch (error) {
    console.error("Error creating design:", error);
    return NextResponse.json(
      {
        message: "Failed to create design",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
