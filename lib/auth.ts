import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Your authorization logic here
        // Return user object if authenticated
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  callbacks: {
    // Make sure the user ID is included in the session
    async session({ session, token, user }) {
      console.log("Session callback:", {
        sessionUser: session?.user,
        tokenSub: token?.sub,
        userId: user?.id,
      });

      if (session?.user) {
        // For JWT strategy (default)
        if (token?.sub) {
          session.user.id = token.sub;
        }
        // For database strategy
        else if (user?.id) {
          session.user.id = user.id;
        }
      }

      console.log("Updated session:", session);
      return session;
    },
    // Include user ID in the token
    async jwt({ token, user, account, profile }) {
      console.log("JWT callback:", {
        tokenSub: token?.sub,
        userId: user?.id,
      });

      if (user?.id) {
        token.sub = user.id;
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });

      // More robust redirect logic
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  // Add debug mode for development
  debug: process.env.NODE_ENV === "development",
  // Ensure secret is set
  secret: process.env.NEXTAUTH_SECRET || process.env.SECRET,
  // Use JWT strategy for sessions
  session: {
    strategy: "jwt",
  },
};

// Also export as authConfig for backward compatibility
export const authConfig = authOptions;
