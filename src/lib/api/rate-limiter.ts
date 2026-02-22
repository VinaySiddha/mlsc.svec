/**
 * Simple in-memory rate limiter using Map
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);
  return true;
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: Request): string {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default if IP cannot be determined
  return 'unknown';
}
