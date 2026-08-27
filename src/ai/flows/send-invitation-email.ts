
'use server';

/**
 * @fileOverview A utility for sending an invitation email to a new team member.
 */

import {z} from 'zod';
import nodemailer from 'nodemailer';
import { buildEmailHtml } from '@/lib/email-base';

// Log a warning at startup if credentials are not provided.
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const InvitationEmailInputSchema = z.object({
  name: z.string().describe("The new member's name."),
  email: z.string().email().describe("The new member's email address."),
  role: z.string().describe("The new member's assigned role."),
  onboardingToken: z.string().describe('The unique token for the onboarding process.'),
});
export type InvitationEmailInput = z.infer<typeof InvitationEmailInputSchema>;


/**
 * Sends an invitation email directly using Nodemailer.
 * @param input - The new member's details (name, email, role, token).
 */
export async function sendInvitationEmail(input: InvitationEmailInput): Promise<void> {
  const { name, email, role, onboardingToken } = InvitationEmailInputSchema.parse(input);

  // Check for credentials at the time of execution.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping invitation email to ${email} because GMAIL credentials are not configured in .env.`);
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
  
  const onboardingLink = `https://mlscsvec.com/onboard/${onboardingToken}`;

  const subject = `🎉 Welcome to the MLSC Team, ${name}!`;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px 0;">
      We are thrilled to welcome you to the <strong>Microsoft Learn Student Club (MLSC)</strong> as our new <strong>${role}</strong>. 
      Your skills, passion, and performance truly stood out during the selection process.
    </p>
    <p style="margin:0 0 24px 0;">
      This is the beginning of an exciting journey. We can't wait to see what you'll achieve with us.
    </p>
    <p style="margin:0 0 10px 0;font-weight:700;color:#202124;">To get started:</p>
    <ul style="margin:0 0 24px 0;padding-left:20px;color:#3c4043;line-height:26px;">
      <li style="padding-bottom:6px;">Complete your team profile using the onboarding link below.</li>
      <li style="padding-bottom:6px;">Join our official communication channels for team updates.</li>
      <li style="padding-bottom:6px;">Attend the onboarding session — details will follow via email.</li>
    </ul>
    <p style="margin:0 0 24px 0;">We can't wait for you to join us and start building the future of tech together!</p>
    <div style="border-top:1px solid #e0e0e0;padding-top:20px;">
      <p style="margin:0 0 4px 0;font-size:14px;color:#5f6368;">Welcome aboard &amp; happy building,</p>
      <p style="margin:0;font-size:15px;font-weight:700;font-family:'Google Sans',Arial,sans-serif;color:#202124;">The MLSC Hiring Team</p>
    </div>
  `;

  const htmlBody = buildEmailHtml({
    eyebrow: '#MLSC4.0 · Team Invitation',
    headline: `Welcome Aboard, ${name}! 🎉`,
    ctaLabel: 'Complete Your Profile →',
    ctaUrl: onboardingLink,
    accentColor: '#34A853',
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
    console.log(`Successfully sent invitation email to ${email}`);
  } catch (error) {
    console.error(`Failed to send invitation email to ${email} via Nodemailer:`, error);
    // We'll just log it and not throw an error to avoid halting the parent process.
  }
}
