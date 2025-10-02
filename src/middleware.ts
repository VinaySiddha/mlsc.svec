
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// 1. Specify protected and public routes
const protectedRoutes = ['/admin'];
const publicRoutes = ['/login', '/apply', '/status', '/'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((prefix) => path.startsWith(prefix));

  // 2. Check for session cookie
  const sessionToken = req.cookies.get('session')?.value;
  const payload = sessionToken ? verifyToken(sessionToken) : null;

  // 3. Redirect to /login if not authenticated and trying to access a protected route
  if (isProtectedRoute && !payload) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 4. If authenticated, add user info to headers for Server Components
  if (payload) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-User-Payload', JSON.stringify(payload));

    // 5. If authenticated user tries to access /login, redirect to /admin
    if (path === '/login') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Match all routes except for static files and API routes
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.ico$|.*\\.ttf$|.*\\.svg$).*)',
  ],
};
