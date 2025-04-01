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

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 วัน
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // ดึงเฉพาะข้อมูลที่จำเป็นจากฐานข้อมูล (ไม่รวม image)
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            points: true,
            // ไม่ select ฟิลด์ image เพื่อหลีกเลี่ยงข้อมูลขนาดใหญ่
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
      // ใส่ข้อมูลจำเป็นใน session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.points = token.points as number || 0;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);