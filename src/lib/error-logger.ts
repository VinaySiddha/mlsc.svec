import { logErrorAction } from '@/app/actions/log-actions';

/**
 * Logs a client-side or render error into the centralized Firestore logs.
 * This is safe to call from any client component or utility.
 * 
 * @param message - High-level error summary
 * @param error - The actual error object or details
 * @param componentName - Name of the component or page where the error occurred
 * @param email - Email of the active user (if authenticated)
 * @param userName - Name/Username of the active user (optional)
 */
export async function logClientError(
  message: string, 
  error: any, 
  componentName = 'Client Component', 
  email = 'unknown',
  userName?: string
) {
  console.error(`[System Error Logged - ${componentName}]:`, error);
  try {
    const errorDetails = error?.stack || error?.message || String(error);
    const validEmail = (email && email !== 'unknown' && email !== 'anonymous') ? email : undefined;
    const validName = (userName && userName !== 'unknown' && userName !== 'anonymous') 
      ? userName 
      : (validEmail ? validEmail.split('@')[0] : undefined);

    await logErrorAction(
      `[${componentName}] ${message}`,
      errorDetails,
      validEmail,
      validName,
      validEmail,
      { email: validEmail, component: componentName }
    );
  } catch (logErr) {
    console.error('Centralized error logging failed:', logErr);
  }
}
