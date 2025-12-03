import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcrypt";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {},
        password: {},
      },

      async authorize(credentials) {
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
          bank: user.bank,        // <- ROLE DI SIMPAN DI SESSION
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.bank = user.bank;     // SIMPAN ROLE
      }
      return token;
    },

    async session({ session, token }) {
      session.user.username = token.username as string;
      session.user.bank = token.bank as "A" | "B" | "C";
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
