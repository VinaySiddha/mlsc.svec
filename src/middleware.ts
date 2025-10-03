
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { logVisitor } from "@/app/middleware-actions";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const sessionToken = req.cookies.get('session')?.value;

  // Log visitor for all paths except API routes
  if (!path.startsWith('/api')) {
    try {
      const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown';
      const userAgent = req.headers.get('user-agent') ?? 'unknown';
      // Do not await, let it run in the background
      logVisitor({ ip, userAgent, path });
    } catch (e) {
      console.error("Visitor logging failed:", e);
    }
  }

  // If trying to access admin routes without a valid token, redirect to login
  if (path.startsWith('/admin') && !sessionToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If on an admin route, verify the token and attach user info to headers
  if (path.startsWith('/admin') && sessionToken) {
    const payload = verifyToken(sessionToken);
    if (!payload) {
      // Invalid token, clear it and redirect
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('session');
      return response;
    }
    
    // Valid token, add user info to headers for Server Components
    const requestHeaders = new Headers(req.headers);
    if(payload.role) requestHeaders.set("X-User-Role", payload.role);
    if(payload.username) requestHeaders.set("X-User-Username", payload.username);
    if (payload.domain) requestHeaders.set("X-Panel-Domain", payload.domain);
    
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // If already logged in and trying to access login page, redirect to admin
  if (path === '/login' && sessionToken) {
    const payload = verifyToken(sessionToken);
    if (payload) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};

    