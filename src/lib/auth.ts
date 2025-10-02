
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables.');
}

export interface UserPayload {
  role: string;
  username: string;
  domain?: string;
  exp?: number;
}

export function signToken(payload: Omit<UserPayload, 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '1d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET!) as UserPayload;
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function getSession() {
  const sessionToken = cookies().get('session')?.value;
  if (!sessionToken) return null;
  return verifyToken(sessionToken);
}

export function setSessionCookie(token: string) {
    cookies().set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'lax',
    });
}

export function clearSessionCookie() {
    cookies().delete('session');
}
