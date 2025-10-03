
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const sessionToken = req.cookies.get('session')?.value;
  const payload = sessionToken ? await verifyToken(sessionToken) : null;

  // If trying to access admin routes without a valid token, redirect to login
  if (path.startsWith('/admin') && !payload) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If already logged in and trying to access login page, redirect to admin
  if (path === '/login' && payload) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // If authenticated on an admin route, attach user info to headers for Server Components
  if (payload && path.startsWith('/admin')) {
    const requestHeaders = new Headers(req.headers);
    if(payload.role) requestHeaders.set("X-User-Role", payload.role);
    if(payload.username) requestHeaders.set("X-User-Username", payload.username);
    if (payload.domain) requestHeaders.set("X-Panel-Domain", payload.domain);
    
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  // Only run the middleware on the admin and login routes
  matcher: ["/admin/:path*", "/login"],
};
