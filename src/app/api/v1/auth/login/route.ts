import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateTokenPair } from '@/lib/jwt-utils';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { checkRateLimit, getClientIdentifier } from '@/lib/api/rate-limiter';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const SUPER_ADMIN_USERNAME = 'vinaysiddha';
const SUPER_ADMIN_PASSWORD = 'Vinay@15';

const panelCredentials = [
  { username: 'gen_ai_panel', password: 'panel@genai', domain: 'gen_ai' },
  { username: 'ds_ml_panel', password: 'panel@ds', domain: 'ds_ml' },
  { username: 'azure_panel', password: 'panel@azure', domain: 'azure' },
  { username: 'web_app_panel', password: 'panel@web', domain: 'web_app' },
];

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute for login endpoint
    const clientId = getClientIdentifier(req);
    if (!checkRateLimit(`login:${clientId}`, 5, 60000)) {
      return errorResponse(
        'Too many login attempts. Please try again later.',
        429,
        'ERROR_RATE_LIMIT'
      );
    }

    // Check JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return errorResponse(
        'Authentication service is not properly configured',
        500,
        'ERROR_CONFIG'
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid input',
        400,
        'ERROR_VALIDATION',
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { username, password } = parsed.data;

    // Validate credentials
    let userPayload: { role: 'admin' | 'panel'; domain?: string; username: string } | null = null;

    if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
      userPayload = { role: 'admin', username };
    } else {
      const panel = panelCredentials.find(
        (p) => p.username === username && p.password === password
      );
      if (panel) {
        userPayload = { role: 'panel', domain: panel.domain, username };
      }
    }

    if (!userPayload) {
      return errorResponse(
        'Invalid username or password',
        401,
        'ERROR_INVALID_CREDENTIALS'
      );
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken, expiresIn } = await generateTokenPair(userPayload);

    // Store refresh token in Firestore for validation
    try {
      await addDoc(collection(db, 'authTokens'), {
        userId: userPayload.username,
        refreshToken,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        revoked: false,
      });
    } catch (error) {
      console.error('Error storing refresh token:', error);
      // Continue anyway - token can still be used
    }

    // Return tokens in response body (not as cookies)
    return successResponse(
      {
        token: accessToken,
        refreshToken,
        expiresIn,
        user: {
          role: userPayload.role,
          username: userPayload.username,
          ...(userPayload.domain && { domain: userPayload.domain }),
        },
      },
      'Login successful',
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
