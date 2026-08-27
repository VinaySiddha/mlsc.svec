import { getAuth } from 'firebase-admin/auth';
import { getAdminFirestore, getAdminApp } from '../src/lib/firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    const auth = getAuth(getAdminApp());
    const db = getAdminFirestore();

    const DOMAINS = [
      { id: 'gen_ai', label: 'Generative AI' },
      { id: 'ds_ml', label: 'Data Science & ML' },
      { id: 'azure', label: 'Azure Cloud' },
      { id: 'web_app', label: 'Web & App Dev' },
      { id: 'event_management', label: 'Event Management' },
      { id: 'public_relations', label: 'Public Relations' },
      { id: 'media_marketing', label: 'Media & Marketing' },
      { id: 'creativity', label: 'Creativity' },
    ];

    console.log("Creating panel users...");

    for (const domain of DOMAINS) {
      const email = `panel_${domain.id}@mlscsvec.com`;
      const password = 'Password123!';
      const displayName = `${domain.label} Panel`;
      
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        console.log(`User ${email} already exists in auth.`);
      } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
          userRecord = await auth.createUser({
            email,
            password,
            displayName,
          });
          console.log(`Created auth user ${email}.`);
        } else {
          throw e;
        }
      }

      await db.collection('users').doc(userRecord.uid).set({
        displayName,
        email,
        photoURL: '',
        username: `panel_${domain.id}`,
        role: 'panel',
        domain: domain.id,
        bio: `${domain.label} Review Panel`,
        disabled: false,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      console.log(`Updated Firestore for ${email}.`);
    }

    console.log("Done creating 8 panel users.");
    process.exit(0);
  } catch (err: any) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
