'use server';

import {
  summarizeResume,
  SummarizeResumeInput,
} from '@/ai/flows/summarize-resume';
import {z} from 'zod';

const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().optional(),
  isNtuStudent: z.enum(['yes', 'no']),
  major: z.string().optional(),
  yearOfStudy: z.string(),
  interestedRoles: z.array(z.string()).min(1, 'Please select at least one role.'),
  skills: z.string().optional(),
  reason: z.string().min(20, 'Please tell us why you want to join.'),
  resume: z.instanceof(File).optional(),
});

export async function submitApplication(formData: FormData) {
  const rawFormData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    isNtuStudent: formData.get('isNtuStudent'),
    major: formData.get('major'),
    yearOfStudy: formData.get('yearOfStudy'),
    interestedRoles: formData.getAll('interestedRoles'),
    skills: formData.get('skills'),
    reason: formData.get('reason'),
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

    // In a real application, you would save the application data and resume URL to Firestore here.
    // For example:
    // let resumeUrl = null;
    // if (resume) {
    //   resumeUrl = await uploadFileToFirebaseStorage(resume);
    // }
    // await db.collection('applications').add({
    //   ...applicationData,
    //   resumeUrl,
    //   summary,
    //   status: 'Applied',
    //   submittedAt: new Date(),
    // });

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
