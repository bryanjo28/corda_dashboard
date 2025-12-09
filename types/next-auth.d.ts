import { DefaultSession } from "next-auth";

export type Bank = "A" | "B" | "C";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
      bank: Bank;
    } & DefaultSession["user"];
  }
}
