import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

const adminApp = !getApps().length
  ? (() => {
      const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!credPath) throw new Error('GOOGLE_APPLICATION_CREDENTIALS env var not set');
      const resolved = path.resolve(credPath);
      const serviceAccount = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
      return initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    })()
  : getApps()[0];

export const adminStorage = getStorage(adminApp);
