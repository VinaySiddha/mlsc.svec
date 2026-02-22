import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateAccessToken, verifyToken } from '@/lib/jwt-utils';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const parsed = refreshSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid input',
        400,
        'ERROR_VALIDATION',
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { refreshToken } = parsed.data;

    // Verify refresh token
    let payload;
    try {
      payload = await verifyToken(refreshToken);
    } catch (error) {
      return errorResponse(
        'Invalid or expired refresh token',
        401,
        'ERROR_INVALID_TOKEN'
      );
    }

    // Check if refresh token exists and is not revoked in Firestore
    try {
      const tokensRef = collection(db, 'authTokens');
      const q = query(
        tokensRef,
        where('refreshToken', '==', refreshToken),
        where('revoked', '==', false)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return errorResponse(
          'Refresh token has been revoked or does not exist',
          401,
          'ERROR_TOKEN_REVOKED'
        );
      }

      // Check if token is expired
      const tokenDoc = snapshot.docs[0].data();
      if (tokenDoc.expiresAt && tokenDoc.expiresAt.toMillis() < Date.now()) {
        return errorResponse(
          'Refresh token has expired',
          401,
          'ERROR_TOKEN_EXPIRED'
        );
      }
    } catch (error) {
      console.error('Error checking refresh token:', error);
      // Continue anyway if Firestore check fails
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken({
      role: payload.role,
      username: payload.username,
      ...(payload.domain && { domain: payload.domain }),
    });

    return successResponse(
      {
        token: newAccessToken,
        expiresIn: 3600, // 1 hour
      },
      'Token refreshed successfully',
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
