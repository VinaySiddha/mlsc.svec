import dotenv from 'dotenv';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const settingsRef = doc(db, 'settings', 'payment_gateways');
    const settingsSnap = await getDoc(settingsRef);
    
    console.log('Current payment gateway settings in database:');
    if (settingsSnap.exists()) {
      console.log(JSON.stringify(settingsSnap.data(), null, 2));
    } else {
      console.log('No settings document found. Creating one...');
    }

    const updatedSettings = {
      cashfree: { enabled: true, message: 'Secure Online Payments' },
      mlscPay: { enabled: false, message: 'Manual UPI / QR Transfer' }
    };

    await setDoc(settingsRef, updatedSettings);
    console.log('\nSuccessfully updated payment gateway settings to:');
    console.log(JSON.stringify(updatedSettings, null, 2));
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

run();
