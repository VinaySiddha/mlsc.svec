import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

const adminApp = !getApps().length
  ? (() => {
      const credInput = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!credInput) throw new Error('GOOGLE_APPLICATION_CREDENTIALS env var not set');
      
      let serviceAccount;
      
      // Check if credInput is a JSON string (starts with '{') or a file path
      if (credInput.trim().startsWith('{')) {
        // It's JSON content directly
        serviceAccount = JSON.parse(credInput);
      } else {
        // It's a file path
        const resolved = path.resolve(credInput);
        serviceAccount = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
      }
      
      return initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    })()
  : getApps()[0];

export const adminStorage = getStorage(adminApp);
