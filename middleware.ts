import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const url = req.nextUrl.clone();

  // ตรวจสอบเฉพาะเส้นทางที่เริ่มต้นด้วย "/admin"
  if (url.pathname.startsWith("/admin")) {
    console.log("Token in Middleware:", token);
    // ถ้าไม่มี Token หรือ role ไม่ใช่ admin ให้ Redirect ไปหน้าแรก
    if (!token || token.role !== "admin") {
    
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // ใช้ Middleware เฉพาะเส้นทาง /admin/*
};
