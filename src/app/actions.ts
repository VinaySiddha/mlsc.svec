'use server';

import { summarizeResume, SummarizeResumeInput } from "@/ai/flows/summarize-resume";
import { z } from "zod";

const applicationSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  skills: z.string(),
  reason: z.string(),
  resume: z.instanceof(File),
});

export async function submitApplication(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());

  const parsed = applicationSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { error: 'Invalid form data. Please check your inputs.' };
  }

  const { resume } = parsed.data;

  if (!resume || resume.size === 0) {
    return { error: "Resume file is missing or empty." };
  }
  
  try {
    const buffer = await resume.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const resumeDataUri = `data:${resume.type};base64,${base64}`;

    const summarizationInput: SummarizeResumeInput = { resumeDataUri };
    const result = await summarizeResume(summarizationInput);

    // In a real application, you would save the application data and resume URL to Firestore here.
    // For example:
    // const resumeUrl = await uploadFileToFirebaseStorage(resume);
    // await db.collection('applications').add({
    //   ...parsed.data,
    //   resumeUrl,
    //   summary: result.summary,
    //   status: 'Applied',
    //   submittedAt: new Date(),
    // });

    return { summary: result.summary };

  } catch (error) {
    console.error("Error submitting application:", error);
    if (error instanceof Error) {
      return { error: `An error occurred during resume processing: ${error.message}` };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
