import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { checkRateLimit, getClientIdentifier } from '@/lib/api/rate-limiter';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { summarizeResume, SummarizeResumeInput } from '@/ai/flows/summarize-resume';
import { sendConfirmationEmail } from '@/ai/flows/send-confirmation-email';

// Application schema validation
const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  rollNo: z.string().min(1, 'Roll number is required.'),
  branch: z.string({ required_error: 'Please select your branch.' }),
  section: z.string({ required_error: 'Please select your section.' }),
  yearOfStudy: z.string({ required_error: 'Please select your year of study.' }),
  cgpa: z.string().min(1, 'CGPA is required.'),
  backlogs: z.string().min(1, 'Number of backlogs is required.'),
  joinReason: z.string().min(20, 'Please tell us why you want to join.'),
  aboutClub: z.string().min(20, 'Please tell us what you know about the club.'),
  technicalDomain: z.string({ required_error: 'Please select a technical domain.' }).min(1),
  nonTechnicalDomain: z.string({ required_error: 'Please select a non-technical domain.' }).min(1),
  linkedin: z.string().url('Please enter a valid LinkedIn URL.').optional().or(z.literal('')),
  anythingElse: z.string().optional(),
});

function generateReferenceId() {
  const prefix = 'MLSC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const clientId = getClientIdentifier(req);
    if (!checkRateLimit(`applications:${clientId}`, 10, 60000)) {
      return errorResponse(
        'Too many requests. Please try again later.',
        429,
        'ERROR_RATE_LIMIT'
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('resume') as File | null;

    // Extract form fields
    const values: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'resume') {
        values[key] = value;
      }
    }

    // Validate form data
    const parsed = applicationSchema.safeParse(values);

    if (!parsed.success) {
      return errorResponse(
        'Invalid form data. Please check your inputs.',
        400,
        'ERROR_VALIDATION',
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Validate resume file if provided
    if (file && file.size > 0) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(
          'Resume file must be under 5MB',
          413,
          'ERROR_FILE_TOO_LARGE'
        );
      }

      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return errorResponse(
          'Resume must be a PDF file',
          400,
          'ERROR_INVALID_FILE_TYPE'
        );
      }
    }

    const applicationData = parsed.data;
    const referenceId = generateReferenceId();

    // Check for duplicates
    const applicationsRef = collection(db, 'applications');
    const rollNo_lowercase = applicationData.rollNo.toLowerCase();
    const name_lowercase = applicationData.name.toLowerCase();

    // Check for existing email
    const emailQuery = query(applicationsRef, where('email', '==', applicationData.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return errorResponse(
        'An application with this email address already exists.',
        409,
        'ERROR_DUPLICATE_EMAIL'
      );
    }

    // Check for existing roll number
    const rollNoQuery = query(applicationsRef, where('rollNo_lowercase', '==', rollNo_lowercase));
    const rollNoSnapshot = await getDocs(rollNoQuery);
    if (!rollNoSnapshot.empty) {
      return errorResponse(
        'An application with this roll number already exists.',
        409,
        'ERROR_DUPLICATE_ROLLNO'
      );
    }

    // Create application document
    const newApplication = {
      id: referenceId,
      submittedAt: new Date().toISOString(),
      ...applicationData,
      rollNo_lowercase,
      name_lowercase,
      linkedin: applicationData.linkedin || '',
      anythingElse: applicationData.anythingElse || '',
      resumeSummary: null,
      status: 'Received',
      isRecommended: false,
      interviewAttended: false,
      suitability: {
        technical: 'undecided',
        nonTechnical: 'undecided',
      },
      ratings: {
        communication: 0,
        technical: 0,
        problemSolving: 0,
        teamFit: 0,
        overall: 0,
      },
      remarks: '',
    };

    // Save application to Firestore
    const docRef = await addDoc(applicationsRef, { ...newApplication });
    await updateDoc(docRef, { firestoreId: docRef.id });

    // Send confirmation email in background (fire and forget)
    (async () => {
      try {
        await sendConfirmationEmail({
          name: newApplication.name,
          email: newApplication.email,
          referenceId,
        });
      } catch (emailError) {
        console.error(`Email sending failed for ${referenceId}:`, emailError);
      }
    })();

    // Process resume if provided
    let summaryResult = null;
    if (file && file.size > 0) {
      try {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const resumeDataUri = `data:${file.type};base64,${base64}`;

        const summarizationInput: SummarizeResumeInput = { resumeDataURI: resumeDataUri };
        const result = await summarizeResume(summarizationInput);

        await updateDoc(docRef, { resumeSummary: result.summary });
        summaryResult = result.summary;
        console.log(`Successfully generated summary for ${referenceId}`);
      } catch (aiError) {
        console.error(`AI summarization failed for ${referenceId}:`, aiError);
        summaryResult = "AI summary generation failed. We'll process your resume manually.";
        await updateDoc(docRef, { resumeSummary: 'AI summary failed.' });
      }
    }

    return successResponse(
      {
        referenceId,
        summary: summaryResult,
      },
      'Application submitted successfully',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// GET endpoint to retrieve application by reference ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get('referenceId');

    if (!referenceId) {
      return errorResponse('Reference ID is required', 400, 'ERROR_MISSING_PARAM');
    }

    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('id', '==', referenceId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return errorResponse('Application not found', 404, 'ERROR_NOT_FOUND');
    }

    const applicationDoc = snapshot.docs[0];
    const application = {
      firestoreId: applicationDoc.id,
      ...applicationDoc.data(),
    };

    return successResponse({ application });
  } catch (error) {
    return handleApiError(error);
  }
}
