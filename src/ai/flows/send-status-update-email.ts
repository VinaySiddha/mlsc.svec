
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
  message: z.string().describe('The core message of the email in plain text. This will be embedded in a larger HTML template. Keep it concise and professional.'),
});


const emailGenerationPrompt = ai.definePrompt({
    name: 'generateStatusEmailPrompt',
    input: { schema: StatusUpdateEmailInputSchema },
    output: { schema: EmailContentSchema },
    prompt: `You are a hiring manager for the "MLSC 3.0 Hiring Program". Your task is to compose a professional and clear email content for an applicant named {{{name}}} about an update to their application status.

The new status is: **{{{status}}}**

Based on the status, generate an appropriate subject line and a concise message body.

- If the status is **"Hired"**, the tone should be celebratory and welcoming. Mention they have been selected and provide next steps, like joining an onboarding group.
- If the status is **"Interviewing"**, inform them they have been shortlisted for an interview. Mention they will receive a separate email with scheduling information.
- If the status is **"Under Processing"**, let them know their application has passed initial screening and is now under review by domain leads.
- If the status is **"Rejected"**, the tone should be empathetic and respectful. Thank them for their interest and effort, and encourage them to apply for future opportunities.
- If the status is **"Recommended"**, congratulate them on passing the interview and let them know their application has been forwarded for final review.
- For all messages, maintain a professional tone and wish them the best.

Generate the response in the requested JSON format. The 'message' should be plain text/simple markdown, not full HTML.`,
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
    const { subject, message } = output;

    // 2. Embed the AI-generated message into the stylish HTML template
    const htmlBody = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
        
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
        
        <div style="background-color: #0056b3; height: 6px;"></div>
        
        <div style="padding: 20px;">
          <h2 style="color: #222; font-size: 20px; font-weight: 600;">Hi ${name},</h2>
          
          <p style="font-size: 16px; font-weight: 400;">
            This is an update regarding your application for the <strong>MLSC 3.0 Hiring Program</strong>.
          </p>

          <div style="background-color: #f1f5f9; border: 1px solid #d1d5db; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; font-weight: 500;"><strong>New Status:</strong> 
              <span style="background-color: #facc15; color: #1f2937; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${status}</span>
            </p>
            <p style="font-size: 15px; color: #333; margin-top: 12px; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="font-size: 16px; font-weight: 400;">Thank you for your time and interest in MLSC.</p>
          <p style="margin-top: 30px; font-weight: 500;">Best regards,<br><strong>MLSC Hiring Team</strong></p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 15px; font-size: 12px; color: #555;">
          <p style="margin: 0; font-weight: 500;">📌 Please Note:</p>
          <ul style="padding-left: 20px; margin: 5px 0 0 0;">
            <li>All official communication will be sent to this email address.</li>
            <li>For any queries, contact us at <a href="tel:+919849372827" style="color: #0056b3; text-decoration: none;">Contact Us</a>.</li>
          </ul>
        </div>

        <div style="background-color: #0056b3; text-align: center; padding: 12px; font-size: 12px; color: #ffffff;">
          🚀 #MLSC3.0 #DreamBig #FutureReady
        </div>
      </div>
    `;

    // 3. Send the generated email using Nodemailer
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
        html: htmlBody,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent '${status}' status update email to ${email}`);

  } catch (error) {
    console.error(`Failed to send status update email to ${email}:`, error);
    // Log the error but don't re-throw, so one failed email doesn't stop the whole bulk process.
  }
}
