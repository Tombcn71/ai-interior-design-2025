"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, Loader2 } from "lucide-react"
import Image from "next/image"

interface NewDesignFormProps {
  disabled?: boolean
}

export function NewDesignForm({ disabled }: NewDesignFormProps) {
  const [name, setName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [style, setStyle] = useState("minimalist")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image of your room",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create FormData to send the image
      const formData = new FormData()
      formData.append("name", name)
      formData.append("style", style)
      formData.append("description", description)
      formData.append("image", image)

      const response = await fetch("/api/designs", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create design")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Your design is being processed",
      })

      router.push(`/dashboard/designs/${data.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Design Name</Label>
        <Input
          id="name"
          placeholder="Living Room Redesign"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={disabled || isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label>Room Image</Label>
        <Card className="relative border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <input
              type="file"
              id="image"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
              disabled={disabled || isLoading}
            />
            {imagePreview ? (
              <div className="relative w-full aspect-video">
                <Image src={imagePreview || "/placeholder.svg"} alt="Room preview" fill className="object-contain" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => {
                    setImage(null)
                    setImagePreview(null)
                  }}
                  disabled={disabled || isLoading}
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <Label
                htmlFor="image"
                className="flex flex-col items-center justify-center gap-2 py-10 cursor-pointer w-full"
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="font-medium">Click to upload</span>
                <span className="text-sm text-muted-foreground">JPG, PNG, WEBP up to 5MB</span>
              </Label>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2">
        <Label>Design Style</Label>
        <RadioGroup
          defaultValue="minimalist"
          value={style}
          onValueChange={setStyle}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
          disabled={disabled || isLoading}
        >
          <Label
            htmlFor="minimalist"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="minimalist" id="minimalist" className="sr-only" />
            <span className="text-center">Minimalist</span>
          </Label>
          <Label
            htmlFor="modern"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="modern" id="modern" className="sr-only" />
            <span className="text-center">Modern</span>
          </Label>
          <Label
            htmlFor="scandinavian"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="scandinavian" id="scandinavian" className="sr-only" />
            <span className="text-center">Scandinavian</span>
          </Label>
          <Label
            htmlFor="industrial"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="industrial" id="industrial" className="sr-only" />
            <span className="text-center">Industrial</span>
          </Label>
          <Label
            htmlFor="bohemian"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="bohemian" id="bohemian" className="sr-only" />
            <span className="text-center">Bohemian</span>
          </Label>
          <Label
            htmlFor="luxury"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="luxury" id="luxury" className="sr-only" />
            <span className="text-center">Luxury</span>
          </Label>
        </RadioGroup>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Additional Details (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe any specific requirements or preferences for your redesign"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled || isLoading}
        />
      </div>

      <Button type="submit" disabled={disabled || isLoading || !image}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
          </>
        ) : (
          "Generate Design"
        )}
      </Button>
    </form>
  )
}

