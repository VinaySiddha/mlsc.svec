import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const GCP_SECRET_NAME = 'JWT_SECRET';

// Module-level cache so we only hit Secret Manager once per container lifetime.
let _cachedJwtSecret: string | undefined = undefined;

/**
 * Returns the JWT secret, trying (in order):
 * 1. The JWT_SECRET environment variable (set by apphosting.yaml secretParameters).
 * 2. A direct call to Cloud Secret Manager via the GCP metadata server
 *    (works in Cloud Run / Firebase App Hosting even when the env-var injection
 *    has not yet taken effect for the running revision).
 */
async function resolveJwtSecret(): Promise<string | null> {
  // Always check the env var first so a hot-reload or updated env is picked up immediately.
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  // Return cached value only after confirming the env var is still absent.
  if (_cachedJwtSecret !== undefined) return _cachedJwtSecret;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;

  try {
    // Fetch a short-lived access token from the metadata server (Cloud Run only).
    const tokenRes = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      { headers: { 'Metadata-Flavor': 'Google' } }
    );
    if (!tokenRes.ok) return null;
    const { access_token } = await tokenRes.json() as { access_token: string };

    // Access the secret version from Secret Manager.
    const secretRes = await fetch(
      `https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets/${GCP_SECRET_NAME}/versions/latest:access`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (!secretRes.ok) return null;
    const { payload } = await secretRes.json() as { payload: { data: string } };

    // payload.data is base64-encoded; decode using APIs available in Edge Runtime.
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(payload.data), c => c.charCodeAt(0))
    );
    _cachedJwtSecret = decoded;
    return decoded;
  } catch (err) {
    console.error('[middleware] Failed to fetch JWT secret from Secret Manager:', err);
    return null;
  }
}

async function verifyToken(token: string) {
  const jwtSecret = await resolveJwtSecret();
  if (!jwtSecret) {
    console.warn('JWT_SECRET is not configured; treating token as invalid.');
    return null;
  }
  const secret = new TextEncoder().encode(jwtSecret);
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
