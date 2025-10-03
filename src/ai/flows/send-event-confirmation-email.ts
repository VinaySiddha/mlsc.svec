
'use server';

import {z} from 'zod';
import nodemailer from 'nodemailer';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Event emails will not be sent.");
}

export const EventConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The user's name."),
  email: z.string().email().describe("The user's email address."),
  eventName: z.string().describe("The name of the event."),
  eventDate: z.string().describe("The date of the event."),
  eventLink: z.string().url().optional().describe("An optional link for the event (e.g., meeting or WhatsApp group)."),
});
export type EventConfirmationEmailInput = z.infer<typeof EventConfirmationEmailInputSchema>;

export async function sendEventConfirmationEmail(input: EventConfirmationEmailInput): Promise<void> {
  const { name, email, eventName, eventDate, eventLink } = EventConfirmationEmailInputSchema.parse(input);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping event confirmation email to ${email} because GMAIL credentials are not configured.`);
    return;
  }

  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
      },
  });

  const subject = `Confirmation for ${eventName}`;
  const htmlBody = `
  <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <div style="background-color: #0056b3; height: 6px;"></div>
    <div style="padding: 20px;">
      <h2 style="color: #222; font-size: 20px; font-weight: 600;">Hi ${name},</h2>
      <p style="font-size: 16px;">
        Thank you for registering for our event: <strong>${eventName}</strong>. We're excited to have you join us!
      </p>
      <div style="background-color: #f1f5f9; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Event Details:</strong></p>
        <p style="margin: 0;"><strong>Event:</strong> ${eventName}</p>
        <p style="margin: 0;"><strong>Date:</strong> ${eventDate}</p>
      </div>
      ${eventLink ? `
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px;">Click the button below to join the event group or access the meeting:</p>
        <a href="${eventLink}" target="_blank" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Access Event Link</a>
      </div>
      ` : ''}
      <p>We'll send you a reminder before the event. We look forward to seeing you there.</p>
      <p style="margin-top: 30px; font-weight: 500;">Best regards,<br><strong>MLSC Team</strong></p>
    </div>
  </div>
  `;
  
  const mailOptions = {
      from: `"MLSC Events" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent event confirmation email to ${email}`);
  } catch (error) {
    console.error(`Failed to send event confirmation email to ${email}:`, error);
  }
}
