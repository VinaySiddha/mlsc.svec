'use server';

import { cookies } from 'next/headers';
import { AuthService } from '@/lib/services/auth-service';
import { loginSchema } from '@/schemas/auth';

export async function loginAction(values: any) {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Invalid input.' };
  }

  const check = AuthService.checkRequiredSecrets();
  if (check.isMissing) {
    const errorMsg = `Authentication failed: The secret for '${check.name}' could not be accessed. This is a critical server configuration issue. Please double-check that this secret exists in Google Secret Manager with the EXACT name, and that both required service accounts have the 'Secret Manager Secret Accessor' role. Refer to PERMISSIONS_TROUBLESHOOTING.md for a detailed guide.`;
    console.error(errorMsg);
    return { error: errorMsg };
  }

  const { username, password } = parsed.data;

  const userPayload = AuthService.authenticateUser(username, password);

  if (userPayload) {
    const token = await AuthService.generateToken(userPayload);

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'strict',
      priority: 'high',
    });

    return { success: true };
  } else {
    return { error: 'Invalid username or password.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return { success: true };
}
