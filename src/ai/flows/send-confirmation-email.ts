
'use server';

/**
 * @fileOverview A utility for sending a confirmation email to an applicant using Nodemailer and Gmail.
 *
 * - sendConfirmationEmail - A direct function to handle sending the email.
 * - ConfirmationEmailInput - The input type for the sendConfirmationEmail function.
 */

import {z} from 'zod';
import nodemailer from 'nodemailer';

// Log a warning at startup if credentials are not provided.
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const ConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The applicant's name."),
  email: z.string().email().describe("The applicant's email address."),
  referenceId: z.string().describe('The unique reference ID for the application.'),
});
export type ConfirmationEmailInput = z.infer<typeof ConfirmationEmailInputSchema>;


/**
 * Sends a confirmation email directly using Nodemailer.
 * @param input - The applicant's details (name, email, referenceId).
 */
export async function sendConfirmationEmail(input: ConfirmationEmailInput): Promise<void> {
  const { name, email, referenceId } = ConfirmationEmailInputSchema.parse(input);

  // Check for credentials at the time of execution.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping email to ${email} because GMAIL credentials are not configured in .env.`);
    return;
  }

  // Create a Nodemailer transporter inside the handler to ensure it's only created when needed.
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, 
      },
  });

  const subject = "Your MLSC Application has been Received!";
  const body = `Hi ${name},\n\nThank you for applying to the MLSC. We have successfully received your application.\n\nYour reference ID is: ${referenceId}\n\nPlease save this ID to check your application status later on our portal.\n\nBest regards,\nThe MLSC Hiring Team`;
  
  const mailOptions = {
      from: `"MLSC Hiring" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`, // HTML body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent email to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email} via Nodemailer:`, error);
    // We'll just log it and not throw an error to avoid halting the parent process.
  }
}
