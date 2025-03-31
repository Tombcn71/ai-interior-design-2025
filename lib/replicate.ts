import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateRoomDesign(designId: string, imageUrl: string, style: string, description: string) {
  try {
    // Update design status
    await prisma.design.update({
      where: { id: designId },
      data: { status: "processing" },
    })

    // Prepare prompt based on style and description
    let prompt = `Redesign this room in ${style} style`
    if (description) {
      prompt += `. ${description}`
    }

    // Call Replicate API
    const output = await replicate.run(
      "jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          structure: "room",
          num_samples: "1",
        },
      },
    )

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error("Failed to generate design")
    }

    // Get the generated image URL
    const generatedImageUrl = output[0] as string

    // Download the image and upload to Vercel Blob for persistence
    const response = await fetch(generatedImageUrl)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { url: resultImageUrl } = await put(`designs/${designId}-result.png`, buffer, {
      access: "public",
    })

    // Update design with result
    await prisma.design.update({
      where: { id: designId },
      data: {
        resultImage: resultImageUrl,
        status: "completed",
        completedAt: new Date(),
      },
    })

    return resultImageUrl
  } catch (error) {
    console.error("Design generation error:", error)

    // Update design status to failed
    await prisma.design.update({
      where: { id: designId },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })

    throw error
  }
}

