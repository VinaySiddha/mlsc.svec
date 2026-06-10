import { applicationDefault, cert, initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

export function getAdminApp() {
  if (getApps().length) {
    return getApp();
  }

  const credInput = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credential = credInput && credInput.trim().startsWith('{')
    ? cert(JSON.parse(credInput))
    : applicationDefault();

  return initializeApp({
    credential,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}
