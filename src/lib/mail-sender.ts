import nodemailer from 'nodemailer';

/**
 * Sends an email using Nodemailer with the GMAIL credentials from environment variables.
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML body content
 */
export async function sendEmailDirect(to: string, subject: string, html: string): Promise<boolean> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.warn(`[Mail Sender] Skipping email to ${to} because GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment variables.`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"MLSC Platform" <${gmailUser}>`,
      to,
      subject,
      html,
    });

    console.log(`[Mail Sender] Email successfully sent to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Mail Sender] Failed to send email to ${to}:`, error);
    return false;
  }
}
