import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
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
      return session;
    },
    // Include user ID in the token
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
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
};

// Also export as authConfig for backward compatibility
export const authConfig = authOptions;
