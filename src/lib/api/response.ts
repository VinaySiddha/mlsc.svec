import { NextResponse } from 'next/server';

export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

/**
 * Create a standardized success response
 */
export function successResponse<T = any>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: string,
  status: number = 400,
  code?: string,
  details?: Record<string, string[]>
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code && { code }),
      ...(details && { details }),
    },
    { status }
  );
}
