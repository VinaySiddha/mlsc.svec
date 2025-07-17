
'use server';

/**
 * @fileOverview A flow for sending a confirmation email to an applicant.
 *
 * - sendConfirmationEmail - A function that handles sending the email.
 * - ConfirmationEmailInput - The input type for the sendConfirmationEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The applicant's name."),
  email: z.string().email().describe("The applicant's email address."),
  referenceId: z.string().describe('The unique reference ID for the application.'),
});
export type ConfirmationEmailInput = z.infer<typeof ConfirmationEmailInputSchema>;

// This flow doesn't need an output schema as it's a "fire-and-forget" operation.
export async function sendConfirmationEmail(input: ConfirmationEmailInput): Promise<void> {
  await sendConfirmationEmailFlow(input);
}

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

  tools: [
    ai.defineTool({
      name: 'sendEmail',
      description: 'Sends an email to a recipient.',
      inputSchema: z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      }),
      outputSchema: z.void(),
      // In a real application, this would integrate with an actual email service
      // like SendGrid, Resend, or Nodemailer. For this demo, we'll just log it.
      async handler({to, subject, body}) {
        console.log('--- SENDING EMAIL ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log('---------------------');
        // This is where the actual email sending logic would go.
      },
    }),
  ],

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
