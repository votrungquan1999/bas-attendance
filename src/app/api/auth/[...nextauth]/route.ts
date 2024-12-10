import NextAuth from "next-auth";
import type {} from "next-auth/jwt";
import { nextAuthOptions } from "src/server/next-auth/nextAuthOptions";

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
