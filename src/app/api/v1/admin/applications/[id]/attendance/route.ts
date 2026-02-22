import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const attendanceSchema = z.object({
  attended: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user role from headers (set by middleware)
    const userRole = req.headers.get('X-User-Role');

    if (!userRole || (userRole !== 'admin' && userRole !== 'panel')) {
      return errorResponse('Unauthorized', 403, 'ERROR_FORBIDDEN');
    }

    const { id } = params; // This is the Firestore document ID

    // Parse and validate request body
    const body = await req.json();
    const parsed = attendanceSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid attendance data',
        400,
        'ERROR_VALIDATION',
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Update attendance
    const appDocRef = doc(db, 'applications', id);
    await updateDoc(appDocRef, {
      interviewAttended: parsed.data.attended,
    });

    return successResponse(
      null,
      'Attendance updated successfully',
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
