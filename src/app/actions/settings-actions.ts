'use server';

import { cookies } from 'next/headers';
import { ApplicationDb } from '@/lib/db/application-db';
import { revalidateTag, unstable_cache } from 'next/cache';

export async function setAdminChapterAction(chapter: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin_chapter', chapter, { path: '/' });
  return { success: true };
}

// Cached with a 60-second TTL — revalidated whenever chapter settings change
const getCachedGlobalSettings = unstable_cache(
  async () => {
    const settingsSnap = await ApplicationDb.getGlobalSettingsDoc();
    if (settingsSnap.exists()) return settingsSnap.data();
    return {
      activeChapter: '3.0',
      chapters: {
        '3.0': { isHiringOpen: false, isTeamVisible: true },
        '4.0': { isHiringOpen: true, isTeamVisible: true },
      },
    };
  },
  ['global-settings'],
  { tags: ['global-settings'], revalidate: 60 }
);

export async function getGlobalSettings() {
  try {
    const settings = await getCachedGlobalSettings();
    return { settings };
  } catch (error: any) {
    console.error('Error getting global settings:', error);
    return { error: 'Failed to retrieve settings.' };
  }
}

export async function updateChapterSettingsAction(
  chapter: string,
  values: { isHiringOpen?: boolean; isTeamVisible?: boolean }
) {
  try {
    await ApplicationDb.updateChapterSettings(chapter, values);
    // Bust both caches so the team page & settings reflect the change immediately
    revalidateTag('team-members', 'max');
    revalidateTag('global-settings', 'max');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating chapter settings:', error);
    return { error: 'Failed to update chapter settings.' };
  }
}

export async function setActiveChapterAction(chapter: string) {
  try {
    await ApplicationDb.setActiveChapter(chapter);
    revalidateTag('global-settings', 'max');
    return { success: true };
  } catch (error: any) {
    console.error('Error setting active chapter:', error);
    return { error: 'Failed to set active chapter.' };
  }
}

export async function createNewChapterAction(chapter: string) {
  try {
    const trimmed = chapter.trim();
    if (!trimmed || !/^\d+\.\d+$/.test(trimmed)) {
      return { error: 'Invalid chapter name. Please use format like "5.0".' };
    }
    await ApplicationDb.updateChapterSettings(trimmed, { isHiringOpen: false, isTeamVisible: true });
    revalidateTag('global-settings', 'max');
    revalidateTag('team-members', 'max');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating new chapter:', error);
    return { error: 'Failed to create new chapter.' };
  }
}
