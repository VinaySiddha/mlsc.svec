import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminFirestore, getAdminApp } from '@/lib/firebase-admin';

export async function GET() {
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

    const results = [];

    for (const domain of DOMAINS) {
      const email = `panel_${domain.id}@mlscsvec.com`;
      const password = 'Password123!';
      const displayName = `${domain.label} Panel`;
      
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
          userRecord = await auth.createUser({
            email,
            password,
            displayName,
          });
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

      results.push({ email, uid: userRecord.uid, domain: domain.id });
    }

    return NextResponse.json({ success: true, created: results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
