import * as admin from 'firebase-admin';

// Check if the required environment variables are available.
const hasRequiredEnvVars = 
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
  if (hasRequiredEnvVars) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines in the private key.
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
    }
  } else {
    // In a server environment, you should not proceed without credentials.
    // Log a clear error message.
    console.warn(
      'Firebase Admin SDK not initialized. Missing one or more required environment variables: ' +
      'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY. ' +
      'Please ensure these are set in your .env file for local development or in your hosting environment.'
    );
  }
}

// Export a function that safely returns the firestore instance.
// This will throw a clear error if initialization failed.
const getAdminDb = () => {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK has not been initialized. Check server logs for details.');
  }
  return admin.firestore();
};

const getAdminStorage = () => {
   if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK has not been initialized. Check server logs for details.');
  }
  return admin.storage();
}

export const adminDb = getAdminDb();
export const adminStorage = getAdminStorage();
