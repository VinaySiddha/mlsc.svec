'use server';

import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Role } from '@/lib/roles';
import type { UserProfile } from '@/types/user';
import { sendEmail } from '@/lib/email';
import { welcomeEmailTemplate } from '@/lib/email-templates/welcome';

export async function ensureUserProfile(uid: string, profile: {
  displayName: string;
  email: string;
  photoURL: string;
}): Promise<{ isNewUser: boolean }> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
      role: 'user' as Role,
      bio: '',
      emailNotifications: true,
      disabled: false,
      createdAt: new Date().toISOString(),
    });

    // Fire-and-forget welcome email
    const { subject, html } = welcomeEmailTemplate(profile.displayName);
    sendEmail({ to: profile.email, subject, html }).catch(() => {});

    return { isNewUser: true };
  }
  return { isNewUser: false };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return null;
  return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
}

export async function updateUserProfile(uid: string, data: {
  displayName?: string;
  bio?: string;
  rollNo?: string;
  branch?: string;
  yearOfStudy?: string;
  linkedin?: string;
  photoURL?: string;
  emailNotifications?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', uid);
    // Filter out undefined values — Firestore rejects them
    const cleanData: Record<string, any> = { updatedAt: new Date().toISOString() };
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) cleanData[key] = value;
    }
    await updateDoc(userRef, cleanData);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: 'Failed to update profile.' };
  }
}

export async function getAllUsers(): Promise<{ users: UserProfile[]; error?: string }> {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    return { users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], error: 'Failed to fetch users.' };
  }
}

export async function assignUserRole(userId: string, role: Role): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error('Error assigning role:', error);
    return { success: false, error: 'Failed to assign role.' };
  }
}

export async function disableUser(userId: string, disabled: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { disabled, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error('Error disabling user:', error);
    return { success: false, error: 'Failed to update user status.' };
  }
}

export async function getUserRegisteredEvents(uid: string) {
  try {
    const eventsRef = collection(db, 'users', uid, 'registeredEvents');
    const q = query(eventsRef, orderBy('registeredAt', 'desc'));
    const snapshot = await getDocs(q);
    return { events: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    console.error('Error fetching user events:', error);
    return { events: [] };
  }
}
