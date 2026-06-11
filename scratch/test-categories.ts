import dotenv from 'dotenv';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Load env
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
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    console.log('--- Global Settings ---');
    if (settingsSnap.exists()) {
      console.log(JSON.stringify(settingsSnap.data(), null, 2));
    } else {
      console.log('No global settings doc found!');
    }

    const categoriesSnapshot = await getDocs(collection(db, 'teamCategories'));
    console.log('\n--- Team Categories ---');
    categoriesSnapshot.docs.forEach(d => {
      console.log(`- ID: ${d.id}, Name: "${d.data().name}"`);
    });

    const membersSnapshot = await getDocs(collection(db, 'teamMembers'));
    console.log('\n--- Team Members ---');
    console.log('Total members:', membersSnapshot.size);
    
    // Group members by chapter
    const chaptersMap: Record<string, number> = {};
    const statusesMap: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    membersSnapshot.docs.forEach(d => {
      const data = d.data();
      const chap = String(data.chapter);
      const status = String(data.status);
      const catId = String(data.categoryId);

      chaptersMap[chap] = (chaptersMap[chap] || 0) + 1;
      statusesMap[status] = (statusesMap[status] || 0) + 1;
      categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
    });

    console.log('Members by Chapter field:', chaptersMap);
    console.log('Members by Status:', statusesMap);
    console.log('Members by Category ID:', categoryCounts);

    // Let's print active members who are categorized
    console.log('\nActive members details:');
    membersSnapshot.docs.filter(d => d.data().status === 'active').slice(0, 10).forEach(d => {
      console.log(`- Name: "${d.data().name}", Chapter: ${JSON.stringify(d.data().chapter)}, CategoryId: "${d.data().categoryId}"`);
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
