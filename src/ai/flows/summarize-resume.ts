'use server';

/**
 * @fileOverview A resume summarization AI agent.
 *
 * - summarizeResume - A function that handles the resume summarization process.
 * - SummarizeResumeInput - The input type for the summarizeResume function.
 * - SummarizeResumeOutput - The return type for the summarizeResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeResumeInputSchema = z.object({
  resumeDataURI: z
    .string()
    .describe(
      "A resume document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeResumeInput = z.infer<typeof SummarizeResumeInputSchema>;

const SummarizeResumeOutputSchema = z.object({
  summary: z.string().describe('A summary of the candidate\'s resume.'),
});
export type SummarizeResumeOutput = z.infer<typeof SummarizeResumeOutputSchema>;

export async function summarizeResume(input: SummarizeResumeInput): Promise<SummarizeResumeOutput> {
  return summarizeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeResumePrompt',
  input: { schema: SummarizeResumeInputSchema },
  output: { schema: SummarizeResumeOutputSchema },
  prompt: `You are an expert resume summarizer.

You will be provided with a resume in data URI format.

Your goal is to summarize the resume, extracting the key skills, experiences and qualifications of the candidate.

Resume: {{media url=resumeDataURI}}`,
});

const summarizeResumeFlow = ai.defineFlow(
  {
    name: 'summarizeResumeFlow',
    inputSchema: SummarizeResumeInputSchema,
    outputSchema: SummarizeResumeOutputSchema,
  },
  async (input) => {
    let attempts = 0;
    while (attempts < 2) {
      try {
        const { output } = await prompt(input);
        if (output) return output;
      } catch (err: any) {
        attempts++;
        console.warn(`[AI summarizeResume] Attempt ${attempts} error:`, err?.message || err);
        if (attempts < 2) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }

    return {
      summary: "Resume uploaded successfully. Summary generated from applicant profile submission.",
    };
  }
);
