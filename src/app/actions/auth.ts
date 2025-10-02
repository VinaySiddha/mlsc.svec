
'use server';

import { cookies } from 'next/headers';
import * as jose from 'jose';
import * as z from 'zod';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function loginAction(values: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Invalid input.' };
  }

  const { username, password } = parsed.data;

  const SUPER_ADMIN_USERNAME = process.env.ADMIN_EMAIL || 'vinaysiddha';
  const SUPER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Vinay@15';

  const panelCredentials = [
      { username: 'gen_ai_panel', password: 'panel@genai', domain: 'gen_ai' },
      { username: 'ds_ml_panel', password: 'panel@ds', domain: 'ds_ml' },
      { username: 'azure_panel', password: 'panel@azure', domain: 'azure' },
      { username: 'web_app_panel', password: 'panel@web', domain: 'web_app' },
  ];

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables.');
  }
  
  const secret = new TextEncoder().encode(JWT_SECRET);

  let userPayload: { role: string; domain?: string; username: string };

  if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
    userPayload = { role: 'admin', username };
  } else {
    const panel = panelCredentials.find(p => p.username === username && p.password === password);
    if (panel) {
      userPayload = { role: 'panel', domain: panel.domain, username };
    } else {
      return { error: 'Invalid username or password.' };
    }
  }

  const token = await new jose.SignJWT(userPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
    sameSite: 'strict',
    priority: 'high',
  });

  return { success: true };
}

export async function logoutAction() {
  cookies().delete('session');
  return { success: true };
}
