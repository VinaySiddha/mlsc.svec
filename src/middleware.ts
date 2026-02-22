import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  if (!JWT_SECRET) {
    console.warn('JWT_SECRET is not configured; treating token as invalid.');
    return null;
  }
  const secret = new TextEncoder().encode(JWT_SECRET);
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Support both cookie-based auth (web) and Bearer token auth (mobile)
  const sessionToken = req.cookies.get("session")?.value;
  const authHeader = req.headers.get("authorization");

  // Extract token from Authorization header if present
  let bearerToken: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    bearerToken = authHeader.substring(7);
  }

  // Use Bearer token if available, otherwise fall back to session cookie
  const token = bearerToken || sessionToken;

  // Don't log visits for API routes, static files, or the admin area itself
  const isLoggable = !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.startsWith('/admin') && !pathname.endsWith('.png') && !pathname.endsWith('.jpg') && !pathname.endsWith('.ico');

  if (isLoggable) {
    const ip = req.ip ?? '127.0.0.1';
    const userAgent = req.headers.get('user-agent') ?? 'unknown';

    // Fire-and-forget log action via API route to avoid Edge Runtime issues with Firebase
    fetch(new URL('/api/log-visitor', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip,
        userAgent,
        path: pathname,
      })
    }).catch(console.error);
  }

  if (pathname.startsWith("/admin")) {
    // If it's an API route, require token (either Bearer or cookie)
    if (pathname.startsWith("/api/v1/admin")) {
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required', code: 'ERROR_NO_TOKEN' },
          { status: 401 }
        );
      }

      const payload = await verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token', code: 'ERROR_INVALID_TOKEN' },
          { status: 401 }
        );
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(req.headers);
      if (payload.role) requestHeaders.set("X-User-Role", payload.role as string);
      if (payload.username) requestHeaders.set("X-User-Username", payload.username as string);
      if (payload.domain) requestHeaders.set("X-Panel-Domain", payload.domain as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For web admin pages, require session cookie and redirect if missing
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = await verifyToken(sessionToken);

    if (!payload) {
      // Clear invalid cookie and redirect
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("session");
      return response;
    }

    // Add user info to headers to be accessed in Server Components
    const requestHeaders = new Headers(req.headers);
    if (payload.role) requestHeaders.set("X-User-Role", payload.role as string);
    if (payload.username)
      requestHeaders.set("X-User-Username", payload.username as string);
    if (payload.domain)
      requestHeaders.set("X-Panel-Domain", payload.domain as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (pathname === "/login") {
    if (sessionToken) {
      const payload = await verifyToken(sessionToken);
      if (payload) {
        const url = req.nextUrl.clone()
        url.pathname = '/admin'
        url.search = '' // Clear query params
        return NextResponse.rewrite(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/api/v1/admin/:path*", // Protect admin API routes
    "/((?!api|_next/static|favicon.ico).*)"
  ],
};
