"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  role: string
  comment: string
  avatar: string
}

export function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Ade Dada",
      role: "Startup Oprichter",
      comment: "Dit is ongelooflijk, je hebt geen interieurontwerper meer nodig.",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Arthur Dvorkin",
      role: "Ingenieur",
      comment: "Eindelijk! Iets dat me helpt over mijn besluiteloosheid heen te komen bij het inrichten van mijn huis!",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      name: "Rob Attfield",
      role: "Software Ontwikkelaar",
      comment: "Ik heb mijn kamerinrichting 5 jaar niet veranderd, maar deze app kan dat veranderen. Goed werk.",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 4,
      name: "Sarah Johnson",
      role: "Interieurontwerper",
      comment: "Je kunt nu je kamers in verschillende stijlen zien voordat je gaat verbouwen. Hoe cool is dat!",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 5,
      name: "Eve Porcello",
      role: "Product Manager",
      comment: "Zo goed! Ik heb dit nu nodig. Gefeliciteerd met de lancering!",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 6,
      name: "Paul Hindes",
      role: "Fotograaf",
      comment: "Heb dit vandaag gebruikt - de beste AI kamer foto herontwerper die ik heb gezien!",
      avatar: "/placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Geliefd door velen <span className="text-primary">Wereldwijd.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bekijk wat onze meer dan 2 miljoen gebruikers over het product zeggen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="border bg-background/60 backdrop-blur-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg mb-6">"{testimonial.comment}"</p>
                <div className="flex items-center">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

