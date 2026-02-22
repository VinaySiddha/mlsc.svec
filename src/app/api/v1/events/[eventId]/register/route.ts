import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { checkRateLimit, getClientIdentifier } from '@/lib/api/rate-limiter';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, getCountFromServer } from 'firebase/firestore';
import { sendEventConfirmationEmail } from '@/ai/flows/send-event-confirmation-email';

const registrationSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  rollNo: z.string().min(1, 'Roll number is required.'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  branch: z.string({ required_error: 'Please select your branch.' }),
  yearOfStudy: z.string({ required_error: 'Please select your year of study.' }),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;

    // Rate limiting: 10 requests per minute per IP
    const clientId = getClientIdentifier(req);
    if (!checkRateLimit(`event-register:${clientId}`, 10, 60000)) {
      return errorResponse(
        'Too many requests. Please try again later.',
        429,
        'ERROR_RATE_LIMIT'
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid registration data',
        400,
        'ERROR_VALIDATION',
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Check if event exists
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return errorResponse('Event not found', 404, 'ERROR_NOT_FOUND');
    }

    const eventData = eventSnap.data();

    // Check if registrations are open
    if (!eventData.registrationOpen) {
      return errorResponse(
        'Registrations for this event are currently closed',
        400,
        'ERROR_REGISTRATION_CLOSED'
      );
    }

    // Check registration deadline
    const deadline = eventData.registrationDeadline?.toDate();
    if (deadline && new Date() > deadline) {
      return errorResponse(
        'The registration deadline for this event has passed',
        400,
        'ERROR_DEADLINE_PASSED'
      );
    }

    const registrationsRef = collection(db, 'events', eventId, 'registrations');

    // Check registration limit
    if (eventData.registrationLimit && eventData.registrationLimit > 0) {
      const registrationsSnapshot = await getCountFromServer(registrationsRef);
      if (registrationsSnapshot.data().count >= eventData.registrationLimit) {
        return errorResponse(
          'Sorry, this event has reached its registration limit',
          400,
          'ERROR_LIMIT_REACHED'
        );
      }
    }

    // Check for duplicate email
    const emailQuery = query(registrationsRef, where('email', '==', parsed.data.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return errorResponse(
        'This email is already registered for this event',
        409,
        'ERROR_DUPLICATE_EMAIL'
      );
    }

    // Create registration
    await addDoc(registrationsRef, {
      ...parsed.data,
      registeredAt: new Date().toISOString(),
    });

    // Send confirmation email in background
    (async () => {
      try {
        await sendEventConfirmationEmail({
          name: parsed.data.name,
          email: parsed.data.email,
          eventName: eventData.title,
          eventDate: eventData.date.toDate().toLocaleDateString(),
          eventLink: eventData.eventLink || undefined,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    })();

    return successResponse(
      null,
      'Registration successful',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
