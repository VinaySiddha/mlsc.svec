'use server';

import { unstable_cache, revalidateTag } from 'next/cache';
import papaparse from 'papaparse';
import { EventService } from '@/lib/services/event-service';
import { NotificationService } from '@/lib/services/notification-service';
import { eventFormSchema, registrationSchema } from '@/schemas/event';
import { logActivityAction, logErrorAction } from './log-actions';

export async function createEvent(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const bannerImageFile = formData.get('bannerImage') as File | null;
  const listImageFile = formData.get('listImage') as File | null;
  const highlightImageFiles = formData.getAll('highlightImages') as File[];

  const parsed = eventFormSchema.omit({ bannerImage: true, listImage: true, highlightImages: true, speakers: true, timeline: true }).safeParse({
    ...values,
    date: new Date(values.date as string),
    registrationDeadline: values.registrationDeadline ? new Date(values.registrationDeadline as string) : undefined,
    registrationOpen: values.registrationOpen === 'true',
    registrationLimit: values.registrationLimit ? parseInt(values.registrationLimit as string, 10) : 0,
  });

  if (!parsed.success) {
    console.error("Event form validation failed:", parsed.error.flatten().fieldErrors);
    return { error: 'Invalid event data.' };
  }

  try {
    const speakersData = JSON.parse(values.speakers as string || '[]');
    const timelineData = JSON.parse(values.timeline as string || '[]');
    const seatLimits = values.seatLimits ? JSON.parse(values.seatLimits as string) : undefined;

    for (let i = 0; i < speakersData.length; i++) {
      const speakerImageFile = formData.get(`speaker_image_${i}`) as File | null;
      if (speakerImageFile && speakerImageFile.size > 0) {
        speakersData[i].imageFile = speakerImageFile;
      }
    }

    const docId = await EventService.createEvent({
      ...parsed.data,
      bannerImageFile,
      listImageFile,
      highlightImageFiles,
      speakersData,
      timelineData,
      seatLimits,
      notifyUsers: values.notifyUsers === 'true',
    });

    // Log real-time system activity
    await logActivityAction(
      `Event Created`,
      `Admin created event "${parsed.data.title}" scheduled for ${parsed.data.date.toLocaleDateString("en-IN")} at ${parsed.data.venue}. ID: ${docId}`,
      undefined,
      "Admin"
    );

    try {
      const eventDateStr = parsed.data.date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const announceMessage = `🚀 New Event: "${parsed.data.title}" has been scheduled for ${eventDateStr} at ${parsed.data.venue}! Check the Event Calendar to register.`;
      await NotificationService.addNotification(announceMessage);
    } catch (notifErr) {
      console.error("Failed to automatically add notification for new event:", notifErr);
    }

    revalidateTag('events', 'max');
    return { success: true, id: docId };
  } catch (error: any) {
    console.error("Failed to create event:", error);
    await logErrorAction(
      `Event Creation Failed`,
      `Failed to create event "${parsed.data?.title || "Unknown"}". Error: ${error.message || error}`
    );
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Failed to create event: ${message}` };
  }
}


export async function updateEvent(id: string, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const bannerImageFile = formData.get('bannerImage') as File | null;
  const listImageFile = formData.get('listImage') as File | null;
  const highlightImageFiles = formData.getAll('highlightImages') as File[];

  const parsed = eventFormSchema.omit({ bannerImage: true, listImage: true, highlightImages: true, speakers: true, timeline: true }).safeParse({
    ...values,
    date: new Date(values.date as string),
    registrationDeadline: values.registrationDeadline ? new Date(values.registrationDeadline as string) : undefined,
    registrationOpen: values.registrationOpen === 'true',
    registrationLimit: values.registrationLimit ? parseInt(values.registrationLimit as string, 10) : 0,
  });

  if (!parsed.success) {
    console.error("Event form validation failed:", parsed.error.flatten().fieldErrors);
    return { error: 'Invalid event data.' };
  }

  try {
    const speakersData = JSON.parse(values.speakers as string || '[]');
    const timelineData = JSON.parse(values.timeline as string || '[]');
    const seatLimits = values.seatLimits ? JSON.parse(values.seatLimits as string) : null;

    for (let i = 0; i < speakersData.length; i++) {
      const speakerImageFile = formData.get(`speaker_image_${i}`) as File | null;
      if (speakerImageFile && speakerImageFile.size > 0) {
        speakersData[i].imageFile = speakerImageFile;
      }
    }

    await EventService.updateEvent(id, {
      ...parsed.data,
      bannerImageFile,
      listImageFile,
      highlightImageFiles,
      speakersData,
      timelineData,
      seatLimits,
    });

    revalidateTag('events', 'max');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update event:", error);
    await logErrorAction(
      `Event Update Failed`,
      `Failed to update event ID ${id} (${parsed.data?.title || "unknown"}). Error: ${error.message || error}`
    );
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Failed to update event: ${message}` };
  }
}

export async function deleteEvent(id: string) {
  try {
    await EventService.deleteEvent(id);
    revalidateTag('events', 'max');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete event:", error);
    await logErrorAction(
      `Event Deletion Failed`,
      `Failed to delete event ID ${id}. Error: ${error.message || error}`
    );
    return { error: 'Failed to delete event.' };
  }
}

const getCachedEvents = unstable_cache(
  async () => EventService.getRawEvents(),
  ['events-list'],
  { tags: ['events'], revalidate: 3600 }
);

export async function getEvents() {
  try {
    const eventList = await getCachedEvents();
    return { events: eventList as any[], error: null };
  } catch (error) {
    console.error("Could not fetch events:", error);
    if (error instanceof Error) {
      return { error: `Failed to fetch events: ${error.message}` };
    }
    return { error: 'An unexpected error occurred while fetching events.' };
  }
}

const getCachedEventById = unstable_cache(
  async (id: string) => EventService.getRawEventById(id),
  ['event-detail'],
  { tags: ['events'], revalidate: 3600 }
);

export async function getEventById(id: string) {
  try {
    const eventData = await getCachedEventById(id);
    if (!eventData) {
      return { error: 'Event not found.' };
    }
    return { event: eventData as any };
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    return { error: 'Failed to fetch event.' };
  }
}

export async function registerForEvent(eventId: string, values: any, userId?: string) {
  const parsed = registrationSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Invalid registration data.' };
  }

  try {
    const result = await EventService.registerForEvent(eventId, parsed.data, userId);
    if ('success' in result && result.success) {
      // Log real-time system activity
      await logActivityAction(
        `Event Registration`,
        `Student ${parsed.data.name} (${parsed.data.rollNo}) registered for event ID: ${eventId}`,
        userId,
        parsed.data.name,
        parsed.data.email,
        { eventId, branch: parsed.data.branch }
      );
    }
    return result;
  } catch (error: any) {
    console.error("Error registering for event:", error);
    await logErrorAction(
      `Event Registration Failed`,
      `Student ${parsed.data.name || "Unknown"} (${parsed.data.rollNo || "Unknown"}) failed to register for event ${eventId}. Error: ${error.message || error}`,
      userId,
      parsed.data.name
    );
    return { error: 'An unexpected error occurred during registration.' };
  }
}


export async function sendReminderEmails(eventId: string) {
  try {
    const result = await EventService.sendReminderEmails(eventId);
    return result;
  } catch (error: any) {
    console.error("Error sending reminder emails:", error);
    await logErrorAction(
      `Send Reminder Emails Failed`,
      `Failed to send reminder emails for event ID ${eventId}. Error: ${error.message || error}`
    );
    if (error instanceof Error) {
      return { error: `Failed to send reminders: ${error.message}` };
    }
    return { error: "An unexpected error occurred." };
  }
}

export async function sendFeedbackEmails(eventId: string) {
  try {
    const result = await EventService.sendFeedbackEmails(eventId);
    return result;
  } catch (error: any) {
    console.error("Error sending feedback emails:", error);
    await logErrorAction(
      `Send Feedback Emails Failed`,
      `Failed to send feedback emails for event ID ${eventId}. Error: ${error.message || error}`
    );
    if (error instanceof Error) {
      return { error: `Failed to send feedback emails: ${error.message}` };
    }
    return { error: "An unexpected error occurred." };
  }
}

export async function getEventRegistrations(eventId: string) {
  try {
    const registrations = await EventService.getEventRegistrations(eventId) as any[];
    return { registrations };
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return { error: 'Could not fetch event registrations.' };
  }
}

export async function exportEventRegistrationsToCsv(eventId: string) {
  try {
    const { registrations, error } = await getEventRegistrations(eventId);
    if (error) throw new Error(error);

    if (!registrations || registrations.length === 0) {
      return { csvData: null };
    }

    const csv = papaparse.unparse(registrations);
    return { success: true, csvData: csv };
  } catch (error: any) {
    console.error('Error exporting event registrations:', error);
    await logErrorAction(
      `Export Event Registrations Failed`,
      `Failed to export registrations for event ID ${eventId}. Error: ${error.message || error}`
    );
    if (error instanceof Error) {
      return { error: `Export failed: ${error.message}` };
    }
    return { error: 'An unexpected error occurred during export.' };
  }
}
