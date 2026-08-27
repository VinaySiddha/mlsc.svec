'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { logActivityAction, logErrorAction } from './log-actions';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  subject: z.string().min(3, 'Subject must be at least 3 characters.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export async function submitContactForm(data: any) {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid form data. Please check your inputs.' };
  }

  try {
    // Save to Firestore
    await addDoc(collection(db, 'contactMessages'), {
      ...parsed.data,
      createdAt: new Date().toISOString(),
    });

    // Log real-time system activity
    await logActivityAction(
      `Contact Inquiry Received`,
      `Message from ${parsed.data.name} (${parsed.data.email}) regarding: ${parsed.data.subject}`,
      undefined,
      parsed.data.name,
      parsed.data.email
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    await logErrorAction(
      `Contact Form Submission Failed`,
      `Inquiry submission from ${parsed.data.email} failed. Error: ${error.message || error}`
    );
    return { error: 'Failed to submit contact form. Please try again later.' };
  }
}
