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
import { LoginForm } from "@/components/login-form";
import { SocialLoginButtons } from "@/components/social-login-buttons";

export const metadata: Metadata = {
  title: "Inloggen",
  description: "Log in op je account",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Inloggen</CardTitle>
          <CardDescription>
            Voer je e-mail in om in te loggen op je account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <LoginForm />
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
        <CardFooter className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            <div className="mr-1 inline">Nog geen account?</div>
            <Link
              aria-label="Registreren"
              href="/register"
              className="text-primary underline-offset-4 transition-colors hover:underline">
              Registreren
            </Link>
          </div>
          <Link
            aria-label="Wachtwoord resetten"
            href="/reset-password"
            className="text-sm text-primary underline-offset-4 transition-colors hover:underline">
            Wachtwoord vergeten
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
