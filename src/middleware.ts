import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { logVisitor } from "./app/middleware-actions";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables.");
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
  const sessionToken = req.cookies.get("session")?.value;

  // Don't log visits for API routes, static files, or the admin area itself
  const isLoggable = !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.startsWith('/admin') && !pathname.endsWith('.png') && !pathname.endsWith('.jpg') && !pathname.endsWith('.ico');

  if (isLoggable) {
    const ip = req.ip ?? '127.0.0.1';
    const userAgent = req.headers.get('user-agent') ?? 'unknown';
    
    // Fire-and-forget log action without awaiting it
    logVisitor({
      ip,
      userAgent,
      path: pathname,
    }).catch(console.error);
  }

  if (pathname.startsWith("/admin")) {
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
  matcher: ["/admin/:path*", "/login", "/((?!api|_next/static|favicon.ico).*)"],
};
