import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"

interface DesignHistoryProps {
  limit?: number
}

export function DesignHistory({ limit }: DesignHistoryProps) {
  // This would be fetched from your database in a real app
  const designs = [
    {
      id: "1",
      name: "Living Room Redesign",
      style: "Minimalist",
      createdAt: "2023-04-01",
      originalImage: "/placeholder.svg?height=300&width=400",
      resultImage: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "2",
      name: "Kitchen Makeover",
      style: "Scandinavian",
      createdAt: "2023-03-28",
      originalImage: "/placeholder.svg?height=300&width=400",
      resultImage: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "3",
      name: "Bedroom Update",
      style: "Modern",
      createdAt: "2023-03-25",
      originalImage: "/placeholder.svg?height=300&width=400",
      resultImage: "/placeholder.svg?height=300&width=400",
    },
  ].slice(0, limit)

  if (designs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No designs yet</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/new-design">Create Your First Design</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {designs.map((design) => (
        <Card key={design.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative aspect-video">
            <div className="absolute inset-0 grid grid-cols-2">
              <div className="relative">
                <Image
                  src={design.originalImage || "/placeholder.svg"}
                  alt="Original room"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Before</div>
              </div>
              <div className="relative">
                <Image
                  src={design.resultImage || "/placeholder.svg"}
                  alt="Redesigned room"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">After</div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{design.name}</h3>
                <p className="text-sm text-muted-foreground">Style: {design.style}</p>
                <p className="text-xs text-muted-foreground">Created: {design.createdAt}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" asChild className="text-primary hover:text-primary/80">
                  <Link href={`/dashboard/designs/${design.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" className="text-primary hover:text-primary/80">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

