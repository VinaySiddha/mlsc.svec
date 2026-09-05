'use server';

import { cookies } from 'next/headers';
import { AuthService } from '@/lib/services/auth-service';
import { ROLES, type Role } from '@/lib/roles';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Admin-eligible roles — any of these can log into the admin panel
const ADMIN_ROLES: readonly Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.EVENT_ADMIN,
  ROLES.COMMUNITY_MODERATOR,
  ROLES.COMMON_PANEL,
  ROLES.PANEL,
  ROLES.VIEW_ONLY,
];

/**
 * Called by the client after a successful Firebase Google sign-in.
 * The client passes the Firebase ID token; we verify it server-side,
 * look up the user's role in Firestore, and issue a session JWT if
 * they have an admin-level role.
 */
export async function adminGoogleLoginAction(idToken: string): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    // Verify the Firebase ID token using Firebase Admin SDK
    const { getAuth } = await import('firebase-admin/auth');
    const { getAuth: getAuthFromApp } = await import('firebase-admin/auth');
    const { getAdminApp } = await import('@/lib/firebase-admin');

    // Verify token
    const decodedToken = await getAuthFromApp(getAdminApp()).verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';
    const displayName = decodedToken.name || email.split('@')[0] || 'Admin';

    // Look up user role in Firestore
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { error: 'Your account is not registered in the system. Please sign up on the public site first.' };
    }

    const userData = userSnap.data();
    const userRole = userData.role as Role;

    // Check if the user has an admin-eligible role
    if (!ADMIN_ROLES.includes(userRole)) {
      return { error: 'Access denied. You do not have admin privileges. Contact the Super Admin to get access.' };
    }

    // Issue a session JWT with the user's actual RBAC role and domain (if panel member)
    const token = await AuthService.generateToken({
      role: userRole,
      username: displayName,
      email: email,
      domain: userData.domain || undefined,
    });

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
  } catch (error: any) {
    console.error('Admin Google login error:', error);
    const { logErrorAction } = await import('./log-actions');
    await logErrorAction(
      `Admin Google Login Failed`,
      `Google OAuth verification failed for admin login. Error: ${error.message || error}`
    );
    if (error.code === 'auth/id-token-expired') {
      return { error: 'Your session has expired. Please try signing in again.' };
    }
    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      return { error: 'Invalid authentication token. Please try again.' };
    }
    return { error: 'Authentication failed. Please try again.' };
  }
}
