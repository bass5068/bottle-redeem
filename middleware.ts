import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url)); // กลับหน้า Home ถ้าไม่ใช่ admin
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
