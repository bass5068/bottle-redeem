import { PrismaClient } from "@prisma/client";
import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

const prisma = new PrismaClient();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      points: number;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    points?: number;
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
  
  // เปลี่ยนเป็น JWT เพื่อไม่ให้เกิดปัญหา HTTP 431
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 วัน
  },
  
  callbacks: {
    // เพิ่ม JWT callback
    async jwt({ token, user }) {
      if (user) {
        // ดึงเฉพาะข้อมูลที่จำเป็นจากฐานข้อมูล
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            points: true,
            // ไม่ดึง image เพื่อลดขนาด token
          }
        });
        
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.points = dbUser.points;
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.points = token.points as number || 0;
      }
      return session;
    },
  },
  
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);