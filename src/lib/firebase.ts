// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Helper to clean surrounding quotes that might be injected during deployment
function cleanEnvVar(val: string | undefined): string | undefined {
  if (!val) return val;
  return val.trim().replace(/^["']|["']$/g, '');
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

// Initialize Firebase safely
const app = !getApps().length
  ? initializeApp(firebaseConfig.projectId ? firebaseConfig : { ...firebaseConfig, projectId: 'mlsc-placeholder' })
  : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

// Auth is initialized lazily and guarded to prevent crashes when Firebase keys are absent
let _auth: Auth | null = null;
const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_auth) {
      if (!firebaseConfig.apiKey) {
        return typeof prop === 'string' && prop.startsWith('on') ? () => () => {} : () => Promise.resolve();
      }
      try {
        _auth = getAuth(app);
        setPersistence(_auth, browserLocalPersistence);
      } catch (err) {
        console.warn("Firebase Auth initialization skipped:", err);
        return () => Promise.resolve();
      }
    }
    const value = (_auth as any)?.[prop];
    if (typeof value === 'function') {
      return value.bind(_auth);
    }
    return value;
  },
  set(_target, prop, value) {
    if (!_auth && firebaseConfig.apiKey) {
      try {
        _auth = getAuth(app);
        setPersistence(_auth, browserLocalPersistence);
      } catch (err) {
        console.warn("Firebase Auth set skipped:", err);
      }
    }
    if (_auth) {
      (_auth as any)[prop] = value;
    }
    return true;
  },
  has(_target, prop) {
    return true;
  },
});

export { db, storage, auth };
