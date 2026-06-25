
'use server';

import nodemailer from 'nodemailer';
import { eventRegistrationConfirmationTemplate } from '@/lib/email-templates/event-registration-confirmation';

export interface EventConfirmationEmailInput {
  name: string;
  email: string;
  eventName: string;
  eventDate: string;
  eventLink?: string;
  orderId?: string;
  venue?: string;
  time?: string;
  amount?: number;
}

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Event emails will not be sent.");
}

export async function sendEventConfirmationEmail(input: EventConfirmationEmailInput): Promise<void> {
  const { name, email, eventName, eventDate, eventLink, orderId, venue, time, amount } = input;

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

  const { subject, html } = eventRegistrationConfirmationTemplate({
    customerName: name,
    eventTitle: eventName,
    amount: amount || 0,
    orderId: orderId || 'REG-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
    date: eventDate,
    venue: venue || 'Sri Vasavi Engineering College',
    time: time || '10:00 AM',
    eventLink: eventLink || undefined,
  });

  const mailOptions = {
    from: `"MLSC SVEC" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent event confirmation email to ${email}`);
  } catch (error) {
    console.error(`Failed to send event confirmation email to ${email}:`, error);
  }
}
