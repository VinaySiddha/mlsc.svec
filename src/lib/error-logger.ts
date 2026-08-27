import { logErrorAction } from '@/app/actions/log-actions';

/**
 * Logs a client-side or render error into the centralized Firestore logs.
 * This is safe to call from any client component or utility.
 * 
 * @param message - High-level error summary
 * @param error - The actual error object or details
 * @param componentName - Name of the component or page where the error occurred
 * @param email - Email of the active user (if authenticated)
 */
export async function logClientError(
  message: string, 
  error: any, 
  componentName = 'Client Component', 
  email = 'unknown'
) {
  console.error(`[System Error Logged - ${componentName}]:`, error);
  try {
    const errorDetails = error?.stack || error?.message || String(error);
    await logErrorAction(
      `[Client] ${message}`,
      errorDetails,
      undefined, // ID will be resolved from email context
      componentName,
      { email, userEmail: email }
    );
  } catch (logErr) {
    console.error('Centralized error logging failed:', logErr);
  }
}
