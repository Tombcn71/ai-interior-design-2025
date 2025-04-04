"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p className="mb-4">There was an error loading your dashboard.</p>
        <p className="text-sm text-gray-700 mb-4">Error: {error.message}</p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Try again
        </button>
        <a href="/login" className="text-blue-600 underline ml-4">
          Return to login
        </a>
      </div>
    </div>
  );
}
