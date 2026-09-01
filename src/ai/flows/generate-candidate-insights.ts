'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CandidateInsightsInputSchema = z.object({
  name: z.string().describe("Candidate's full name"),
  domain: z.string().describe("Applied technical or non-technical domain"),
  cgpa: z.string().optional().describe("Candidate's CGPA"),
  resumeSummary: z.string().optional().describe("Summary of candidate's resume"),
  joinReason: z.string().optional().describe("Why they want to join"),
  aboutClub: z.string().optional().describe("What they know about MLSC"),
  anythingElse: z.string().optional().describe("Additional comments or project details"),
});

export type CandidateInsightsInput = z.infer<typeof CandidateInsightsInputSchema>;

const TailoredQuestionSchema = z.object({
  question: z.string().describe("A targeted interview question specifically tailored to this candidate"),
  context: z.string().describe("Why this question is being asked based on their profile"),
  whatToLookFor: z.string().describe("Key signals of a great response"),
});

const CandidateInsightsOutputSchema = z.object({
  persona: z.string().describe("A catchy 2-4 word archetype persona, e.g. 'Full-Stack Innovator', 'Pragmatic ML Researcher', 'Community Catalyst'"),
  headline: z.string().describe("A 1-sentence executive summary of the candidate's potential fit and profile strength"),
  matchScore: z.number().min(0).max(100).describe("Overall AI fit score from 0 to 100"),
  confidenceLevel: z.enum(["High Match", "Promising", "Needs Assessment", "Low Match"]).describe("AI confidence in hiring recommendation"),
  strengths: z.array(z.string()).describe("3-4 specific strong points observed from their profile"),
  areasToProbe: z.array(z.string()).describe("2-3 specific areas, potential gaps, or risks for interviewers to probe"),
  tailoredQuestions: z.array(TailoredQuestionSchema).describe("4 dynamic, customized interview questions for the interview panel"),
});

export type CandidateInsightsOutput = z.infer<typeof CandidateInsightsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateCandidateInsightsPrompt',
  input: { schema: CandidateInsightsInputSchema },
  output: { schema: CandidateInsightsOutputSchema },
  prompt: `You are an elite talent evaluator and engineering director assessing a student applicant for MLSC (Microsoft Learn Student Chapter).
Candidate Name: {{name}}
Applied Domain: {{domain}}
CGPA: {{cgpa}}

Candidate Resume & Profile Summary:
"{{resumeSummary}}"

Why they want to join MLSC:
"{{joinReason}}"

What they know about MLSC:
"{{aboutClub}}"

Additional Notes/Projects:
"{{anythingElse}}"

Generate a comprehensive, actionable candidate intelligence report:
1. Assign a compelling, accurate "Persona" (e.g. 'Full-Stack Innovator', 'Cloud Systems Builder', 'Creative Community Lead', 'High-Potential Problem Solver').
2. Write a concise 1-sentence "Headline".
3. Calculate an overall "matchScore" (0-100) and assign a "confidenceLevel" ('High Match', 'Promising', 'Needs Assessment', 'Low Match').
4. List 3 to 4 clear "strengths".
5. List 2 to 3 "areasToProbe" (potential blindspots, depth checks, or behavioral concerns).
6. Generate 4 "tailoredQuestions" that interviewers should ask this specific candidate during the interview, including what signals to look for.`,
});

export const generateCandidateInsightsFlow = ai.defineFlow(
  {
    name: 'generateCandidateInsightsFlow',
    inputSchema: CandidateInsightsInputSchema,
    outputSchema: CandidateInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateCandidateInsights(input: CandidateInsightsInput): Promise<CandidateInsightsOutput> {
  return generateCandidateInsightsFlow(input);
}
