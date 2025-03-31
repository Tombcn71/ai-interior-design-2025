import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Paintbrush, CreditCard, Upload } from "lucide-react";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { RoomSlider } from "@/components/room-slider";
import { Testimonials } from "@/components/testimonials";
import { CTASection } from "@/components/cta-section";
import { GradientDust } from "@/components/gradient-dust";

export default async function Home() {
  const session = await getServerSession(authConfig);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="container px-4 md:px-8 mx-auto relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col pl-12 justify-center space-y-4 text-center md:text-left">
                <div className="space-y-2 ">
                  <h1 className="text-3xl  font-extrabold  sm:text-5xl xl:text-6xl/none">
                    Jouw persoonlijke <span className="text-primary">AI</span>{" "}
                    <br /> interieur ontwerper✨
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto md:mx-0">
                    Upload een foto van een kamer, kies een stijl, en laat onze
                    AI je ruimte in enkele seconden herontwerpen.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center md:justify-start">
                  {session ? (
                    <Button
                      asChild
                      className="text-lg px-8 py-4 h-auto rounded-full">
                      <Link href="/dashboard">
                        Aan de slag <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="text-lg px-8 py-4 h-auto rounded-full">
                      <Link href="/login">
                        Inloggen om te beginnen{" "}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative aspect-video overflow-hidden rounded-xl">
                  <Image
                    src="/1.png"
                    width={1000}
                    height={2000}
                    alt="Voor en na van een kamer herontwerp"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Room Slider Section */}
        <RoomSlider />

        {/* CTA Section */}
        <CTASection />

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Hoe Het Werkt
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Transformeer je ruimte in drie eenvoudige stappen
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Uploaden</h3>
                <p className="text-muted-foreground">
                  Upload een foto van de kamer die je wilt herontwerpen.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Paintbrush className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Kies Stijl</h3>
                <p className="text-muted-foreground">
                  Selecteer uit verschillende interieurstijlen die bij je smaak
                  passen.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CreditCard className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Krijg Resultaten</h3>
                <p className="text-muted-foreground">
                  Gebruik je credits om prachtige herontwerpen van je ruimte te
                  genereren.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />
      </main>
    </div>
  );
}
