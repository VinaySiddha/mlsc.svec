'use server';

import { unstable_cache, revalidateTag } from 'next/cache';
import { NotificationService } from '@/lib/services/notification-service';
import { notificationSchema } from '@/schemas/notification';

const getCachedNotifications = unstable_cache(
  async () => NotificationService.getRawNotifications(),
  ['notifications-list'],
  { tags: ['notifications'], revalidate: 3600 }
);

export async function getNotifications() {
  try {
    const notifications = await getCachedNotifications();
    return { notifications: notifications as unknown as { id: string, message: string }[] };
  } catch (e) {
    console.error("Error fetching notifications:", e);
    return { error: "Failed to fetch notifications." };
  }
}

export async function addNotification(values: any) {
  const parsed = notificationSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid notification data." };
  }

  try {
    await NotificationService.addNotification(parsed.data.message);
    revalidateTag('notifications', 'max');
    return { success: true };
  } catch (e) {
    console.error("Error adding notification:", e);
    return { error: "Failed to add notification." };
  }
}

export async function deleteNotification(id: string) {
  try {
    await NotificationService.deleteNotification(id);
    revalidateTag('notifications', 'max');
    return { success: true };
  } catch (e) {
    console.error("Error deleting notification:", e);
    return { error: "Failed to delete notification." };
  }
}

export async function getLatestAnnouncement() {
  try {
    const announcement = await NotificationService.getLatestAnnouncement();
    return { announcement, error: null };
  } catch (e) {
    console.error("Error fetching latest announcement:", e);
    return { announcement: null, error: "Failed to fetch latest announcement." };
  }
}
