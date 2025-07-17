
'use server';

/**
 * @fileOverview A flow for sending a confirmation email to an applicant using Nodemailer and Gmail.
 *
 * - sendConfirmationEmail - A function that handles sending the email.
 * - ConfirmationEmailInput - The input type for the sendConfirmationEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import nodemailer from 'nodemailer';

// Create a Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, 
    },
});

// Check if credentials are provided and log a warning if not.
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Email sending is disabled. A real email will not be sent.");
}

const ConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The applicant's name."),
  email: z.string().email().describe("The applicant's email address."),
  referenceId: z.string().describe('The unique reference ID for the application.'),
});
export type ConfirmationEmailInput = z.infer<typeof ConfirmationEmailInputSchema>;

// This flow doesn't need an output schema as it's a "fire-and-forget" operation.
export async function sendConfirmationEmail(input: ConfirmationEmailInput): Promise<void> {
  // Only proceed if Nodemailer is configured with credentials.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return;
  }
  await sendConfirmationEmailFlow(input);
}

const sendEmailTool = ai.defineTool({
  name: 'sendEmail',
  description: 'Sends an email to a recipient using Nodemailer.',
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  outputSchema: z.void(),
  handler: async ({to, subject, body}) => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log(`Skipping email to ${to} because GMAIL credentials are not configured in .env.`);
      return;
    }
    
    const mailOptions = {
        from: `"MLSC Hiring" <${process.env.GMAIL_USER}>`, // Sender address
        to: to, // List of receivers
        subject: subject, // Subject line
        html: `<p>${body.replace(/\n/g, '<br>')}</p>`, // HTML body
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Successfully sent email to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to} via Nodemailer:`, error);
      // For now, we'll just log it and not throw an error to avoid halting the flow.
    }
  },
});

const prompt = ai.definePrompt({
  name: 'sendConfirmationEmailPrompt',
  input: {schema: ConfirmationEmailInputSchema},
  // We use a tool to send the email. The prompt's output is just for logging/debugging.
  output: {schema: z.string()}, 
  
  // Instruct the LLM to use the provided tool to send the email.
  prompt: `An application was received. Send a confirmation email to the applicant using the provided tool.
  
  Applicant Name: {{{name}}}
  Applicant Email: {{{email}}}
  Reference ID: {{{referenceId}}}
  
  The email subject should be: "Your MLSC Application has been Received!".
  The email body should be a friendly confirmation message, including their name and reference ID, and instructing them to save the ID to check their status later. Do not add any unsubscribe links or marketing content.
  `,

  tools: [sendEmailTool],

  config: {
    temperature: 0.2, // Low temperature for deterministic, direct instruction following.
  },
});

const sendConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'sendConfirmationEmailFlow',
    inputSchema: ConfirmationEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // The prompt will automatically use the 'sendEmail' tool when it runs.
    await prompt(input);
  }
);
