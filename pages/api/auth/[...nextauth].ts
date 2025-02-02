import { PrismaClient, Role } from "@prisma/client";
import NextAuth, { DefaultSession, NextAuthOptions,  } from "next-auth";
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
    strategy: "jwt", // หรือใช้ "jwt" ถ้าไม่ต้องการเก็บใน DB
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // ดึง role จาก User และเพิ่มลงใน JWT
        token.id = user.id; // เพิ่ม id ลงใน JWT
      }
      return token;
    },
    // เพิ่ม role และ id ลงใน Session
    async session({ session, token }) {
      session.user.id = token.id as string; // ดึง id จาก JWT
      session.user.role = token.role as Role; // ดึง role จาก JWT
      return session;
    },
  },
  
  
};

export default NextAuth(authOptions);
