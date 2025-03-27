import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;


    // ✅ ตรวจ role
    if (req.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // ✅ ต้องมี token ถึงจะเข้าได้
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"], // ✅ ตรวจเฉพาะเส้นทาง /admin
};
