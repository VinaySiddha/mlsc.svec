'use server';

import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { unstable_cache, revalidateTag } from 'next/cache';
import { AlumniTestimonial, SEED_ALUMNI_TESTIMONIALS } from '@/schemas/alumni';

export interface HeroImage {
  id: string;
  url: string;
  path?: string;
}

export interface Ambassador {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  photoPath?: string;
  tagline?: string;
  badge?: string;
  badgeColor?: string;
  skills?: string[];
  level?: string;
  linkedin?: string;
  github?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  path?: string;
  type: 'moments' | 'milestones' | 'hackathons' | 'workshops';
  title?: string;
  desc?: string;
  date?: string;
  location?: string;
  stats?: string;
  tag?: string;
  color?: string;
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

    const heroImages: HeroImage[] = heroResult.status === 'fulfilled' 
      ? heroResult.value.docs
          .map((doc) => {
            const raw = doc.data();
            if (typeof raw.url !== 'string') return null;
            return { id: doc.id, url: raw.url, path: raw.path } as HeroImage;
          })
          .filter((item): item is HeroImage => item !== null)
      : [];

    const ambassadors = ambassadorResult.status === 'fulfilled'
      ? ambassadorResult.value.docs
          .map((doc) => {
            const raw = doc.data();
            if (typeof raw.name !== 'string' || typeof raw.photoUrl !== 'string') return null;
            return { 
              id: doc.id, 
              name: raw.name, 
              description: raw.description || '', 
              photoUrl: raw.photoUrl,
              photoPath: raw.photoPath,
              tagline: raw.tagline || 'Microsoft Learn Student Ambassador',
              badge: raw.badge || 'MLSA LEAD',
              badgeColor: raw.badgeColor || '#4285F4',
              skills: Array.isArray(raw.skills) ? raw.skills : ['AI & Cloud', 'DevOps', 'Community'],
              level: raw.level || 'TIER 03',
              linkedin: raw.linkedin || 'https://linkedin.com',
              github: raw.github || 'https://github.com',
            } as Ambassador;
          })
          .filter((item): item is Ambassador => item !== null)
      : [];

    const galleryImages = galleryResult.status === 'fulfilled'
      ? galleryResult.value.docs
          .map((doc) => {
            const raw = doc.data();
            if (typeof raw.url !== 'string') return null;
            return { 
              id: doc.id, 
              url: raw.url, 
              path: raw.path,
              type: (raw.type as GalleryImage['type']) || 'moments',
              title: raw.title || (raw.type === 'milestones' ? 'Ecosystem Milestone' : 'Community Moment'),
              desc: raw.desc || 'Live capture from our engineering hackathons and builder workshops.',
              date: raw.date || '2026',
              location: raw.location || 'SVEC CAMPUS',
              stats: raw.stats || 'ACTIVE EVENT',
              tag: raw.tag || (raw.type ? raw.type.toUpperCase() : 'EVENT'),
              color: raw.color || '#4285F4',
            } as GalleryImage;
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
  { tags: ['home-page-data', 'alumni-words'], revalidate: 3600 }
);

export async function getHomePageData(): Promise<HomePageData> {
  return getCachedHomePageData();
}

export async function revalidateHomePageData() {
  revalidateTag('home-page-data', 'max');
}
