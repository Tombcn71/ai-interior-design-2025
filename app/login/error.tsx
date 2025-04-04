"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  useEffect(() => {
    // Log the error for debugging
    if (error) {
      console.error("Login error:", error);
    }
  }, [error]);

  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string) => {
    const errorMessages: Record<string, string> = {
      Callback:
        "Er is een probleem met de authenticatie callback. Dit gebeurt vaak wanneer de OAuth provider niet correct is geconfigureerd.",
      OAuthSignin: "Er is een probleem met het starten van de OAuth flow.",
      OAuthCallback: "Er is een probleem met de OAuth callback.",
      OAuthCreateAccount:
        "Er kon geen account worden aangemaakt met de OAuth provider.",
      EmailCreateAccount:
        "Er kon geen account worden aangemaakt met het opgegeven e-mailadres.",
      // Removed duplicate 'Callback' entry
      OAuthAccountNotLinked:
        "Dit e-mailadres is al gekoppeld aan een ander account.",
      default: "Er is een onbekende fout opgetreden tijdens het inloggen.",
    };

    return errorMessages[errorCode] || errorMessages.default;
  };

  if (!error) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
          <p className="mt-2 text-xs text-red-700">
            Probeer opnieuw in te loggen of neem contact op met de beheerder als
            het probleem aanhoudt.
          </p>
        </div>
      </div>
    </div>
  );
}
