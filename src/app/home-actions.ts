'use server';

import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

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
}

export async function getHomePageData(): Promise<HomePageData> {
  const [heroSnap, ambassadorSnap, gallerySnap, chapterSnap] = await Promise.all([
    getDocs(query(collection(db, 'home_hero'), orderBy('createdAt', 'desc'))),
    getDocs(query(collection(db, 'home_ambassadors'), orderBy('createdAt', 'desc'))),
    getDocs(query(collection(db, 'home_gallery'), orderBy('createdAt', 'desc'))),
    getDocs(query(collection(db, 'home_chapters'), orderBy('createdAt', 'asc'))),
  ]);

  const heroImages = heroSnap.docs
    .map((doc) => {
      const raw = doc.data();
      if (typeof raw.url !== 'string') return null;
      return { id: doc.id, url: raw.url };
    })
    .filter((item): item is HeroImage => item !== null);

  const ambassadors = ambassadorSnap.docs
    .map((doc) => {
      const raw = doc.data();
      if (typeof raw.name !== 'string' || typeof raw.description !== 'string' || typeof raw.photoUrl !== 'string') return null;
      return { id: doc.id, name: raw.name, description: raw.description, photoUrl: raw.photoUrl };
    })
    .filter((item): item is Ambassador => item !== null);

  const galleryImages = gallerySnap.docs
    .map((doc) => {
      const raw = doc.data();
      if (typeof raw.url !== 'string' || (raw.type !== 'moments' && raw.type !== 'milestones')) return null;
      return { id: doc.id, url: raw.url, type: raw.type as GalleryImage['type'] };
    })
    .filter((item): item is GalleryImage => item !== null);

  const chapters = chapterSnap.docs
    .map((doc) => {
      const raw = doc.data();
      if (typeof raw.name !== 'string' || typeof raw.description !== 'string' || !Array.isArray(raw.cards)) return null;
      const cards = raw.cards.filter(
        (card: any): card is ChapterCard => card && typeof card.title === 'string' && typeof card.content === 'string'
      );
      return { id: doc.id, name: raw.name, description: raw.description, cards };
    })
    .filter((item): item is Chapter => item !== null);

  return { heroImages, ambassadors, galleryImages, chapters };
}
