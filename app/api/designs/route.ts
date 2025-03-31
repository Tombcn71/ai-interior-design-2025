import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { useUserCredit } from "@/lib/user"
import { generateRoomDesign } from "@/lib/replicate"
import { put } from "@vercel/blob"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    // Check if user has credits
    const hasCreditPromise = useUserCredit(userId)

    const formData = await req.formData()
    const name = formData.get("name") as string
    const style = formData.get("style") as string
    const description = formData.get("description") as string
    const image = formData.get("image") as File

    if (!name || !style || !image) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const hasCredit = await hasCreditPromise

    if (!hasCredit) {
      return NextResponse.json({ message: "Insufficient credits" }, { status: 400 })
    }

    // Upload original image to Vercel Blob
    const { url: originalImageUrl } = await put(`rooms/${session.user.id}/${Date.now()}-original.jpg`, image, {
      access: "public",
    })

    // Create design record in database
    const design = await prisma.design.create({
      data: {
        name,
        style,
        description,
        originalImage: originalImageUrl,
        status: "processing",
        userId: session.user.id,
      },
    })

    // Start async processing
    generateRoomDesign(design.id, originalImageUrl, style, description).catch(console.error)

    return NextResponse.json(
      {
        message: "Design creation started",
        id: design.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Design creation error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

