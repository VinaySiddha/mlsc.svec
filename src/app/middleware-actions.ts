
'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';

const visitorSchema = z.object({
  ip: z.string(),
  userAgent: z.string(),
  path: z.string(),
});

export async function logVisitor(data: z.infer<typeof visitorSchema>) {
  const parsed = visitorSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Invalid visitor data:", parsed.error);
    return;
  }
  try {
    await adminDb.collection('visitors').add({
      ...parsed.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error logging visitor:", error);
  }
}
