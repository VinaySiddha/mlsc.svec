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
import { sql } from '@/lib/new-db/client';

export class EventDb {
  static generateEventId() {
    if (process.env.DATA_PROVIDER === 'new') {
      return crypto.randomUUID();
    }
    return doc(collection(db, 'events')).id;
  }

  static async saveEvent(docId: string, dataToSave: any) {
    if (process.env.DATA_PROVIDER === 'new') {
      await sql`
        INSERT INTO events (
          id, title, description, event_date, location, mode,
          banner_image, list_image, highlight_images, speakers, seat_limits
        ) VALUES (
          ${docId}, ${dataToSave.title}, ${dataToSave.description || null},
          ${dataToSave.date ? new Date(dataToSave.date) : null},
          ${dataToSave.venue || dataToSave.location || null},
          ${dataToSave.mode || 'offline'},
          ${dataToSave.bannerImageUrl || dataToSave.bannerImage || null},
          ${dataToSave.listImageUrl || dataToSave.listImage || null},
          ${JSON.stringify(dataToSave.highlightImageUrls || [])}::jsonb,
          ${JSON.stringify(dataToSave.speakersData || [])}::jsonb,
          ${dataToSave.registrationLimit || 0}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          event_date = EXCLUDED.event_date,
          location = EXCLUDED.location,
          mode = EXCLUDED.mode,
          banner_image = EXCLUDED.banner_image,
          list_image = EXCLUDED.list_image,
          highlight_images = EXCLUDED.highlight_images,
          speakers = EXCLUDED.speakers,
          seat_limits = EXCLUDED.seat_limits,
          updated_at = NOW()
      `;
      return;
    }
    const finalData = {
      ...dataToSave,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'events', docId), finalData);
  }

  static async updateEventDoc(id: string, dataToUpdate: any) {
    if (process.env.DATA_PROVIDER === 'new') {
      await sql`
        UPDATE events
        SET title = COALESCE(${dataToUpdate.title || null}, title),
            description = COALESCE(${dataToUpdate.description || null}, description),
            event_date = COALESCE(${dataToUpdate.date ? new Date(dataToUpdate.date) : null}, event_date),
            location = COALESCE(${dataToUpdate.venue || dataToUpdate.location || null}, location),
            banner_image = COALESCE(${dataToUpdate.bannerImageUrl || dataToUpdate.bannerImage || null}, banner_image),
            list_image = COALESCE(${dataToUpdate.listImageUrl || dataToUpdate.listImage || null}, list_image),
            updated_at = NOW()
        WHERE id = ${id}
      `;
      return;
    }
    const eventDocRef = doc(db, 'events', id);
    const finalData = { ...dataToUpdate };
    if (finalData.seatLimits === null || finalData.seatLimits === undefined) {
      finalData.seatLimits = deleteField();
    }
    await updateDoc(eventDocRef, finalData);
  }

  static async deleteEventDoc(id: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      await sql`DELETE FROM events WHERE id = ${id}`;
      return;
    }
    await deleteDoc(doc(db, 'events', id));
  }

  static async getEventsList() {
    if (process.env.DATA_PROVIDER === 'new') {
      const rows = await sql`SELECT * FROM events ORDER BY event_date DESC`;
      return rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        venue: r.location,
        location: r.location,
        date: r.event_date ? new Date(r.event_date).toISOString() : new Date().toISOString(),
        bannerImage: r.banner_image,
        bannerImageUrl: r.banner_image,
        listImage: r.list_image,
        listImageUrl: r.list_image,
        highlightImages: r.highlight_images || [],
        speakers: r.speakers || [],
        seatLimits: r.seat_limits,
        registrationLimit: r.seat_limits,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    }

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
    if (process.env.DATA_PROVIDER === 'new') {
      const [row] = await sql`SELECT * FROM events WHERE id = ${id} LIMIT 1`;
      return {
        exists: () => !!row,
        id: row?.id,
        data: () => row ? ({
          id: row.id,
          title: row.title,
          description: row.description,
          date: row.event_date,
          venue: row.location,
          location: row.location,
          bannerImageUrl: row.banner_image,
          listImageUrl: row.list_image,
          highlightImages: row.highlight_images || [],
          speakers: row.speakers || [],
          seatLimits: row.seat_limits,
          createdAt: row.created_at,
        }) : undefined,
      } as any;
    }
    return await getDoc(doc(db, 'events', id));
  }

  static async getEventRegistrationsCount(eventId: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const [row] = await sql`SELECT COUNT(*)::int as count FROM event_registrations WHERE event_id = ${eventId}`;
      return row?.count || 0;
    }
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const registrationsSnapshot = await getCountFromServer(registrationsRef);
    return registrationsSnapshot.data().count;
  }

  static async checkUserRegistration(eventId: string, userId: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const res = await sql`SELECT 1 FROM event_registrations WHERE event_id = ${eventId} AND user_id = ${userId} LIMIT 1`;
      return res.length > 0;
    }
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const userQuery = query(registrationsRef, where("userId", "==", userId));
    const userSnapshot = await getDocs(userQuery);
    return !userSnapshot.empty;
  }

  static async checkEmailRegistration(eventId: string, email: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const res = await sql`SELECT 1 FROM event_registrations WHERE event_id = ${eventId} AND user_email = ${email} LIMIT 1`;
      return res.length > 0;
    }
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const emailQuery = query(registrationsRef, where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);
    return !emailSnapshot.empty;
  }

  static async addEventRegistration(eventId: string, registrationData: any) {
    if (process.env.DATA_PROVIDER === 'new') {
      const [row] = await sql`
        INSERT INTO event_registrations (
          event_id, user_id, user_email, user_name, phone, roll_number
        ) VALUES (
          ${eventId},
          ${registrationData.userId || null},
          ${registrationData.email || registrationData.userEmail},
          ${registrationData.name || registrationData.userName},
          ${registrationData.phone || null},
          ${registrationData.rollNo || registrationData.rollNumber || null}
        )
        RETURNING *
      `;
      return { id: row.id, ...row };
    }
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    return await addDoc(registrationsRef, registrationData);
  }

  static async addUserEventRegistration(userId: string, eventId: string, userEventData: any) {
    if (process.env.DATA_PROVIDER === 'new') {
      return;
    }
    const userEventRef = doc(db, 'users', userId, 'registeredEvents', eventId);
    await setDoc(userEventRef, userEventData);
  }

  static async getEventRegistrationsList(eventId: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const rows = await sql`
        SELECT * FROM event_registrations
        WHERE event_id = ${eventId}
        ORDER BY registered_at DESC
      `;
      return rows.map(r => ({
        id: r.id,
        eventId: r.event_id,
        userId: r.user_id,
        email: r.user_email,
        name: r.user_name,
        phone: r.phone,
        rollNo: r.roll_number,
        attended: r.attended,
        registeredAt: r.registered_at,
      }));
    }
    const registrationsCol = collection(db, 'events', eventId, 'registrations');
    const q = query(registrationsCol, orderBy('registeredAt', 'desc'));
    const registrationSnapshot = await getDocs(q);
    return registrationSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
  }

  static async getEventRegistrationsDocs(eventId: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const rows = await sql`SELECT * FROM event_registrations WHERE event_id = ${eventId}`;
      const docs = rows.map(r => ({
        id: r.id,
        exists: () => true,
        data: () => ({ id: r.id, eventId: r.event_id, email: r.user_email, name: r.user_name, phone: r.phone, rollNo: r.roll_number }),
      }));
      return { docs, empty: docs.length === 0, size: docs.length } as any;
    }
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    return await getDocs(registrationsRef);
  }

  static async getBranchRegistrationsCount(eventId: string, branch: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      return 0;
    }
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const branchQuery = query(registrationsRef, where('branch', '==', branch));
    const branchCount = await getCountFromServer(branchQuery);
    return branchCount.data().count;
  }

  static async getYearRegistrationsCount(eventId: string, yearOfStudy: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      return 0;
    }
    const registrationsRef = collection(db, 'events', eventId, 'registrations');
    const yearQuery = query(registrationsRef, where('yearOfStudy', '==', yearOfStudy));
    const yearCount = await getCountFromServer(yearQuery);
    return yearCount.data().count;
  }

  static async getEventRegistration(eventId: string, registrationId: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const [row] = await sql`SELECT * FROM event_registrations WHERE event_id = ${eventId} AND id = ${registrationId} LIMIT 1`;
      return row ? { id: row.id, ...row } : null;
    }
    const registrationRef = doc(db, 'events', eventId, 'registrations', registrationId);
    const snap = await getDoc(registrationRef);
    if (snap.exists()) {
      return {
        ...snap.data(),
        id: snap.id,
      } as any;
    }
    return null;
  }

  static async updateEventRegistration(eventId: string, registrationId: string, dataToUpdate: any) {
    if (process.env.DATA_PROVIDER === 'new') {
      await sql`
        UPDATE event_registrations
        SET attended = COALESCE(${dataToUpdate.attended ?? null}, attended)
        WHERE event_id = ${eventId} AND id = ${registrationId}
      `;
      return;
    }
    const registrationRef = doc(db, 'events', eventId, 'registrations', registrationId);
    await updateDoc(registrationRef, dataToUpdate);
  }

  static async deleteEventRegistration(eventId: string, registrationId: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      await sql`DELETE FROM event_registrations WHERE event_id = ${eventId} AND id = ${registrationId}`;
      return;
    }
    const registrationRef = doc(db, 'events', eventId, 'registrations', registrationId);
    await deleteDoc(registrationRef);
  }

  static async removeUserEventRegistration(userId: string, eventId: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      return;
    }
    const userEventRef = doc(db, 'users', userId, 'registeredEvents', eventId);
    await deleteDoc(userEventRef);
  }
}
