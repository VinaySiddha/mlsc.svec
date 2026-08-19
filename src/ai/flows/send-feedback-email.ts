
'use server';

import nodemailer from 'nodemailer';
import { buildEmailHtml, emailSignature } from '@/lib/email-base';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Event feedback emails will not be sent.");
}

export interface EventFeedbackEmailInput {
  name: string;
  email: string;
  eventName: string;
  feedbackLink: string;
}

export async function sendFeedbackEmail(input: EventFeedbackEmailInput): Promise<void> {
  const { name, email, eventName, feedbackLink } = input;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping event feedback email to ${email} because GMAIL credentials are not configured.`);
    return;
  }

  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
      },
  });

  const subject = `We Value Your Feedback for ${eventName}! 💬`;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px 0;">
      Thank you for attending <strong>${eventName}</strong>. We hope you had a fantastic time and took away valuable experiences!
    </p>
    <p style="margin:0 0 24px 0;">
      Your feedback is incredibly valuable to us — it helps us improve every future event. Please take just 2 minutes to share your thoughts:
    </p>
    <ul style="margin:0 0 24px 0;padding-left:20px;color:#3c4043;line-height:26px;">
      <li style="padding-bottom:6px;">What did you enjoy most about the event?</li>
      <li style="padding-bottom:6px;">What could we improve for next time?</li>
      <li style="padding-bottom:6px;">Would you recommend MLSC events to peers?</li>
    </ul>
    <p style="margin:0 0 24px 0;">We appreciate your valuable input and look forward to seeing you at our next event.</p>
    ${emailSignature('MLSC Events Team')}
  `;

  const htmlBody = buildEmailHtml({
    eyebrow: '#MLSC4.0 · Post-Event Feedback',
    headline: `How was ${eventName}? 💬`,
    ctaLabel: 'Share Your Feedback →',
    ctaUrl: feedbackLink,
    accentColor: '#34A853',
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
    console.log(`Successfully sent event feedback email to ${email}`);
  } catch (error) {
    console.error(`Failed to send event feedback email to ${email}:`, error);
  }
}
