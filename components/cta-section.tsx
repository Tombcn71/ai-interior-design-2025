"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"

export function CTASection() {
  const { data: session } = useSession()

  return (
    <div className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-primary">Transformeer elke kamer</span> met slechts één foto
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Bekijk wat onze meer dan 2 miljoen gebruikers over het product zeggen.
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
              <Link href={session ? "/dashboard/new-design" : "/login"}>
                Probeer het nu <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl transform translate-x-8 translate-y-8 md:translate-x-16 md:translate-y-16">
              <div className="relative aspect-square w-full">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Na kamer herontwerp"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-0 right-0 bg-primary text-white px-4 py-2 rounded-bl-lg flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                <span className="font-medium">Na</span>
              </div>
            </div>

            <div className="absolute top-0 left-0 rounded-xl overflow-hidden shadow-xl">
              <div className="relative aspect-square w-full">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Voor kamer herontwerp"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-0 right-0 bg-gray-800 text-white px-4 py-2 rounded-bl-lg">
                <span className="font-medium">Voor</span>
              </div>
            </div>

            <div className="absolute z-20 bottom-4 right-4 bg-white dark:bg-gray-800 text-primary rounded-full px-4 py-2 shadow-lg flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Direct Herontwerpen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

