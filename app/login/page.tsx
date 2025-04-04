import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LoginForm from "./login-form";
import LoginError from "./error";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // If the user is already logged in, redirect to the dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Inloggen</h1>
        <LoginError />
        <LoginForm />
      </div>
    </div>
  );
}
