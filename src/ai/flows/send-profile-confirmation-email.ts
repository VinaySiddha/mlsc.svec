
'use server';

/**
 * @fileOverview A utility for sending an email to a new team member after they've created their profile.
 */

import {z} from 'zod';
import nodemailer from 'nodemailer';
import { buildEmailHtml } from '@/lib/email-base';

// Log a warning at startup if credentials are not provided.
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const ProfileConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The new member's name."),
  email: z.string().email().describe("The new member's email address."),
  memberId: z.string().describe("The member's unique Firestore ID."),
  editLink: z.string().url().describe("The permanent link for the member to edit their profile."),
});
export type ProfileConfirmationEmailInput = z.infer<typeof ProfileConfirmationEmailInputSchema>;


/**
 * Sends a profile confirmation email directly using Nodemailer.
 * @param input - The new member's details (name, email, editLink).
 */
export async function sendProfileConfirmationEmail(input: ProfileConfirmationEmailInput): Promise<void> {
  const { name, email, editLink, memberId } = ProfileConfirmationEmailInputSchema.parse(input);

  // Check for credentials at the time of execution.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping profile confirmation email to ${email} because GMAIL credentials are not configured in .env.`);
    return;
  }

  // Create a Nodemailer transporter inside the handler.
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, 
      },
  });

  const idCardLink = `https://mlscsvec.com/id/${memberId}`;
  const subject = `Your MLSC Profile is Now Live! ✅`;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px 0;">
      Your profile for the <strong>Microsoft Learn Student Club (MLSC)</strong> is now active and live on our team page. Welcome aboard!
    </p>
    <p style="margin:0 0 10px 0;font-weight:700;color:#202124;">What you can do:</p>
    <ul style="margin:0 0 24px 0;padding-left:20px;color:#3c4043;line-height:26px;">
      <li style="padding-bottom:6px;">
        <a href="${editLink}" style="color:#1a73e8;text-decoration:none;">Edit your profile</a> to update your details and photo at any time.
      </li>
      <li style="padding-bottom:6px;">
        <a href="${idCardLink}" style="color:#1a73e8;text-decoration:none;">View your MLSC ID Card</a> — bookmark it for future reference.
      </li>
      <li style="padding-bottom:6px;">Stay connected with the team via our community channels for events &amp; updates.</li>
    </ul>
    <p style="margin:0 0 24px 0;">We are excited to start this journey with you. Let's build something amazing together!</p>
    <div style="border-top:1px solid #e0e0e0;padding-top:20px;">
      <p style="margin:0 0 4px 0;font-size:14px;color:#5f6368;">Welcome &amp; happy building,</p>
      <p style="margin:0;font-size:15px;font-weight:700;font-family:'Google Sans',Arial,sans-serif;color:#202124;">The MLSC Hiring Team</p>
    </div>
  `;

  const htmlBody = buildEmailHtml({
    eyebrow: '#MLSC4.0 · Profile Confirmed',
    headline: `Profile Active, ${name}! ✅`,
    ctaLabel: 'Edit Your Profile →',
    ctaUrl: editLink,
    accentColor: '#4285F4',
    bodyHtml,
  });
  
  const mailOptions = {
      from: `"MLSC Hiring" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent profile confirmation email to ${email}`);
  } catch (error) {
    console.error(`Failed to send profile confirmation email to ${email} via Nodemailer:`, error);
  }
}
