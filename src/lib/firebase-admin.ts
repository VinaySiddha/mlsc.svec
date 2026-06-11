import { applicationDefault, cert, initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';

// Helper to clean surrounding quotes that might be injected during deployment
function cleanEnvVar(val: string | undefined): string | undefined {
  if (!val) return val;
  return val.trim().replace(/^["']|["']$/g, '');
}

export function getAdminApp() {
  if (getApps().length) {
    return getApp();
  }

  const credInput = cleanEnvVar(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  let credential = undefined;

  if (credInput) {
    const trimmed = credInput.trim();
    if (trimmed.startsWith('{')) {
      try {
        credential = cert(JSON.parse(trimmed));
      } catch (err) {
        console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS JSON:", err);
      }
    } else {
      if (fs.existsSync(trimmed)) {
        try {
          credential = applicationDefault();
        } catch (err) {
          console.error("Failed to load application default credentials from path:", err);
        }
      } else {
        console.warn(`Warning: GOOGLE_APPLICATION_CREDENTIALS file not found at path: "${trimmed}". Initializing Firebase Admin without credentials (local development mode).`);
      }
    }
  }

  try {
    return initializeApp({
      credential,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (err) {
    console.error("Failed to initialize Firebase Admin app:", err);
    // Fallback: try initializing with just project id to prevent total crash
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

