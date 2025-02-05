import { PrismaClient, Role } from "@prisma/client";
import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

const prisma = new PrismaClient();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      points: number;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // ดึงข้อมูลจากฐานข้อมูล
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        console.log("User from DB:", dbUser);

        token.role = dbUser?.role; // ดึง role
        token.id = user.id; // เพิ่ม id ลงใน JWT
        token.points = dbUser?.points ?? 0; // ดึง points
      }
      console.log("Token after JWT callback:", token);
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string; // ดึง id จาก JWT
      session.user.role = token.role as Role; // ดึง role จาก JWT
      session.user.points = token.points as number; // ดึง points จาก JWT
      
      console.log("Session after Session callback:", session);
      return session;
    },
  },
};

export default NextAuth(authOptions);
