import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const adminApp = !getApps().length
  ? (() => {
      return initializeApp({
        credential: applicationDefault(),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    })()
  : getApps()[0];

export const adminStorage = getStorage(adminApp);
