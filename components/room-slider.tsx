"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RoomDesign {
  id: number
  image: string
  alt: string
}

export function RoomSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const roomDesigns: RoomDesign[] = [
    {
      id: 1,
      image: "/images/room1.png",
      alt: "Moderne woonkamer met minimalistische meubels",
    },
    {
      id: 2,
      image: "/images/room2.png",
      alt: "Industriële loft met bakstenen muren",
    },
    {
      id: 3,
      image: "/images/room3.png",
      alt: "Scandinavische slaapkamer met natuurlijk licht",
    },
    {
      id: 4,
      image: "/placeholder.svg?height=600&width=800",
      alt: "Luxe keuken met marmeren werkbladen",
    },
    {
      id: 5,
      image: "/placeholder.svg?height=600&width=800",
      alt: "Bohemian woonruimte met planten",
    },
  ]

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    resetTimeout()
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === roomDesigns.length - 1 ? 0 : prevIndex + 1))
    }, 4000)

    return () => {
      resetTimeout()
    }
  }, [currentIndex, roomDesigns.length])

  const goToPrevious = () => {
    resetTimeout()
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? roomDesigns.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    resetTimeout()
    setCurrentIndex((prevIndex) => (prevIndex === roomDesigns.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Kamers die <span className="text-primary">AI Interieurontwerp</span> heeft gecreëerd
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bekijk de verbazingwekkende transformaties die onze gebruikers hebben bereikt
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="overflow-hidden rounded-xl">
            <div
              className="whitespace-nowrap transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {roomDesigns.map((design) => (
                <div key={design.id} className="inline-block w-full" style={{ width: "100%" }}>
                  <div className="relative aspect-[16/9] w-full">
                    <Image src={design.image || "/placeholder.svg"} alt={design.alt} fill className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Vorige</span>
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Volgende</span>
          </Button>

          <div className="flex justify-center mt-4 gap-2">
            {roomDesigns.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-primary w-6" : "bg-gray-300 dark:bg-gray-700"
                }`}
                onClick={() => {
                  resetTimeout()
                  setCurrentIndex(index)
                }}
                aria-label={`Ga naar slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

