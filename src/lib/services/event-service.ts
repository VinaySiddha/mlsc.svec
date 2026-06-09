import { uploadFile } from '@/lib/storage';
import { sendEventConfirmationEmail, EventConfirmationEmailInput } from '@/ai/flows/send-event-confirmation-email';
import { sendEventReminderEmail, EventReminderEmailInput } from '@/ai/flows/send-event-reminder-email';
import { sendFeedbackEmail, EventFeedbackEmailInput } from '@/ai/flows/send-feedback-email';
import { broadcastEmail } from '@/lib/email-broadcast';
import { eventAnnouncementTemplate } from '@/lib/email-templates/event-announcement';
import { EventDb } from '@/lib/db/event-db';

export class EventService {
  static async createEvent(data: {
    title: string;
    description?: string;
    date: Date;
    time: string;
    venue: string;
    registrationOpen: boolean;
    registrationDeadline?: Date;
    registrationLimit?: number;
    feedbackLink?: string;
    eventLink?: string;
    bannerImageFile: File | null;
    listImageFile: File | null;
    highlightImageFiles: File[];
    speakersData: any[];
    timelineData: any[];
    seatLimits: any;
    notifyUsers: boolean;
  }) {
    const docId = EventDb.generateEventId();
    let bannerImageUrl = '';
    let listImageUrl = '';
    let highlightImageUrls: string[] = [];

    try {
      if (data.bannerImageFile && data.bannerImageFile.size > 0) {
        bannerImageUrl = await uploadFile(data.bannerImageFile, `events/${docId}/banner`);
      }
      if (data.listImageFile && data.listImageFile.size > 0) {
        listImageUrl = await uploadFile(data.listImageFile, `events/${docId}/list`);
      }
      if (data.highlightImageFiles.length > 0 && data.highlightImageFiles[0].size > 0) {
        highlightImageUrls = await Promise.all(
          data.highlightImageFiles.map((file, i) => uploadFile(file, `events/${docId}/highlight_${i}`))
        );
      }
      for (let i = 0; i < data.speakersData.length; i++) {
        if (data.speakersData[i].imageFile && data.speakersData[i].imageFile.size > 0) {
          data.speakersData[i].image = await uploadFile(data.speakersData[i].imageFile, `events/${docId}/speaker_${i}`);
        }
        delete data.speakersData[i].imageFile; // Clean up before saving
      }
    } catch (storageError: any) {
      if (storageError.code === 'storage/unauthorized') {
        throw new Error("Permission denied: Cannot upload images to Firebase Storage. Please grant the 'Storage Object Admin' role to the service account.");
      }
      throw storageError;
    }

    const dataToSave: any = {
      title: data.title,
      description: data.description || '',
      date: data.date,
      time: data.time,
      venue: data.venue,
      registrationOpen: data.registrationOpen,
      registrationDeadline: data.registrationDeadline || null,
      registrationLimit: data.registrationLimit || 0,
      feedbackLink: data.feedbackLink || '',
      eventLink: data.eventLink || '',
      speakers: data.speakersData,
      timeline: data.timelineData,
      bannerImage: bannerImageUrl,
      listImage: listImageUrl,
      highlightImages: highlightImageUrls,
    };
    if (data.seatLimits) dataToSave.seatLimits = data.seatLimits;

    await EventDb.saveEvent(docId, dataToSave);

    if (data.notifyUsers) {
      const eventDate = data.date instanceof Date
        ? data.date.toLocaleDateString()
        : String(data.date);
      const { subject, html } = eventAnnouncementTemplate(
        data.title,
        eventDate,
        data.description || ''
      );
      broadcastEmail(subject, html).catch(() => {});
    }

    return docId;
  }

  static async updateEvent(id: string, data: {
    title: string;
    description?: string;
    date: Date;
    time: string;
    venue: string;
    registrationOpen: boolean;
    registrationDeadline?: Date;
    registrationLimit?: number;
    feedbackLink?: string;
    eventLink?: string;
    bannerImageFile: File | null;
    listImageFile: File | null;
    highlightImageFiles: File[];
    speakersData: any[];
    timelineData: any[];
    seatLimits: any;
  }) {
    const dataToUpdate: any = {
      title: data.title,
      description: data.description || '',
      date: data.date,
      time: data.time,
      venue: data.venue,
      registrationOpen: data.registrationOpen,
      registrationDeadline: data.registrationDeadline || null,
      registrationLimit: data.registrationLimit || 0,
      feedbackLink: data.feedbackLink || '',
      eventLink: data.eventLink || '',
    };

    try {
      if (data.bannerImageFile && data.bannerImageFile.size > 0) {
        dataToUpdate.bannerImage = await uploadFile(data.bannerImageFile, `events/${id}/banner`);
      }
      if (data.listImageFile && data.listImageFile.size > 0) {
        dataToUpdate.listImage = await uploadFile(data.listImageFile, `events/${id}/list`);
      }
      if (data.highlightImageFiles.length > 0 && data.highlightImageFiles[0].size > 0) {
        dataToUpdate.highlightImages = await Promise.all(
          data.highlightImageFiles.map((file, i) => uploadFile(file, `events/${id}/highlight_${i}`))
        );
      }
      for (let i = 0; i < data.speakersData.length; i++) {
        if (data.speakersData[i].imageFile && data.speakersData[i].imageFile.size > 0) {
          data.speakersData[i].image = await uploadFile(data.speakersData[i].imageFile, `events/${id}/speaker_${i}`);
        }
        delete data.speakersData[i].imageFile;
      }
    } catch (storageError: any) {
      if (storageError.code === 'storage/unauthorized') {
        throw new Error("Permission denied: Cannot upload images to Firebase Storage. Please grant the 'Storage Object Admin' role to the service account.");
      }
      throw storageError;
    }

    dataToUpdate.speakers = data.speakersData;
    dataToUpdate.timeline = data.timelineData;
    dataToUpdate.seatLimits = data.seatLimits || null;

    await EventDb.updateEventDoc(id, dataToUpdate);
  }

  static async deleteEvent(id: string) {
    await EventDb.deleteEventDoc(id);
  }

  static async getRawEvents() {
    return await EventDb.getEventsList();
  }

  static async getRawEventById(id: string) {
    const eventDoc = await EventDb.getEventDoc(id);
    if (!eventDoc.exists()) {
      return null;
    }
    const registrationCount = await EventDb.getEventRegistrationsCount(id);

    const data = eventDoc.data();
    return {
      ...data,
      id: eventDoc.id,
      date: data.date.toDate().toISOString(),
      registrationDeadline: data.registrationDeadline?.toDate().toISOString() || null,
      registrationCount,
    };
  }

  static async registerForEvent(eventId: string, values: any, userId?: string) {
    const eventDoc = await EventDb.getEventDoc(eventId);

    if (!eventDoc.exists()) {
      return { error: 'Event not found.' };
    }

    const eventData = eventDoc.data();

    if (!eventData.registrationOpen) {
      return { error: 'Registrations for this event are currently closed.' };
    }

    const deadline = eventData.registrationDeadline?.toDate();
    if (deadline && new Date() > deadline) {
      return { error: 'The registration deadline for this event has passed.' };
    }

    if (eventData.registrationLimit && eventData.registrationLimit > 0) {
      const regCount = await EventDb.getEventRegistrationsCount(eventId);
      if (regCount >= eventData.registrationLimit) {
        return { error: 'Sorry, this event has reached its registration limit.' };
      }
    }

    if (eventData.seatLimits) {
      const { branch: branchLimits, year: yearLimits } = eventData.seatLimits;

      if (branchLimits?.[values.branch]) {
        const branchCount = await EventDb.getBranchRegistrationsCount(eventId, values.branch);
        if (branchCount >= branchLimits[values.branch]) {
          return { error: `Sorry, the seat limit for ${values.branch} branch has been reached.` };
        }
      }

      if (yearLimits?.[values.yearOfStudy]) {
        const yearCount = await EventDb.getYearRegistrationsCount(eventId, values.yearOfStudy);
        if (yearCount >= yearLimits[values.yearOfStudy]) {
          return { error: `Sorry, the seat limit for ${values.yearOfStudy} year students has been reached.` };
        }
      }
    }

    if (userId) {
      const alreadyRegistered = await EventDb.checkUserRegistration(eventId, userId);
      if (alreadyRegistered) {
        return { error: 'You are already registered for this event.' };
      }
    }

    const emailAlreadyRegistered = await EventDb.checkEmailRegistration(eventId, values.email);
    if (emailAlreadyRegistered) {
      return { error: 'This email is already registered for this event.' };
    }

    const registrationData = {
      ...values,
      ...(userId && { userId }),
      registeredAt: new Date().toISOString(),
    };

    await EventDb.addEventRegistration(eventId, registrationData);

    if (userId) {
      await EventDb.addUserEventRegistration(userId, eventId, {
        eventId,
        eventTitle: eventData.title,
        eventDate: eventData.date.toDate().toISOString(),
        registeredAt: new Date().toISOString(),
      });
    }

    const emailInput: EventConfirmationEmailInput = {
      name: values.name,
      email: values.email,
      eventName: eventData.title,
      eventDate: eventData.date.toDate().toLocaleDateString(),
      eventLink: eventData.eventLink || undefined,
    };
    await sendEventConfirmationEmail(emailInput);

    return { success: true };
  }

  static async sendReminderEmails(eventId: string) {
    const eventDoc = await EventDb.getEventDoc(eventId);

    if (!eventDoc.exists()) {
      return { error: "Event not found." };
    }

    const eventData = eventDoc.data();
    const registrationsSnapshot = await EventDb.getEventRegistrationsDocs(eventId);

    if (registrationsSnapshot.empty) {
      return { success: true, count: 0 };
    }

    let sentCount = 0;
    for (const registrationDoc of registrationsSnapshot.docs) {
      const registration = registrationDoc.data();
      try {
        const emailInput: EventReminderEmailInput = {
          name: registration.name,
          email: registration.email,
          eventName: eventData.title,
          eventDate: eventData.date.toDate().toLocaleDateString(),
          eventTime: eventData.time,
          eventVenue: eventData.venue,
          eventLink: eventData.eventLink || undefined,
        };
        await sendEventReminderEmail(emailInput);
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send reminder to ${registration.email}:`, emailError);
      }
    }

    return { success: true, count: sentCount };
  }

  static async sendFeedbackEmails(eventId: string) {
    const eventDoc = await EventDb.getEventDoc(eventId);

    if (!eventDoc.exists()) {
      return { error: "Event not found." };
    }

    const eventData = eventDoc.data();
    if (!eventData.feedbackLink) {
      return { error: "No feedback link is set for this event." };
    }

    const registrationsSnapshot = await EventDb.getEventRegistrationsDocs(eventId);

    if (registrationsSnapshot.empty) {
      return { success: true, count: 0 };
    }

    let sentCount = 0;
    for (const registrationDoc of registrationsSnapshot.docs) {
      const registration = registrationDoc.data();
      try {
        const emailInput: EventFeedbackEmailInput = {
          name: registration.name,
          email: registration.email,
          eventName: eventData.title,
          feedbackLink: eventData.feedbackLink,
        };
        await sendFeedbackEmail(emailInput);
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send feedback email to ${registration.email}:`, emailError);
      }
    }

    return { success: true, count: sentCount };
  }

  static async getEventRegistrations(eventId: string) {
    return await EventDb.getEventRegistrationsList(eventId);
  }
}
