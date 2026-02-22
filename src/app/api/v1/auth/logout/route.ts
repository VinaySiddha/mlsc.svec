import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const parsed = logoutSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid input',
        400,
        'ERROR_VALIDATION',
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { refreshToken } = parsed.data;

    // Find and revoke the refresh token in Firestore
    try {
      const tokensRef = collection(db, 'authTokens');
      const q = query(
        tokensRef,
        where('refreshToken', '==', refreshToken),
        where('revoked', '==', false)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Revoke the token
        const tokenDoc = snapshot.docs[0];
        await updateDoc(tokenDoc.ref, {
          revoked: true,
          revokedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      // Continue anyway - logout should always succeed from client perspective
    }

    return successResponse(
      null,
      'Logged out successfully',
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
