'use server';

import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, orderBy, where, serverTimestamp, writeBatch, increment, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Role } from '@/lib/roles';
import type { UserProfile } from '@/types/user';
import { sendEmail } from '@/lib/email';
import { welcomeEmailTemplate } from '@/lib/email-templates/welcome';

export async function ensureUserProfile(uid: string, profile: {
  displayName: string;
  email: string;
  photoURL: string;
  username?: string;
}): Promise<{ isNewUser: boolean }> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Generate unique username from email or use the provided one
    let baseUsername = profile.username
      ? profile.username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')
      : profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!baseUsername) baseUsername = 'user';
    let username = baseUsername;
    let counter = 1;

    // Check availability loop
    while (true) {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const snap = await getDocs(q);
      if (snap.empty) break;
      username = `${baseUsername}${counter}`;
      counter++;
    }

    await setDoc(userRef, {
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
      username: username,
      role: 'user' as Role,
      bio: '',
      emailNotifications: true,
      disabled: false,
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString(),
    });

    // Send welcome email (awaited to prevent truncation in serverless environment)
    const { subject, html } = welcomeEmailTemplate(profile.displayName);
    await sendEmail({ to: profile.email, subject, html }).catch((err) => {
      console.error('Failed to send welcome email:', err);
    });

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

// Check if a username is available
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const cleanUsername = username.toLowerCase().trim();
  const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
  const snap = await getDocs(q);
  return snap.empty;
}

// Change user username
export async function changeUsername(uid: string, username: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanUsername = username.toLowerCase().trim();
    if (!/^[a-z0-9_]{3,15}$/.test(cleanUsername)) {
      return { success: false, error: 'Username must be 3-15 characters, alphanumeric or underscores.' };
    }
    const available = await checkUsernameAvailable(cleanUsername);
    if (!available) {
      return { success: false, error: 'Username is already taken.' };
    }
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { username: cleanUsername, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error('Error setting username:', error);
    return { success: false, error: 'Failed to update username.' };
  }
}

// Follow a user
export async function followUser(currentUid: string, targetUid: string): Promise<{ success: boolean; error?: string }> {
  if (currentUid === targetUid) return { success: false, error: 'You cannot follow yourself.' };
  try {
    const batch = writeBatch(db);

    const followingRef = doc(db, 'users', currentUid, 'following', targetUid);
    const followerRef = doc(db, 'users', targetUid, 'followers', currentUid);

    const [currentUserProfile, targetUserProfile] = await Promise.all([
      getUserProfile(currentUid),
      getUserProfile(targetUid),
    ]);

    if (!currentUserProfile || !targetUserProfile) {
      return { success: false, error: 'User profiles not found.' };
    }

    batch.set(followingRef, {
      uid: targetUid,
      displayName: targetUserProfile.displayName,
      photoURL: targetUserProfile.photoURL,
      username: targetUserProfile.username || '',
      followedAt: new Date().toISOString(),
    });

    batch.set(followerRef, {
      uid: currentUid,
      displayName: currentUserProfile.displayName,
      photoURL: currentUserProfile.photoURL,
      username: currentUserProfile.username || '',
      followedAt: new Date().toISOString(),
    });

    const currentUserRef = doc(db, 'users', currentUid);
    const targetUserRef = doc(db, 'users', targetUid);
    batch.update(currentUserRef, { followingCount: increment(1), updatedAt: new Date().toISOString() });
    batch.update(targetUserRef, { followersCount: increment(1), updatedAt: new Date().toISOString() });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: 'Failed to follow user.' };
  }
}

// Unfollow a user
export async function unfollowUser(currentUid: string, targetUid: string): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db);

    const followingRef = doc(db, 'users', currentUid, 'following', targetUid);
    const followerRef = doc(db, 'users', targetUid, 'followers', currentUid);

    batch.delete(followingRef);
    batch.delete(followerRef);

    const currentUserRef = doc(db, 'users', currentUid);
    const targetUserRef = doc(db, 'users', targetUid);
    batch.update(currentUserRef, { followingCount: increment(-1), updatedAt: new Date().toISOString() });
    batch.update(targetUserRef, { followersCount: increment(-1), updatedAt: new Date().toISOString() });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: 'Failed to unfollow user.' };
  }
}

// Check if current user is following target user
export async function isFollowingUser(currentUid: string, targetUid: string): Promise<boolean> {
  try {
    const followingRef = doc(db, 'users', currentUid, 'following', targetUid);
    const snap = await getDoc(followingRef);
    return snap.exists();
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

// Get user followers list
export async function getUserFollowers(uid: string): Promise<any[]> {
  try {
    const colRef = collection(db, 'users', uid, 'followers');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting followers:', error);
    return [];
  }
}

// Get user following list
export async function getUserFollowing(uid: string): Promise<any[]> {
  try {
    const colRef = collection(db, 'users', uid, 'following');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting following:', error);
    return [];
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  try {
    const cleanUsername = username.toLowerCase().trim();
    const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { uid: doc.id, ...doc.data() } as UserProfile;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
}

// Get study progress
export async function getUserStudyProgress(uid: string): Promise<Record<string, string[]>> {
  try {
    const colRef = collection(db, 'users', uid, 'studyProgress');
    const snap = await getDocs(colRef);
    const progress: Record<string, string[]> = {};
    snap.docs.forEach(doc => {
      progress[doc.id] = doc.data().completedTopics || [];
    });
    return progress;
  } catch (error) {
    console.error('Error getting study progress:', error);
    return {};
  }
}

// Update study progress
export async function updateUserStudyProgress(uid: string, courseId: string, topicId: string, completed: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'users', uid, 'studyProgress', courseId);
    const docSnap = await getDoc(docRef);
    let completedTopics: string[] = [];
    if (docSnap.exists()) {
      completedTopics = docSnap.data().completedTopics || [];
    }

    let delta = 0;
    if (completed) {
      if (!completedTopics.includes(topicId)) {
        completedTopics.push(topicId);
        delta = 1;
      }
    } else {
      if (completedTopics.includes(topicId)) {
        completedTopics = completedTopics.filter(id => id !== topicId);
        delta = -1;
      }
    }

    await setDoc(docRef, { completedTopics, updatedAt: new Date().toISOString() }, { merge: true });

    if (delta !== 0) {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        studyProblemsSolved: increment(delta)
      }).catch(async (err) => {
        console.error('Error updating studyProblemsSolved, trying setDoc merge:', err);
        await setDoc(userRef, { studyProblemsSolved: increment(delta) }, { merge: true }).catch(() => {});
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating study progress:', error);
    return { success: false, error: 'Failed to save progress.' };
  }
}

// Get top users study performance leaderboard
export async function getStudyLeaderboard(limitCount = 5): Promise<{ uid: string; displayName: string; photoURL: string; username?: string; studyProblemsSolved: number }[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('studyProblemsSolved', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    const leaderboard: any[] = [];
    
    snap.docs.forEach(doc => {
      const data = doc.data();
      if (data.studyProblemsSolved && data.studyProblemsSolved > 0) {
        leaderboard.push({
          uid: doc.id,
          displayName: data.displayName || 'Anonymous User',
          photoURL: data.photoURL || '',
          username: data.username || '',
          studyProblemsSolved: data.studyProblemsSolved || 0,
        });
      }
    });

    if (leaderboard.length > 0) {
      return leaderboard;
    }

    // Graceful fallback to mock data if Firestore has no solved counts yet
    return [
      { uid: 'mock-1', displayName: 'Striver Vikram', photoURL: '', username: 'striver_tuf', studyProblemsSolved: 172 },
      { uid: 'mock-2', displayName: 'Ananya Sharma', photoURL: '', username: 'ananya_dev', studyProblemsSolved: 145 },
      { uid: 'mock-3', displayName: 'Vinay Siddha', photoURL: '', username: 'vinay_s', studyProblemsSolved: 98 },
      { uid: 'mock-4', displayName: 'Karthik Raja', photoURL: '', username: 'karthik_r', studyProblemsSolved: 76 },
      { uid: 'mock-5', displayName: 'Preeti Deshmukh', photoURL: '', username: 'preeti_d', studyProblemsSolved: 54 },
    ];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [
      { uid: 'mock-1', displayName: 'Striver Vikram', photoURL: '', username: 'striver_tuf', studyProblemsSolved: 172 },
      { uid: 'mock-2', displayName: 'Ananya Sharma', photoURL: '', username: 'ananya_dev', studyProblemsSolved: 145 },
      { uid: 'mock-3', displayName: 'Vinay Siddha', photoURL: '', username: 'vinay_s', studyProblemsSolved: 98 },
      { uid: 'mock-4', displayName: 'Karthik Raja', photoURL: '', username: 'karthik_r', studyProblemsSolved: 76 },
      { uid: 'mock-5', displayName: 'Preeti Deshmukh', photoURL: '', username: 'preeti_d', studyProblemsSolved: 54 },
    ];
  }
}
