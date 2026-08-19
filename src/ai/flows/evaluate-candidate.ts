'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvaluateCandidateInputSchema = z.object({
  resumeDataURI: z.string().optional().describe("A resume document data URI."),
  cgpa: z.string().describe("The candidate's CGPA out of 10."),
  joinReason: z.string().describe("Candidate's answer to: Why do you want to join?"),
  aboutClub: z.string().describe("Candidate's answer to: What do you know about MLSC?"),
  domain: z.string().describe("The technical domain the candidate applied for."),
});

export type EvaluateCandidateInput = z.infer<typeof EvaluateCandidateInputSchema>;

const EvaluateCandidateOutputSchema = z.object({
  summary: z.string().describe('A brief AI summary of the candidate and their fit.'),
  isRecommended: z.boolean().describe("Whether the AI recommends this candidate to be hired based on their overall profile."),
  suitability: z.object({
    technical: z.string().describe("Assessment of technical skills based on the resume and domain."),
    nonTechnical: z.string().describe("Assessment of non-technical skills like communication and team fit."),
  }),
  ratings: z.object({
    communication: z.number().min(0).max(5).describe("Rating from 0 to 5 based on their written responses."),
    technical: z.number().min(0).max(5).describe("Rating from 0 to 5 based on resume relevance to the applied domain."),
    problemSolving: z.number().min(0).max(5).describe("Rating from 0 to 5 based on resume projects and answers."),
    teamFit: z.number().min(0).max(5).describe("Rating from 0 to 5 based on 'Join Reason' and 'About Club'."),
    confidence: z.number().min(0).max(5).describe("Rating from 0 to 5 based on response enthusiasm and conviction."),
    growthMindset: z.number().min(0).max(5).describe("Rating from 0 to 5 based on their eagerness to learn new technologies and grow."),
    leadership: z.number().min(0).max(5).describe("Rating from 0 to 5 based on projects or initiatives mentioned in resume/answers."),
    overall: z.number().min(0).max(5).describe("Overall average rating from 0 to 5. Consider CGPA here (high CGPA can boost overall score slightly)."),
  }),
});

export type EvaluateCandidateOutput = z.infer<typeof EvaluateCandidateOutputSchema>;

export async function evaluateCandidate(input: EvaluateCandidateInput): Promise<EvaluateCandidateOutput> {
  return evaluateCandidateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateCandidatePrompt',
  input: { schema: EvaluateCandidateInputSchema },
  output: { schema: EvaluateCandidateOutputSchema },
  prompt: `You are an expert technical recruiter and team builder evaluating a student for a student tech club.
The student applied for the {{domain}} domain.

Evaluate them based on:
1. CGPA: {{cgpa}} (Consider higher CGPA as a positive indicator of discipline, but not the only factor).
2. Why they want to join: "{{joinReason}}"
3. What they know about the club: "{{aboutClub}}"
4. Their resume: {{#if resumeDataURI}}{{media url=resumeDataURI}}{{else}}No resume provided.{{/if}}

Please score them out of 5 for Communication, Technical, Problem Solving, Team Fit, Confidence, Growth Mindset, and Leadership.
Calculate an overall score. If the overall score is >= 3.5, set isRecommended to true.
Provide a short summary and suitability text as well.`,
});

const evaluateCandidateFlow = ai.defineFlow(
  {
    name: 'evaluateCandidateFlow',
    inputSchema: EvaluateCandidateInputSchema,
    outputSchema: EvaluateCandidateOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
