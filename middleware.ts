import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const url = req.nextUrl.clone();

  if (url.pathname.startsWith("/admin")) {
    console.log("Token in Middleware:", token);
    
    // แก้ตรงนี้: ตรวจสอบ 'ADMIN' ด้วยเพื่อให้ตรงกับค่าในฐานข้อมูล
    if (!token || (token.role !== "ADMIN" && token.role !== "admin")) {
      console.log("Unauthorized access to admin page, redirecting");
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};