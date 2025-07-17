'use server';

import {
  summarizeResume,
  SummarizeResumeInput,
} from '@/ai/flows/summarize-resume';
import {z} from 'zod';

const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  branch: z.string({ required_error: 'Please select your branch.' }),
  section: z.string({ required_error: 'Please select your section.' }),
  yearOfStudy: z.string({ required_error: 'Please select your year of study.'}),
  cgpa: z.string().min(1, 'CGPA is required.'),
  backlogs: z.string().min(1, 'Number of backlogs is required.'),
  joinReason: z.string().min(20, 'Please tell us why you want to join.'),
  aboutClub: z.string().min(20, 'Please tell us what you know about the club.'),
  technicalDomain: z.string({ required_error: 'Please select a technical domain.' }),
  nonTechnicalDomain: z.string({ required_error: 'Please select a non-technical domain.' }),
  linkedin: z.string().url('Please enter a valid LinkedIn URL.').optional(),
  anythingElse: z.string().optional(),
  resume: z.instanceof(File).optional(),
});

export async function submitApplication(formData: FormData) {
  const rawFormData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    branch: formData.get('branch'),
    section: formData.get('section'),
    yearOfStudy: formData.get('yearOfStudy'),
    cgpa: formData.get('cgpa'),
    backlogs: formData.get('backlogs'),
    joinReason: formData.get('joinReason'),
    aboutClub: formData.get('aboutClub'),
    technicalDomain: formData.get('technicalDomain'),
    nonTechnicalDomain: formData.get('nonTechnicalDomain'),
    linkedin: formData.get('linkedin') || undefined,
    anythingElse: formData.get('anythingElse') || undefined,
    resume: formData.get('resume'),
  };

  const parsed = applicationSchema.safeParse(rawFormData);

  if (!parsed.success) {
    console.error('Form validation failed:', parsed.error.flatten().fieldErrors);
    return {error: 'Invalid form data. Please check your inputs.'};
  }

  const {resume, ...applicationData} = parsed.data;

  let summary: string | null = null;
  let resumeDataUri: string | null = null;

  try {
    if (resume && resume.size > 0) {
      const buffer = await resume.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      resumeDataUri = `data:${resume.type};base64,${base64}`;

      const summarizationInput: SummarizeResumeInput = {resumeDataUri};
      const result = await summarizeResume(summarizationInput);
      summary = result.summary;
    }

    // In a real application, you would save the application data here.
    console.log('Application data:', applicationData);

    return {summary};
  } catch (error) {
    console.error('Error submitting application:', error);
    if (error instanceof Error) {
      return {
        error: `An error occurred during application processing: ${error.message}`,
      };
    }
    return {error: 'An unexpected error occurred. Please try again.'};
  }
}
