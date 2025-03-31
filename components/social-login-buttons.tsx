"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export function SocialLoginButtons() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: string) => {
    try {
      setIsLoading(provider);
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Social login error:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={() => handleSocialLogin("google")}
        disabled={isLoading === "google"}>
        <FcGoogle className="h-5 w-5" />
        {isLoading === "google" ? "Bezig..." : "Google"}
      </Button>
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={() => handleSocialLogin("github")}
        disabled={isLoading === "github"}>
        <FaGithub className="h-5 w-5" />
        {isLoading === "github" ? "Bezig..." : "GitHub"}
      </Button>
    </div>
  );
}
