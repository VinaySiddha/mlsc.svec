'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { sendEmail } from '@/lib/email';

export async function broadcastEmail(subject: string, html: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  try {
    const q = query(
      collection(db, 'users'),
      where('emailNotifications', '==', true),
      where('disabled', '==', false)
    );
    const snapshot = await getDocs(q);
    const emails: string[] = [];
    snapshot.forEach((d) => {
      const email = d.data().email;
      if (email) emails.push(email);
    });

    // Send in batches of 10 with 1s delay to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((to) => sendEmail({ to, subject, html }))
      );
      results.forEach((ok) => {
        if (ok) sent++;
        else failed++;
      });

      if (i + batchSize < emails.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  } catch (error) {
    console.error('Broadcast email error:', error);
  }

  console.log(`Broadcast complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}
