'use server';

import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { unstable_cache, revalidateTag } from 'next/cache';
import { AlumniTestimonial, SEED_ALUMNI_TESTIMONIALS } from '@/schemas/alumni';

export interface HeroImage {
  id: string;
  url: string;
}

export interface Ambassador {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  type: 'moments' | 'milestones';
}

export interface ChapterCard {
  title: string;
  content: string;
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  cards: ChapterCard[];
}

export interface HomePageData {
  heroImages: HeroImage[];
  ambassadors: Ambassador[];
  galleryImages: GalleryImage[];
  chapters: Chapter[];
  alumniTestimonials: AlumniTestimonial[];
}

// Cached query that fetches data from Firestore and caches it
const getCachedHomePageData = unstable_cache(
  async (): Promise<HomePageData> => {
    const results = await Promise.allSettled([
      getDocs(query(collection(db, 'home_hero'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'home_ambassadors'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'home_gallery'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'home_chapters'), orderBy('createdAt', 'asc'))),
      getDocs(query(collection(db, 'alumni_testimonials'), orderBy('createdAt', 'desc'))),
    ]);

    const [heroResult, ambassadorResult, galleryResult, chapterResult, alumniResult] = results;

    const heroImages = heroResult.status === 'fulfilled' 
      ? heroResult.value.docs
          .map((doc) => {
            const raw = doc.data();
            if (typeof raw.url !== 'string') return null;
            return { id: doc.id, url: raw.url };
          })
          .filter((item): item is HeroImage => item !== null)
      : [];

    const ambassadors = ambassadorResult.status === 'fulfilled'
      ? ambassadorResult.value.docs
          .map((doc) => {
            const raw = doc.data();
            if (typeof raw.name !== 'string' || typeof raw.description !== 'string' || typeof raw.photoUrl !== 'string') return null;
            return { id: doc.id, name: raw.name, description: raw.description, photoUrl: raw.photoUrl };
          })
          .filter((item): item is Ambassador => item !== null)
      : [];

    const galleryImages = galleryResult.status === 'fulfilled'
      ? galleryResult.value.docs
          .map((doc) => {
            const raw = doc.data();
            if (typeof raw.url !== 'string' || (raw.type !== 'moments' && raw.type !== 'milestones')) return null;
            return { id: doc.id, url: raw.url, type: raw.type as GalleryImage['type'] };
          })
          .filter((item): item is GalleryImage => item !== null)
      : [];

    const chapters = chapterResult.status === 'fulfilled'
      ? chapterResult.value.docs
          .map((doc) => {
            const raw = doc.data();
            if (typeof raw.name !== 'string' || typeof raw.description !== 'string' || !Array.isArray(raw.cards)) return null;
            const cards = raw.cards.filter(
              (card: any): card is ChapterCard => card && typeof card.title === 'string' && typeof card.content === 'string'
            );
            return { id: doc.id, name: raw.name, description: raw.description, cards };
          })
          .filter((item): item is Chapter => item !== null)
      : [];

    let alumniTestimonials: AlumniTestimonial[] = [];
    if (alumniResult.status === 'fulfilled' && !alumniResult.value.empty) {
      alumniTestimonials = alumniResult.value.docs
        .map((doc) => {
          const raw = doc.data();
          if (!raw.name || !raw.quote) return null;
          return {
            id: doc.id,
            name: raw.name,
            initials: raw.initials || raw.name.substring(0, 2).toUpperCase(),
            role: raw.role || 'Alumnus',
            currentRole: raw.currentRole || '',
            company: raw.company || '',
            batch: raw.batch || '2024',
            quote: raw.quote,
            fullStory: raw.fullStory || '',
            photoUrl: raw.photoUrl || '',
            photoPath: raw.photoPath || '',
            color: raw.color || '#4285F4',
            type: raw.type || 'milestones',
            linkedinUrl: raw.linkedinUrl || '',
            githubUrl: raw.githubUrl || '',
            twitterUrl: raw.twitterUrl || '',
            email: raw.email || '',
            isApproved: typeof raw.isApproved === 'boolean' ? raw.isApproved : true,
            isFeatured: typeof raw.isFeatured === 'boolean' ? raw.isFeatured : true,
            displayOrder: raw.displayOrder ?? 0,
            createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt || new Date().toISOString(),
          } as AlumniTestimonial;
        })
        .filter((item): item is AlumniTestimonial => item !== null && item.isApproved && item.isFeatured);
    }

    // If Firestore has no featured/approved alumni testimonials, gracefully fall back to seed data
    if (alumniTestimonials.length === 0) {
      alumniTestimonials = SEED_ALUMNI_TESTIMONIALS;
    }

    if (results.some(r => r.status === 'rejected')) {
      console.error("One or more home page collections failed to load:", results);
    }

    return { heroImages, ambassadors, galleryImages, chapters, alumniTestimonials };
  },
  ['home-page-data'],
  { tags: ['home-page-data', 'alumni-words'], revalidate: 3600 } // Cache for up to 1 hour, revalidated on-demand
);

export async function getHomePageData(): Promise<HomePageData> {
  return getCachedHomePageData();
}

export async function revalidateHomePageData() {
  revalidateTag('home-page-data', 'max');
}
