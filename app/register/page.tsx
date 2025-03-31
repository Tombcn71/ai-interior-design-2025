import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/register-form";
import { SocialLoginButtons } from "@/components/social-login-buttons";

export const metadata: Metadata = {
  title: "Registreren",
  description: "Maak een nieuw account aan",
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Account aanmaken</CardTitle>
          <CardDescription>
            Voer je gegevens in om een account aan te maken
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <RegisterForm />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <div className="bg-background px-2 text-muted-foreground">
                Of ga verder met
              </div>
            </div>
          </div>
          <SocialLoginButtons />
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            <div className="mr-1 inline">Heb je al een account?</div>
            <Link
              aria-label="Inloggen"
              href="/login"
              className="text-primary underline-offset-4 transition-colors hover:underline">
              Inloggen
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
