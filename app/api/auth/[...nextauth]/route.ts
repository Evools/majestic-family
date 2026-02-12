import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

if (!process.env.DISCORD_CLIENT_ID) console.error("❌ Missing DISCORD_CLIENT_ID");
if (!process.env.DISCORD_CLIENT_SECRET) console.error("❌ Missing DISCORD_CLIENT_SECRET");
if (!process.env.NEXTAUTH_SECRET) console.error("❌ Missing NEXTAUTH_SECRET");

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      console.log("👉 SIGNIN CALLBACK", { user, account, profile });
      return true;
    },
    async session({ session, token, user }: any) {
      console.log("👉 SESSION CALLBACK", { session, user });
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
