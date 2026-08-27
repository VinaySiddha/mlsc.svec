import { NotificationDb } from '@/lib/db/notification-db';

export interface Announcement {
  type: 'notification' | 'event';
  message: string;
  link?: string;
}

export class NotificationService {
  static async getRawNotifications() {
    return await NotificationDb.getRawNotifications();
  }

  static async addNotification(message: string) {
    await NotificationDb.addNotification(message);
  }

  static async deleteNotification(id: string) {
    await NotificationDb.deleteNotification(id);
  }

  static async getLatestAnnouncement(): Promise<Announcement | null> {
    const latestNotification = await NotificationDb.getLatestNotificationDoc();
    const latestEvent = await NotificationDb.getLatestEventDoc();

    if (!latestNotification && !latestEvent) {
      return null;
    }

    if (latestNotification && !latestEvent) {
      return { type: 'notification', message: latestNotification.message };
    }

    if (!latestNotification && latestEvent) {
      return { type: 'event', message: `New Event: ${latestEvent.title}`, link: `/events/${latestEvent.id}` };
    }

    if (latestNotification!.createdAt.toMillis() > latestEvent!.createdAt.toMillis()) {
      return { type: 'notification', message: latestNotification!.message };
    } else {
      return { type: 'event', message: `New Event: ${latestEvent!.title}`, link: `/events/${latestEvent!.id}` };
    }
  }
}
