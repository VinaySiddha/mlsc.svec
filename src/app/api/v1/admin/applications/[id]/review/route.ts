import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, getDocs, runTransaction } from 'firebase/firestore';
import { sendStatusUpdateEmail } from '@/ai/flows/send-status-update-email';
import { Application } from '@/types';

const reviewSchema = z.object({
  status: z.string(),
  isRecommended: z.boolean(),
  suitability: z.object({
    technical: z.string().optional(),
    nonTechnical: z.string().optional(),
  }),
  ratings: z.object({
    communication: z.number().min(0).max(5),
    technical: z.number().min(0).max(5),
    problemSolving: z.number().min(0).max(5),
    teamFit: z.number().min(0).max(5),
    overall: z.number().min(0).max(5),
  }),
  remarks: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user role from headers (set by middleware)
    const userRole = req.headers.get('X-User-Role');

    if (!userRole || (userRole !== 'admin' && userRole !== 'panel')) {
      return errorResponse('Unauthorized', 403, 'ERROR_FORBIDDEN');
    }

    const { id } = params; // This is the reference ID (e.g., MLSC-123-ABC)

    // Parse and validate request body
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid review data',
        400,
        'ERROR_VALIDATION',
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    let reviewData = parsed.data;

    // Automated status update logic
    if (reviewData.isRecommended) {
      reviewData.status = 'Recommended';
    }

    // Update application using transaction
    const txResult = await runTransaction(db, async (transaction) => {
      const applicationQueryResult = await getDocs(
        query(collection(db, 'applications'), where('id', '==', id), limit(1))
      );

      if (applicationQueryResult.empty) {
        throw new Error('Application not found');
      }

      const appDocRef = applicationQueryResult.docs[0].ref;
      const appData = applicationQueryResult.docs[0].data() as Application;

      const originalStatus = appData.status;
      const applicantInfo = { name: appData.name, email: appData.email };

      transaction.update(appDocRef, {
        status: reviewData.status,
        isRecommended: reviewData.isRecommended,
        suitability: reviewData.suitability,
        ratings: reviewData.ratings,
        remarks: reviewData.remarks || '',
      });

      return { originalStatus, applicantInfo };
    });

    // Send email only if the status has changed (fire and forget)
    if (txResult.applicantInfo && reviewData.status !== txResult.originalStatus) {
      (async () => {
        try {
          await sendStatusUpdateEmail({
            name: txResult.applicantInfo.name,
            email: txResult.applicantInfo.email,
            status: reviewData.status,
          });
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      })();
    }

    return successResponse(
      null,
      'Review saved successfully',
      200
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Application not found') {
      return errorResponse('Application not found', 404, 'ERROR_NOT_FOUND');
    }
    return handleApiError(error);
  }
}
