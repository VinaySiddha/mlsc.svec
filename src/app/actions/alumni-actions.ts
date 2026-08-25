'use server';

import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import { 
  AlumniTestimonial, 
  alumniTestimonialSchema, 
  publicAlumniSubmissionSchema,
  SEED_ALUMNI_TESTIMONIALS 
} from '@/schemas/alumni';
import { logActivityAction, logErrorAction } from './log-actions';

const VIBRANT_COLORS = [
  '#4285F4', // Google Blue
  '#34A853', // Google Green
  '#FBBC05', // Google Yellow
  '#EA4335', // Google Red
  '#A733FF', // Electric Purple
  '#00F0FF', // Cyan Neon
  '#FF0055', // Neo Magenta
  '#00FF66', // Acid Lime
];

function getInitials(name: string): string {
  if (!name) return 'AL';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRandomColor(): string {
  return VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
}

const getCachedAlumniTestimonials = unstable_cache(
  async (): Promise<AlumniTestimonial[]> => {
    try {
      const q = query(collection(db, 'alumni_testimonials'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return SEED_ALUMNI_TESTIMONIALS;
      }

      const list = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || 'Anonymous Alumnus',
          initials: data.initials || getInitials(data.name || ''),
          role: data.role || 'Alumnus',
          currentRole: data.currentRole || '',
          company: data.company || '',
          batch: data.batch || '2024',
          quote: data.quote || '',
          fullStory: data.fullStory || '',
          photoUrl: data.photoUrl || '',
          photoPath: data.photoPath || '',
          color: data.color || '#4285F4',
          type: data.type || 'milestones',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          twitterUrl: data.twitterUrl || '',
          email: data.email || '',
          isApproved: typeof data.isApproved === 'boolean' ? data.isApproved : true,
          isFeatured: typeof data.isFeatured === 'boolean' ? data.isFeatured : true,
          displayOrder: data.displayOrder ?? 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        } as AlumniTestimonial;
      });

      return list;
    } catch (error) {
      console.error('Error fetching alumni testimonials from Firestore:', error);
      return SEED_ALUMNI_TESTIMONIALS;
    }
  },
  ['alumni-testimonials-list'],
  { tags: ['alumni-words', 'home-page-data'], revalidate: 300 }
);

/**
 * Fetch all alumni testimonials (approved by default for public views)
 */
export async function getAlumniTestimonials(options?: { onlyApproved?: boolean; onlyFeatured?: boolean }) {
  try {
    const list = await getCachedAlumniTestimonials();
    let filtered = list;

    if (options?.onlyApproved) {
      filtered = filtered.filter(item => item.isApproved);
    }
    if (options?.onlyFeatured) {
      filtered = filtered.filter(item => item.isFeatured);
    }

    return { testimonials: filtered, success: true };
  } catch (error: any) {
    console.error('getAlumniTestimonials error:', error);
    return { testimonials: SEED_ALUMNI_TESTIMONIALS, error: error.message || 'Failed to load alumni words.' };
  }
}

/**
 * Public submission action: Alumni can submit their own words/testimonial
 */
export async function submitAlumniTestimonial(rawData: any) {
  const parsed = publicAlumniSubmissionSchema.safeParse(rawData);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || 'Invalid form data.';
    return { success: false, error: issue };
  }

  const data = parsed.data;
  const initials = getInitials(data.name);
  const color = data.color || getRandomColor();

  try {
    const docData = {
      name: data.name.trim(),
      initials,
      role: data.role.trim(),
      currentRole: data.currentRole?.trim() || '',
      company: data.company?.trim() || '',
      batch: data.batch.trim(),
      quote: data.quote.trim(),
      fullStory: data.fullStory?.trim() || '',
      photoUrl: data.photoUrl?.trim() || '',
      photoPath: data.photoPath?.trim() || '',
      color,
      type: data.type || 'milestones',
      linkedinUrl: data.linkedinUrl?.trim() || '',
      githubUrl: data.githubUrl?.trim() || '',
      twitterUrl: data.twitterUrl?.trim() || '',
      email: data.email?.trim() || '',
      isApproved: true, // Default to approved so it displays right away
      isFeatured: true, // Also feature by default
      displayOrder: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'alumni_testimonials'), docData);

    await logActivityAction(
      `Alumni Testimonial Submitted`,
      `Alumnus ${data.name} (${data.batch}, ${data.role}) shared their words for MLSC SVEC.`,
      docRef.id,
      data.name,
      data.email
    );

    revalidateTag('alumni-words', 'max');
    revalidateTag('home-page-data', 'max');
    revalidatePath('/what-our-alumni-say');
    revalidatePath('/alumni-words');
    revalidatePath('/');
    revalidatePath('/admin/alumni');

    return { 
      success: true, 
      id: docRef.id, 
      message: 'Thank you for sharing your journey and words with the MLSC SVEC community!' 
    };
  } catch (error: any) {
    console.error('submitAlumniTestimonial error:', error);
    await logErrorAction(
      `Alumni Submission Failed`,
      `Failed to submit words for ${data.name}. Error: ${error.message || error}`
    );
    return { success: false, error: error.message || 'Failed to submit your words. Please try again.' };
  }
}

/**
 * Admin: Create a new alumni testimonial
 */
export async function createAlumniTestimonial(rawData: any) {
  const parsed = alumniTestimonialSchema.safeParse(rawData);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || 'Invalid form data.';
    return { success: false, error: issue };
  }

  const data = parsed.data;
  const initials = data.initials?.trim() || getInitials(data.name);
  const color = data.color || getRandomColor();

  try {
    const docData = {
      ...data,
      name: data.name.trim(),
      initials,
      role: data.role.trim(),
      currentRole: data.currentRole?.trim() || '',
      company: data.company?.trim() || '',
      batch: data.batch.trim(),
      quote: data.quote.trim(),
      fullStory: data.fullStory?.trim() || '',
      photoUrl: data.photoUrl?.trim() || '',
      photoPath: data.photoPath?.trim() || '',
      color,
      type: data.type || 'milestones',
      linkedinUrl: data.linkedinUrl?.trim() || '',
      githubUrl: data.githubUrl?.trim() || '',
      twitterUrl: data.twitterUrl?.trim() || '',
      email: data.email?.trim() || '',
      isApproved: data.isApproved ?? true,
      isFeatured: data.isFeatured ?? true,
      displayOrder: Number(data.displayOrder) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'alumni_testimonials'), docData);

    await logActivityAction(
      `Alumni Testimonial Created by Admin`,
      `Admin added alumni testimonial for ${data.name} (${data.batch})`,
      docRef.id,
      'Admin'
    );

    revalidateTag('alumni-words', 'max');
    revalidateTag('home-page-data', 'max');
    revalidatePath('/what-our-alumni-say');
    revalidatePath('/alumni-words');
    revalidatePath('/');
    revalidatePath('/admin/alumni');

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('createAlumniTestimonial error:', error);
    await logErrorAction(
      `Alumni Creation Failed`,
      `Failed to create testimonial for ${data.name}. Error: ${error.message || error}`
    );
    return { success: false, error: error.message || 'Failed to create alumni testimonial.' };
  }
}

/**
 * Admin: Update an existing alumni testimonial
 */
export async function updateAlumniTestimonial(id: string, rawData: any) {
  if (!id) return { success: false, error: 'Testimonial ID is required.' };

  const parsed = alumniTestimonialSchema.partial().safeParse(rawData);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || 'Invalid form data.';
    return { success: false, error: issue };
  }

  const data = parsed.data;
  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.name && !data.initials) {
    updateData.initials = getInitials(data.name);
  }

  try {
    const docRef = doc(db, 'alumni_testimonials', id);
    await updateDoc(docRef, updateData);

    await logActivityAction(
      `Alumni Testimonial Updated`,
      `Admin updated alumni testimonial ID: ${id} (${data.name || 'Alumnus'})`,
      id,
      'Admin'
    );

    revalidateTag('alumni-words', 'max');
    revalidateTag('home-page-data', 'max');
    revalidatePath('/what-our-alumni-say');
    revalidatePath('/alumni-words');
    revalidatePath('/');
    revalidatePath('/admin/alumni');

    return { success: true };
  } catch (error: any) {
    console.error('updateAlumniTestimonial error:', error);
    await logErrorAction(
      `Alumni Update Failed`,
      `Failed to update testimonial ID ${id}. Error: ${error.message || error}`
    );
    return { success: false, error: error.message || 'Failed to update alumni testimonial.' };
  }
}

/**
 * Admin: Delete an alumni testimonial and clean up storage photo if present
 */
export async function deleteAlumniTestimonial(id: string, photoPath?: string) {
  if (!id) return { success: false, error: 'Testimonial ID is required.' };

  try {
    // Attempt deleting photo from storage if photoPath is stored
    if (photoPath) {
      try {
        const storageRef = ref(storage, photoPath);
        await deleteObject(storageRef);
      } catch (storageErr: any) {
        console.warn('Storage file delete warning:', storageErr.message);
      }
    }

    const docRef = doc(db, 'alumni_testimonials', id);
    await deleteDoc(docRef);

    await logActivityAction(
      `Alumni Testimonial Deleted`,
      `Admin deleted alumni testimonial ID: ${id}`,
      id,
      'Admin'
    );

    revalidateTag('alumni-words', 'max');
    revalidateTag('home-page-data', 'max');
    revalidatePath('/what-our-alumni-say');
    revalidatePath('/alumni-words');
    revalidatePath('/');
    revalidatePath('/admin/alumni');

    return { success: true };
  } catch (error: any) {
    console.error('deleteAlumniTestimonial error:', error);
    await logErrorAction(
      `Alumni Deletion Failed`,
      `Failed to delete testimonial ID ${id}. Error: ${error.message || error}`
    );
    return { success: false, error: error.message || 'Failed to delete alumni testimonial.' };
  }
}

/**
 * Admin: Quick toggle for isApproved or isFeatured
 */
export async function toggleAlumniStatus(id: string, field: 'isApproved' | 'isFeatured', value: boolean) {
  if (!id) return { success: false, error: 'Testimonial ID is required.' };

  try {
    const docRef = doc(db, 'alumni_testimonials', id);
    await updateDoc(docRef, {
      [field]: value,
      updatedAt: serverTimestamp(),
    });

    revalidateTag('alumni-words', 'max');
    revalidateTag('home-page-data', 'max');
    revalidatePath('/what-our-alumni-say');
    revalidatePath('/alumni-words');
    revalidatePath('/');
    revalidatePath('/admin/alumni');

    return { success: true };
  } catch (error: any) {
    console.error(`toggleAlumniStatus (${field}) error:`, error);
    return { success: false, error: error.message || 'Failed to update status.' };
  }
}
