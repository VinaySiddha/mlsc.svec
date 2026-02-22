import { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { sendInvitationEmail, InvitationEmailInput } from '@/ai/flows/send-invitation-email';

const teamMemberSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('A valid email is required.'),
  role: z.string().min(2, 'Role is required.'),
  categoryId: z.string({ required_error: 'Please select a category.' }),
});

export async function POST(req: NextRequest) {
  try {
    // Get user role from headers (set by middleware)
    const userRole = req.headers.get('X-User-Role');

    // Only admin can invite team members
    if (userRole !== 'admin') {
      return errorResponse('Unauthorized', 403, 'ERROR_FORBIDDEN');
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = teamMemberSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid data provided',
        400,
        'ERROR_VALIDATION',
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { email, name, role, categoryId } = parsed.data;

    // Check if member with this email already exists
    const q = query(collection(db, 'teamMembers'), where('email', '==', email));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return errorResponse(
        'A team member with this email already exists',
        409,
        'ERROR_DUPLICATE_EMAIL'
      );
    }

    // Generate onboarding token
    const onboardingToken = randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newMemberData = {
      ...parsed.data,
      status: 'pending',
      onboardingToken,
      tokenExpiresAt: tokenExpiresAt.toISOString(),
      image: '', // To be filled by the user during onboarding
      linkedin: '', // To be filled by the user during onboarding
    };

    await addDoc(collection(db, 'teamMembers'), newMemberData);

    // Send invitation email in background
    (async () => {
      try {
        const emailInput: InvitationEmailInput = {
          name,
          email,
          role,
          onboardingToken,
        };
        await sendInvitationEmail(emailInput);
      } catch (emailError) {
        console.error(`Invitation email sending failed for ${email}:`, emailError);
      }
    })();

    return successResponse(
      null,
      'Team member invited successfully',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
