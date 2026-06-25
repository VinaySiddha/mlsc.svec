import { sendEmail } from './email';

/**
 * Sends an email using the robust, connection-cached SMTP transporter in email.ts.
 * This prevents SMTP connection pooling bottlenecks and rate-limiting failures in production.
 * 
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML body content
 */
export async function sendEmailDirect(to: string, subject: string, html: string): Promise<boolean> {
  return sendEmail({ to, subject, html });
}
