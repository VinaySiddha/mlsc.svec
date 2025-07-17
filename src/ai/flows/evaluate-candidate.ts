'use server';

/**
 * @fileOverview An AI agent for evaluating a candidate based on their interview transcript and resume.
 *
 * - evaluateCandidate - A function that handles the candidate evaluation process.
 * - EvaluateCandidateInput - The input type for the evaluateCandidate function.
 * - EvaluateCandidateOutput - The return type for the evaluateCandidate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateCandidateInputSchema = z.object({
  resumeSummary: z.string().describe("A summary of the candidate's resume."),
  interviewTranscript: z.string().describe('A transcript of the interview with the candidate.'),
});
export type EvaluateCandidateInput = z.infer<typeof EvaluateCandidateInputSchema>;

const EvaluateCandidateOutputSchema = z.object({
  ratings: z.object({
    communication: z.number().min(0).max(5).describe('Rating for communication skills from 1 to 5.'),
    technical: z.number().min(0).max(5).describe('Rating for technical skills from 1 to 5.'),
    problemSolving: z.number().min(0).max(5).describe('Rating for problem-solving abilities from 1 to 5.'),
    teamFit: z.number().min(0).max(5).describe('Rating for team fit from 1 to 5.'),
    overall: z.number().min(0).max(5).describe('Overall rating for the candidate from 1 to 5.'),
  }),
  remarks: z.string().describe('A summary of the interview and justification for the ratings provided. This should be a concise but comprehensive overview of the candidate\'s performance.'),
});
export type EvaluateCandidateOutput = z.infer<typeof EvaluateCandidateOutputSchema>;


export async function evaluateCandidate(input: EvaluateCandidateInput): Promise<EvaluateCandidateOutput> {
  return evaluateCandidateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateCandidatePrompt',
  input: {schema: EvaluateCandidateInputSchema},
  output: {schema: EvaluateCandidateOutputSchema},
  prompt: `You are an expert hiring manager, responsible for evaluating candidates based on their interview performance and resume.
  
Your goal is to provide a fair and objective assessment. Analyze the provided interview transcript in the context of the candidate's resume summary.

Based on your analysis, you must:
1.  Provide ratings on a scale of 1 to 5 for Communication, Technical Skills, Problem-Solving, and Team Fit. A rating of 0 is only for cases where there is absolutely no information to make a judgement.
2.  Calculate the 'overall' rating as the average of the other four ratings, rounded to the nearest integer.
3.  Write a concise summary of your findings and the reasoning behind your ratings in the 'remarks' field.

Candidate's Resume Summary:
---
{{{resumeSummary}}}
---

Interview Transcript:
---
{{{interviewTranscript}}}
---

Provide your evaluation in the specified JSON format.
`,
});

const evaluateCandidateFlow = ai.defineFlow(
  {
    name: 'evaluateCandidateFlow',
    inputSchema: EvaluateCandidateInputSchema,
    outputSchema: EvaluateCandidateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid evaluation.");
    }
    
    // The model is now responsible for calculating the overall rating.
    return output;
  }
);