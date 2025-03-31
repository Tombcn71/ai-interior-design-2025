import { Button } from "@/components/ui/button"
import { CheckIcon } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="container py-10 px-4 md:px-8 mx-auto">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Eenvoudige, transparante prijzen</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Betaal alleen voor wat je gebruikt. Geen verborgen kosten of abonnement vereist.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-lg border p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-medium">Basis</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-3xl font-bold">€4,99</span>
            </div>
            <p className="mt-2 text-muted-foreground">5 credits</p>

            <ul className="mt-6 space-y-4">
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">5 kamer herontwerpen</span>
              </li>
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">Hoogwaardige AI generaties</span>
              </li>
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">Download in hoge resolutie</span>
              </li>
            </ul>
          </div>

          <Button asChild className="mt-8">
            <Link href="/dashboard/buy-credits">Aan de slag</Link>
          </Button>
        </div>

        <div className="relative flex flex-col justify-between rounded-lg border border-primary p-6 shadow-md">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
            Meest Populair
          </div>
          <div>
            <h3 className="text-lg font-medium">Standaard</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-3xl font-bold">€12,99</span>
            </div>
            <p className="mt-2 text-muted-foreground">15 credits</p>

            <ul className="mt-6 space-y-4">
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">15 kamer herontwerpen</span>
              </li>
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">Hoogwaardige AI generaties</span>
              </li>
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">Download in hoge resolutie</span>
              </li>
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">Bewaar ontwerpgeschiedenis</span>
              </li>
            </ul>
          </div>

          <Button asChild className="mt-8">
            <Link href="/dashboard/buy-credits">Aan de slag</Link>
          </Button>
        </div>

        <div className="flex flex-col justify-between rounded-lg border p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-medium">Premium</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-3xl font-bold">€39,99</span>
            </div>
            <p className="mt-2 text-muted-foreground">50 credits</p>

            <ul className="mt-6 space-y-4">
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">50 kamer herontwerpen</span>
              </li>
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">Hoogwaardige AI generaties</span>
              </li>
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">Download in hoge resolutie</span>
              </li>
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">Bewaar ontwerpgeschiedenis</span>
              </li>
              <li className="flex">
                <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="ml-3">Prioriteit verwerking</span>
              </li>
            </ul>
          </div>

          <Button asChild className="mt-8">
            <Link href="/dashboard/buy-credits">Aan de slag</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl text-center">
        <h2 className="text-2xl font-bold">Veelgestelde Vragen</h2>
        <div className="mt-8 grid gap-6 text-left">
          <div>
            <h3 className="font-medium">Hoe werken credits?</h3>
            <p className="mt-2 text-muted-foreground">
              Elke credit stelt je in staat om één AI-herontwerp van een kamer te genereren. Credits vervallen nooit,
              dus je kunt ze gebruiken wanneer je ze nodig hebt.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Welke soorten kamers kan ik herontwerpen?</h3>
            <p className="mt-2 text-muted-foreground">
              Je kunt elke binnenruimte herontwerpen, waaronder woonkamers, slaapkamers, keukens, badkamers, kantoren en
              meer.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Hoe lang duurt het om een ontwerp te genereren?</h3>
            <p className="mt-2 text-muted-foreground">
              De meeste ontwerpen zijn binnen 1-2 minuten voltooid, afhankelijk van de systeembelasting en complexiteit.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Kan ik een terugbetaling aanvragen?</h3>
            <p className="mt-2 text-muted-foreground">
              We bieden geen terugbetalingen voor gekochte credits, maar als je technische problemen ondervindt, neem
              dan contact op met ons ondersteuningsteam.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

