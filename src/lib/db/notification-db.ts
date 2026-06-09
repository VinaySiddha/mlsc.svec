import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, limit, serverTimestamp } from 'firebase/firestore';

export class NotificationDb {
  static async getRawNotifications() {
    const notificationsCol = collection(db, 'notifications');
    const q = query(notificationsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async addNotification(message: string) {
    return await addDoc(collection(db, 'notifications'), {
      message,
      createdAt: serverTimestamp(),
    });
  }

  static async deleteNotification(id: string) {
    await deleteDoc(doc(db, 'notifications', id));
  }

  static async getLatestNotificationDoc() {
    const notificationsCol = collection(db, 'notifications');
    const notificationQuery = query(notificationsCol, orderBy('createdAt', 'desc'), limit(1));
    const notificationSnapshot = await getDocs(notificationQuery);
    return notificationSnapshot.empty ? null : { ...notificationSnapshot.docs[0].data(), id: notificationSnapshot.docs[0].id } as any;
  }

  static async getLatestEventDoc() {
    const eventsCol = collection(db, 'events');
    const eventQuery = query(eventsCol, orderBy('createdAt', 'desc'), limit(1));
    const eventSnapshot = await getDocs(eventQuery);
    return eventSnapshot.empty ? null : { ...eventSnapshot.docs[0].data(), id: eventSnapshot.docs[0].id } as any;
  }
}
