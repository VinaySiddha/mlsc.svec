import { config } from 'dotenv';
config();
import { db } from '../src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function run() {
  try {
    console.log("Fetching events from Firestore...");
    const eventsCol = collection(db, 'events');
    const snapshot = await getDocs(eventsCol);
    console.log(`Found ${snapshot.size} events:`);
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Title: ${data.title}`);
      console.log(`  Date Type: ${typeof data.date} / ${data.date?.constructor?.name}`);
      console.log(`  Date Value:`, data.date);
      console.log(`  CreatedAt Type: ${typeof data.createdAt} / ${data.createdAt?.constructor?.name}`);
      console.log(`  CreatedAt Value:`, data.createdAt);
    });
  } catch (err) {
    console.error("Error fetching events:", err);
  }
}

run();
