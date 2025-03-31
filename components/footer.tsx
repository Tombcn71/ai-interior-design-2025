import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-8 mx-auto">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} AI Interieurontwerp. Alle rechten voorbehouden.
        </p>
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
            Voorwaarden
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}

