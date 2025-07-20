'use server';

/**
 * @fileOverview An AI-powered flow for generating and sending status update emails to applicants.
 *
 * - sendStatusUpdateEmail - A function that handles generating and sending the email.
 * - StatusUpdateEmailInput - The input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import nodemailer from 'nodemailer';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const StatusUpdateEmailInputSchema = z.object({
  name: z.string().describe("The applicant's name."),
  email: z.string().email().describe("The applicant's email address."),
  status: z.string().describe('The new status of the application (e.g., "Hired", "Rejected", "Interviewing").'),
});
export type StatusUpdateEmailInput = z.infer<typeof StatusUpdateEmailInputSchema>;

const EmailContentSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The HTML body of the email. Use professional and encouraging language. Include a call to action if appropriate (e.g., link to a WhatsApp group for updates).'),
});


const emailGenerationPrompt = ai.definePrompt({
    name: 'generateStatusEmailPrompt',
    input: { schema: StatusUpdateEmailInputSchema },
    output: { schema: EmailContentSchema },
    prompt: `You are a hiring manager for the "MLSC 3.0 Hiring Program". Your task is to compose a professional and clear email to an applicant named {{{name}}} about an update to their application status.

The new status is: **{{{status}}}**

Based on the status, generate an appropriate subject line and email body.

- If the status is **"Hired"**, the tone should be celebratory and welcoming. Mention that they have been selected and provide next steps, such as joining an onboarding group.
- If the status is **"Interviewing"**, inform them that they have been shortlisted for an interview. Provide general details and mention that they will receive a separate email with scheduling information.
- If the status is **"Under Processing"**, let them know their application has passed the initial screening and is now under review by the respective domain leads.
- If the status is **"Rejected"**, the tone should be empathetic and respectful. Thank them for their interest and effort, and encourage them to apply for future opportunities.
- For all emails, maintain a professional tone and wish them the best. Include a signature from "MLSC Hiring Team".

Generate the response in the requested JSON format.`,
    config: {
        temperature: 0.5,
    },
});


export async function sendStatusUpdateEmail(input: StatusUpdateEmailInput): Promise<void> {
  const { name, email, status } = StatusUpdateEmailInputSchema.parse(input);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping status update email to ${email} because GMAIL credentials are not configured.`);
    return;
  }
  
  try {
    // 1. Generate the email content using the AI prompt
    const { output } = await emailGenerationPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate email content.');
    }
    const { subject, body } = output;

    // 2. Send the generated email using Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"MLSC Hiring" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: body,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent '${status}' status update email to ${email}`);

  } catch (error) {
    console.error(`Failed to send status update email to ${email}:`, error);
    // Log the error but don't re-throw, so one failed email doesn't stop the whole bulk process.
  }
}
