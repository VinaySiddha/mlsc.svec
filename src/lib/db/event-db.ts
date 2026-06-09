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
      return {
        ...data,
        id: doc.id,
        date: data.date.toDate().toISOString(),
        registrationDeadline: data.registrationDeadline?.toDate().toISOString() || null,
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
}
