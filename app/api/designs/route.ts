import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@/lib/blob";

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

    // Log information about the image for debugging
    console.log("Image details:", {
      name: image.name,
      type: image.type,
      size: image.size,
    });

    // Upload the image to Vercel Blob with error handling
    let imageUrl;
    try {
      // Create a unique filename
      const filename = `rooms/${
        session.user.id
      }/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      console.log("Uploading to Vercel Blob:", filename);

      const blob = await put(filename, image, {
        access: "public",
        addRandomSuffix: true, // Add random suffix to avoid name collisions
      });

      console.log("Blob upload successful:", blob);
      imageUrl = blob.url;
    } catch (blobError) {
      console.error("Error uploading to Vercel Blob:", blobError);

      // Return an error response
      return NextResponse.json(
        {
          message: "Failed to upload image",
          error:
            blobError instanceof Error ? blobError.message : String(blobError),
        },
        { status: 500 }
      );
    }

    // Create the design in the database
    const design = await prisma.design.create({
      data: {
        userId: session.user.id,
        roomType: roomType,
        style: style,
        description: description,
        imageUrl: imageUrl,
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
