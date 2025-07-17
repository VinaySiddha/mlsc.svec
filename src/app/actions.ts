'use server';

import {
  summarizeResume,
  SummarizeResumeInput,
} from '@/ai/flows/summarize-resume';
import {z} from 'zod';
import fs from 'fs/promises';
import path from 'path';

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

const ratingSchema = z.object({
  communication: z.number().min(0).max(10),
  technical: z.number().min(0).max(10),
  problemSolving: z.number().min(0).max(10),
  teamFit: z.number().min(0).max(10),
  overall: z.number().min(0).max(10),
});

const reviewSchema = z.object({
  id: z.string(),
  ratings: ratingSchema,
  remarks: z.string().optional(),
});

const dbPath = path.join(process.cwd(), 'db.json');

async function readDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return a default structure
    if (error.code === 'ENOENT') {
      return { applications: [] };
    }
    throw error;
  }
}

async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

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

  try {
    if (resume && resume.size > 0) {
      const buffer = await resume.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const resumeDataUri = `data:${resume.type};base64,${base64}`;

      const summarizationInput: SummarizeResumeInput = {resumeDataUri};
      const result = await summarizeResume(summarizationInput);
      summary = result.summary;
    }

    const db = await readDb();
    const newApplication = {
      id: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      ...applicationData,
      resumeSummary: summary,
      ratings: {
        communication: 0,
        technical: 0,
        problemSolving: 0,
        teamFit: 0,
        overall: 0,
      },
      remarks: '',
    };
    db.applications.push(newApplication);
    await writeDb(db);


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

export async function getApplications() {
  const db = await readDb();
  // Sort by newest first
  return db.applications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}


export async function getApplicationById(id: string) {
  const db = await readDb();
  const application = db.applications.find((app: any) => app.id === id);
  return application || null;
}

export async function saveApplicationReview(data: z.infer<typeof reviewSchema>) {
  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Review validation failed:', parsed.error.flatten().fieldErrors);
    return { error: 'Invalid review data.' };
  }

  try {
    const db = await readDb();
    const applicationIndex = db.applications.findIndex((app: any) => app.id === parsed.data.id);

    if (applicationIndex === -1) {
      return { error: 'Application not found.' };
    }

    db.applications[applicationIndex] = {
      ...db.applications[applicationIndex],
      ratings: parsed.data.ratings,
      remarks: parsed.data.remarks,
    };
    
    await writeDb(db);
    return { success: true };
  } catch (error) {
    console.error('Error saving review:', error);
    if (error instanceof Error) {
      return { error: `Failed to save review: ${error.message}` };
    }
    return { error: 'An unexpected error occurred while saving the review.' };
  }
}
