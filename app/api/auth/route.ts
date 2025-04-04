import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Make sure your callback URLs are configured for your new domain
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
