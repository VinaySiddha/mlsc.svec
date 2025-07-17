
'use server';

/**
 * @fileOverview An AI agent for evaluating candidates based on their resume and interview.
 *
 * - evaluateCandidate - A function that handles the candidate evaluation process.
 * - EvaluateCandidateInput - The input type for the evaluateCandidate function.
 * - EvaluateCandidateOutput - The return type for the evaluateCandidate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateCandidateInputSchema = z.object({
  resumeSummary: z.string().describe("The AI-generated summary of the candidate's resume."),
  interviewTranscript: z.string().describe('The full transcript of the interview with the candidate.'),
});
export type EvaluateCandidateInput = z.infer<typeof EvaluateCandidateInputSchema>;

const EvaluateCandidateOutputSchema = z.object({
  ratings: z.object({
    communication: z.number().min(0).max(5).describe('Rating for communication skills, as a decimal.'),
    technical: z.number().min(0).max(5).describe('Rating for technical skills, as a decimal.'),
    problemSolving: z.number().min(0).max(5).describe('Rating for problem-solving abilities, as a decimal.'),
    teamFit: z.number().min(0).max(5).describe('Rating for team fit and collaboration, as a decimal.'),
    overall: z.number().min(0).max(5).describe('Overall rating, as an average of the others, as a decimal.'),
  }),
  remarks: z.string().describe('A detailed summary and justification for the provided ratings, highlighting strengths and weaknesses based on the interview and resume.'),
});
export type EvaluateCandidateOutput = z.infer<typeof EvaluateCandidateOutputSchema>;


export async function evaluateCandidate(input: EvaluateCandidateInput): Promise<EvaluateCandidateOutput> {
  return evaluateCandidateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateCandidatePrompt',
  input: {schema: EvaluateCandidateInputSchema},
  output: {schema: EvaluateCandidateOutputSchema},
  prompt: `You are an expert technical recruiter and interviewer for a student tech club. Your task is to evaluate a candidate based on their resume summary and an interview transcript.

Analyze the transcript in the context of the candidate's resume. Provide a fair, decimal-based rating (from 0.0 to 5.0) for each category. The overall score should be the average of the other four scores.

Your remarks should be a concise but detailed justification for your ratings, mentioning specific examples from the interview, and noting any discrepancies or consistencies with the resume.

**Candidate Resume Summary:**
{{{resumeSummary}}}

**Interview Transcript:**
{{{interviewTranscript}}}

Please provide your evaluation in the requested JSON format.`,
  config: {
    temperature: 0.3, // Lower temperature for more consistent, fact-based evaluation
  },
});

const evaluateCandidateFlow = ai.defineFlow(
  {
    name: 'evaluateCandidateFlow',
    inputSchema: EvaluateCandidateInputSchema,
    outputSchema: EvaluateCandidateOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
