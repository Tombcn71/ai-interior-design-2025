"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface CreditPackagesProps {
  userId: string
}

export function CreditPackages({ userId }: CreditPackagesProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const packages = [
    { id: "basic", name: "Basic", credits: 5, price: 4.99 },
    { id: "standard", name: "Standard", credits: 15, price: 12.99, popular: true },
    { id: "premium", name: "Premium", credits: 50, price: 39.99 },
  ]

  const handlePurchase = async (packageId: string) => {
    setIsLoading(packageId)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session")
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
      setIsLoading(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className={pkg.popular ? "border-primary shadow-md" : ""}>
          {pkg.popular && (
            <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Most Popular
            </div>
          )}
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription>{pkg.credits} credits</CardDescription>
            <div className="mt-2 text-3xl font-bold">${pkg.price}</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span>
                <span>{pkg.credits} room redesigns</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span>
                <span>High-quality AI generations</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span>
                <span>Download in high resolution</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handlePurchase(pkg.id)} disabled={isLoading !== null}>
              {isLoading === pkg.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                </>
              ) : (
                "Buy Now"
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

