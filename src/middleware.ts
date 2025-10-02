import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(token: string) {
  if (!JWT_SECRET) {
    // This should not happen in a configured environment
    console.error("JWT_SECRET is not set.");
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("session")?.value;
  const isAuthenticated = sessionToken ? verifyToken(sessionToken) : null;

  // If user is on the login page
  if (pathname.startsWith('/login')) {
    // If they are already authenticated, redirect them to the admin dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    // Otherwise, allow them to see the login page
    return NextResponse.next();
  }

  // For any other page covered by the matcher (i.e., /admin), check for authentication
  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If authenticated, add user info to headers and allow access
  const requestHeaders = new Headers(req.headers);
  const payload = isAuthenticated as any;
  
  if (payload.role) requestHeaders.set("X-User-Role", payload.role as string);
  if (payload.username) requestHeaders.set("X-User-Username", payload.username as string);
  if (payload.domain) requestHeaders.set("X-Panel-Domain", payload.domain as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Apply middleware only to admin and login paths.
  matcher: ['/admin/:path*', '/login'],
};
