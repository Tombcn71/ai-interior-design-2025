"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/logo";

export default function Header() {
  const { setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full  bg-background">
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto justify-between">
        <div className="flex gap-6 md:gap-10">
          {/* Gebruik Logo component direct zonder extra Link wrapper */}
          <Logo />
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              href="/pricing"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Prijzen
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary">
                  <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Thema wijzigen</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Licht
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Donker
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  Systeem
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {session ? (
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="hover:text-primary text-base px-6 py-2 h-auto rounded-full">
                Uitloggen
              </Button>
            ) : (
              <Button
                asChild
                className="text-base px-6 py-2 h-auto rounded-full">
                <Link href="/login">Inloggen</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
