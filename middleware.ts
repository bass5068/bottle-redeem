import { Role } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const url = req.nextUrl.clone();

  // ตรวจสอบเฉพาะเส้นทางที่เริ่มต้นด้วย "/admin"
  if (url.pathname.startsWith("/admin")) {
    console.log("Token in Middleware:", token);
    if (!token || token.role !== Role.ADMIN) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // ใช้ Middleware เฉพาะเส้นทาง /admin/*
};
