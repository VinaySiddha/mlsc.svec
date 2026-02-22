import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { errorResponse } from './response';

/**
 * Handle errors and return standardized error responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return errorResponse(
      'Validation failed',
      400,
      'ERROR_VALIDATION',
      error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  // Standard Error objects
  if (error instanceof Error) {
    return errorResponse(error.message, 500, 'ERROR_SERVER');
  }

  // Unknown errors
  return errorResponse(
    'An unexpected error occurred',
    500,
    'ERROR_UNKNOWN'
  );
}
