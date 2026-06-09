'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  User,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureUserProfile } from '@/lib/user-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    await ensureUserProfile(u.uid, {
      displayName: u.displayName || '',
      email: u.email || '',
      photoURL: u.photoURL || '',
    });
  }, []);

  const signInWithGithub = useCallback(async () => {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    await ensureUserProfile(u.uid, {
      displayName: u.displayName || u.email?.split('@')[0] || 'GitHub User',
      email: u.email || '',
      photoURL: u.photoURL || '',
    });
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const u = result.user;
    await updateProfile(u, { displayName });
    await ensureUserProfile(u.uid, {
      displayName,
      email,
      photoURL: '',
    });
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signUpWithEmail,
    signInWithEmail,
    signOut
  }), [user, loading, signInWithGoogle, signInWithGithub, signUpWithEmail, signInWithEmail, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
