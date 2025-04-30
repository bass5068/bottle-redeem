// // pages/api/auth/[...nextauth].ts

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

                // เช็กว่าผู้ใช้มีอยู่ใน DB หรือยัง
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || "" }, // ใช้ email ในการเชื่อม
          select: {
            id: true,
            role: true,
            points: true,
          }
        });
        
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.points = dbUser.points;
        }
        else {
          // fallback ถ้าไม่มีใน DB
          token.id = token.sub; // sub มักจะมีเสมอจาก Google
          token.role = "user";
          token.points = 0;
        }
    
      }
      return token;
    },

    async session({ session, token }) {
      console.log("Session callback: token =", token);
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.points = token.points as number || 0;
      }
      return session;
    }
  },
  
  
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);