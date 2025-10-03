
'use server';

import nodemailer from 'nodemailer';
import type { EventReminderEmailInput } from '@/app/actions';


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

  const subject = `Reminder: ${eventName} is tomorrow!`;
  const htmlBody = `
  <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <div style="background-color: #0056b3; height: 6px;"></div>
    <div style="padding: 20px;">
      <h2 style="color: #222; font-size: 20px; font-weight: 600;">Hi ${name},</h2>
      <p style="font-size: 16px;">
        This is a friendly reminder that the event, <strong>${eventName}</strong>, is happening soon!
      </p>
      <div style="background-color: #f1f5f9; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Event Details:</strong></p>
        <p style="margin: 0;"><strong>Event:</strong> ${eventName}</p>
        <p style="margin: 0;"><strong>Date:</strong> ${eventDate}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${eventTime}</p>
        <p style="margin: 0;"><strong>Venue:</strong> ${eventVenue}</p>
      </div>
      ${eventLink ? `
      <div style="text-align: center; margin: 30px 0;">
        <p>If you haven't already, please join the event group or save the meeting link:</p>
        <a href="${eventLink}" target="_blank" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Access Event Link</a>
      </div>
      ` : ''}
      <p>We are excited to see you there and hope you have a great time.</p>
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
    console.log(`Successfully sent event reminder email to ${email}`);
  } catch (error) {
    console.error(`Failed to send event reminder email to ${email}:`, error);
  }
}
