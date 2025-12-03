import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcrypt";

const resolvedAuthUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

// Ensure NextAuth sees a URL to avoid runtime warning
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = resolvedAuthUrl;
}

// Fallback dev secret keeps warnings quiet; override in env for production
const resolvedSecret =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "dev-secret-change-me";

export const authOptions: NextAuthOptions = {
  secret: resolvedSecret,
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const client = await clientPromise;
        const db = client.db("corda");

        const user = await db.collection("users").findOne({
          username: credentials?.username,
        });

        if (!user) return null;
        const match = await compare(credentials!.password, user.password);
        if (!match) return null;

        return {
          id: user._id.toString(),
          username: user.username,
          bank: user.bank,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.bank = user.bank;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.username = token.username;
      session.user.bank = token.bank;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};
