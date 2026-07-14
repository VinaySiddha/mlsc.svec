import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getCountFromServer,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore';

export class EventDb {
  static generateEventId() {
    return doc(collection(db, 'events')).id;
  }

  static async saveEvent(docId: string, dataToSave: any) {
    const finalData = {
      ...dataToSave,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'events', docId), finalData);
  }

  static async updateEventDoc(id: string, dataToUpdate: any) {
    const eventDocRef = doc(db, 'events', id);
    const finalData = { ...dataToUpdate };
    if (finalData.seatLimits === null || finalData.seatLimits === undefined) {
      finalData.seatLimits = deleteField();
    }
    await updateDoc(eventDocRef, finalData);
  }

  static async deleteEventDoc(id: string) {
    await deleteDoc(doc(db, 'events', id));
  }

  static async getEventsList() {
    const eventsCol = collection(db, 'events');
    const q = query(eventsCol, orderBy('date', 'desc'));
    const eventSnapshot = await getDocs(q);
    return eventSnapshot.docs.map(doc => {
      const data = doc.data();
      const dateStr = data.date && typeof data.date.toDate === 'function'
        ? data.date.toDate().toISOString()
        : (data.date instanceof Date ? data.date.toISOString() : (typeof data.date === 'string' ? new Date(data.date).toISOString() : new Date().toISOString()));

      const deadlineStr = data.registrationDeadline && typeof data.registrationDeadline.toDate === 'function'
        ? data.registrationDeadline.toDate().toISOString()
        : (data.registrationDeadline instanceof Date ? data.registrationDeadline.toISOString() : (typeof data.registrationDeadline === 'string' ? new Date(data.registrationDeadline).toISOString() : null));

      const createdAtStr = data.createdAt && typeof data.createdAt.toDate === 'function'
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt instanceof Date ? data.createdAt.toISOString() : (typeof data.createdAt === 'string' ? new Date(data.createdAt).toISOString() : null));

      return {
        ...data,
        id: doc.id,
        date: dateStr,
        registrationDeadline: deadlineStr,
        createdAt: createdAtStr,
      };
    });
  }

  static async getEventDoc(id: string) {
    return await getDoc(doc(db, 'events', id));
  }

  static async getEventRegistrationsCount(eventId: string) {
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const registrationsSnapshot = await getCountFromServer(registrationsRef);
    return registrationsSnapshot.data().count;
  }

  static async checkUserRegistration(eventId: string, userId: string) {
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const userQuery = query(registrationsRef, where("userId", "==", userId));
    const userSnapshot = await getDocs(userQuery);
    return !userSnapshot.empty;
  }

  static async checkEmailRegistration(eventId: string, email: string) {
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const emailQuery = query(registrationsRef, where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);
    return !emailSnapshot.empty;
  }

  static async addEventRegistration(eventId: string, registrationData: any) {
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    return await addDoc(registrationsRef, registrationData);
  }

  static async addUserEventRegistration(userId: string, eventId: string, userEventData: any) {
    const userEventRef = doc(db, 'users', userId, 'registeredEvents', eventId);
    await setDoc(userEventRef, userEventData);
  }

  static async getEventRegistrationsList(eventId: string) {
    const registrationsCol = collection(db, 'events', eventId, 'registrations');
    const q = query(registrationsCol, orderBy('registeredAt', 'desc'));
    const registrationSnapshot = await getDocs(q);
    return registrationSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
  }

  static async getEventRegistrationsDocs(eventId: string) {
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    return await getDocs(registrationsRef);
  }

  static async getBranchRegistrationsCount(eventId: string, branch: string) {
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const branchQuery = query(registrationsRef, where('branch', '==', branch));
    const branchCount = await getCountFromServer(branchQuery);
    return branchCount.data().count;
  }

  static async getYearRegistrationsCount(eventId: string, yearOfStudy: string) {
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const yearQuery = query(registrationsRef, where('yearOfStudy', '==', yearOfStudy));
    const yearCount = await getCountFromServer(yearQuery);
    return yearCount.data().count;
  }

  static async getEventRegistration(eventId: string, registrationId: string) {
    const registrationRef = doc(db, 'events', eventId, 'registrations', registrationId);
    const snap = await getDoc(registrationRef);
    if (!snap.exists()) return null;
    return {
      ...snap.data(),
      id: snap.id,
    } as any;
  }

  static async updateEventRegistration(eventId: string, registrationId: string, dataToUpdate: any) {
    const registrationRef = doc(db, 'events', eventId, 'registrations', registrationId);
    await updateDoc(registrationRef, dataToUpdate);
  }
}
