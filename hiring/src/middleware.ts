
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const JWT_SECRET = process.env.JWT_SECRET;


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("session")?.value;

  const userPayload = sessionToken ? verifyToken(sessionToken) : null;

  // If trying to access admin routes without a valid token, redirect to login
  if (pathname.startsWith('/admin') && !userPayload) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If already logged in and trying to access login page, redirect to admin
  if (pathname === '/login' && userPayload) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // If authenticated, attach user info to headers for server components
  if (userPayload) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("X-User-Role", userPayload.role);
    requestHeaders.set("X-User-Username", userPayload.username);
    if (userPayload.domain) {
      requestHeaders.set("X-Panel-Domain", userPayload.domain);
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  // Only run the middleware on the admin and login routes
  matcher: ["/admin/:path*", "/login"],
};
