
'use server';

import nodemailer from 'nodemailer';
import { buildEmailHtml, emailInfoBox, emailDetailRow, emailSignature } from '@/lib/email-base';

export interface EventReminderEmailInput {
  name: string;
  email: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventLink?: string;
}

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Event reminder emails will not be sent.");
}

export async function sendEventReminderEmail(input: EventReminderEmailInput): Promise<void> {
  const { name, email, eventName, eventDate, eventTime, eventVenue, eventLink } = input;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping event reminder email to ${email} because GMAIL credentials are not configured.`);
    return;
  }

  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
      },
  });

  const subject = `Reminder: ${eventName} is Tomorrow! ⏰`;

  const detailsTable = `
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        ${emailDetailRow('Event', eventName)}
        ${emailDetailRow('Date', eventDate)}
        ${emailDetailRow('Time', eventTime)}
        ${emailDetailRow('Venue', eventVenue)}
      </tbody>
    </table>`;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello <strong>${name}</strong>,</p>
    <p style="margin:0 0 20px 0;">
      This is a friendly reminder that <strong>${eventName}</strong> is happening soon. Make sure you're prepared and on time!
    </p>
    ${emailInfoBox(`
      <p style="margin:0 0 12px 0;font-family:'Google Sans',Arial,sans-serif;font-size:11px;font-weight:500;color:#5f6368;letter-spacing:1.5px;text-transform:uppercase;">Event Details</p>
      ${detailsTable}
    `)}
    ${eventLink ? `
    <p style="margin:0 0 16px 0;">If you haven't already, please join the event group or save the meeting link:</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
      <tr>
        <td align="center" bgcolor="#25D366" style="border-radius:6px;padding:10px 20px;">
          <a href="${eventLink}" target="_blank"
            style="font-size:14px;font-family:'Google Sans',Arial,sans-serif;
              color:#ffffff;text-decoration:none;font-weight:500;display:inline-block;">
            Join Event Group →
          </a>
        </td>
      </tr>
    </table>` : ''}
    <p style="margin:0 0 24px 0;">We are excited to see you there and hope you have a great time.</p>
    ${emailSignature('MLSC Events Team')}
  `;

  const htmlBody = buildEmailHtml({
    eyebrow: '#MLSC4.0 · Event Reminder',
    headline: `${eventName} is Tomorrow! ⏰`,
    ctaLabel: eventLink ? 'Access Event Link →' : undefined,
    ctaUrl: eventLink,
    accentColor: '#4285F4',
    bodyHtml,
  });

  const mailOptions = {
      from: `"MLSC Events" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html: htmlBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent event reminder email to ${email}`);
  } catch (error) {
    console.error(`Failed to send event reminder email to ${email}:`, error);
  }
}
