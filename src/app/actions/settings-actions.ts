'use server';

import { cookies } from 'next/headers';
import { ApplicationDb } from '@/lib/db/application-db';
import { revalidateTag, unstable_cache } from 'next/cache';
import { logActivityAction, logErrorAction } from './log-actions';

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
        '3.0': { isHiringOpen: false, isTeamVisible: true, registrationLimit: 0 },
        '4.0': { isHiringOpen: true, isTeamVisible: true, registrationLimit: 0 },
      },
    };
  },
  ['global-settings'],
  { tags: ['global-settings'], revalidate: 60 }
);

export async function getGlobalSettings() {
  try {
    const settings = await getCachedGlobalSettings();
    const chapterCounts = await ApplicationDb.getChapterApplicationsCounts();
    return { settings, chapterCounts };
  } catch (error: any) {
    console.error('Error getting global settings:', error);
    return { error: 'Failed to retrieve settings.' };
  }
}

export async function updateChapterSettingsAction(
  chapter: string,
  values: { isHiringOpen?: boolean; isTeamVisible?: boolean; registrationLimit?: number }
) {
  try {
    await ApplicationDb.updateChapterSettings(chapter, values);
    
    // Log activity
    const details: string[] = [];
    if (values.isHiringOpen !== undefined) details.push(`Hiring Gate is ${values.isHiringOpen ? "OPEN" : "CLOSED"}`);
    if (values.isTeamVisible !== undefined) details.push(`Team visibility is ${values.isTeamVisible ? "VISIBLE" : "HIDDEN"}`);
    if (values.registrationLimit !== undefined) details.push(`Registration Limit is ${values.registrationLimit > 0 ? values.registrationLimit : "Unlimited"}`);

    await logActivityAction(
      `Chapter Settings Updated`,
      `Admin updated chapter ${chapter} configurations: ${details.join(', ')}`,
      undefined,
      "Admin"
    );

    // Bust both caches so the team page & settings reflect the change immediately
    revalidateTag('team-members', 'max');
    revalidateTag('global-settings', 'max');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating chapter settings:', error);
    await logErrorAction(
      `Settings Update Failed`,
      `Failed to update settings for chapter ${chapter}. Error: ${error.message || error}`
    );
    return { error: 'Failed to update chapter settings.' };
  }
}

export async function setActiveChapterAction(chapter: string) {
  try {
    await ApplicationDb.setActiveChapter(chapter);
    // Log activity
    await logActivityAction(
      `Active Chapter Toggled`,
      `Admin changed active main site chapter to: "${chapter}"`,
      undefined,
      "Admin"
    );
    revalidateTag('global-settings', 'max');
    return { success: true };
  } catch (error: any) {
    console.error('Error setting active chapter:', error);
    await logErrorAction(
      `Active Chapter Toggle Failed`,
      `Failed to toggle active chapter to ${chapter}. Error: ${error.message || error}`
    );
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
    
    // Log activity
    await logActivityAction(
      `New Chapter Created`,
      `Admin created new chapter: "${trimmed}"`,
      undefined,
      "Admin"
    );
    
    revalidateTag('global-settings', 'max');
    revalidateTag('team-members', 'max');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating new chapter:', error);
    await logErrorAction(
      `New Chapter Creation Failed`,
      `Failed to create chapter "${chapter}". Error: ${error.message || error}`
    );
    return { error: 'Failed to create new chapter.' };
  }
}

