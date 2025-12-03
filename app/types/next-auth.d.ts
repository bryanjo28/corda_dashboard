import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
      bank: "A" | "B" | "C";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username: string;
    bank: "A" | "B" | "C";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    bank: "A" | "B" | "C";
  }
}
