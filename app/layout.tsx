import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
// Import the SessionProvider
import NextAuthProvider from "@/components/session-provider";

// Configureer de Roboto font
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "AI Interieurontwerp",
  description: "Transformeer je ruimte met AI-aangedreven interieurontwerp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Wrap the ThemeProvider with NextAuthProvider
  return (
    <html lang="nl" suppressHydrationWarning className={roboto.variable}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          roboto.className
        )}>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <div className="relative flex min-h-screen flex-col mx-auto max-w-screen-2xl">
              <Header />
              <div className="flex-1 w-full">{children}</div>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
