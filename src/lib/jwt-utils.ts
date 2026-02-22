import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-characters-long'
);

export interface JWTPayload {
  role: 'admin' | 'panel';
  username: string;
  domain?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate access token (short-lived: 1 hour)
 */
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);
}

/**
 * Generate refresh token (long-lived: 7 days)
 */
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(payload: JWTPayload): Promise<TokenPair> {
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 hour in seconds
  };
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
