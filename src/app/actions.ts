
'use server';

import {
  summarizeResume,
  SummarizeResumeInput,
} from '@/ai/flows/summarize-resume';

import {
  evaluateCandidate,
  EvaluateCandidateInput,
} from '@/ai/flows/evaluate-candidate';


import {z} from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  rollNo: z.string().min(1, 'Roll number is required.'),
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
  resume: z.any().optional(),
});

const reviewSchema = z.object({
  id: z.string(),
  status: z.string(),
  suitability: z.object({
    technical: z.string().optional(),
    nonTechnical: z.string().optional(),
  }),
  ratings: z.object({
    communication: z.number().min(0).max(5),
    technical: z.number().min(0).max(5),
    problemSolving: z.number().min(0).max(5),
    teamFit: z.number().min(0).max(5),
    overall: z.number().min(0).max(5),
  }),
  remarks: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});


const dbPath = path.join(process.cwd(), 'db.json');

async function readDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { applications: [], panels: [] };
    }
    throw error;
  }
}

async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

// Generate a unique, readable reference ID
function generateReferenceId() {
  const prefix = "MLSC";
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars
  return `${prefix}-${timestamp}-${random}`;
}

export async function submitApplication(formData: FormData) {
  const rawFormData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    rollNo: formData.get('rollNo'),
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
  const referenceId = generateReferenceId();

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
      id: referenceId, // Use reference ID as the main ID
      submittedAt: new Date().toISOString(),
      ...applicationData,
      resumeSummary: summary,
      status: 'Received',
      suitability: {
        technical: 'undecided',
        nonTechnical: 'undecided',
      },
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


    return {summary, referenceId };
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

export async function getApplications(params: {
  panelDomain?: string;
  search?: string;
  status?: string;
  year?: string;
  branch?: string;
  domain?: string;
  sortByPerformance?: string;
}) {
  const { panelDomain, search, status, year, branch, domain, sortByPerformance } = params;
  const db = await readDb();
  
  let applications = db.applications;

  // Panel-based filtering is the first and most important filter
  if (panelDomain) {
    applications = applications.filter((app: any) => app.technicalDomain === panelDomain);
  }

  // Server-side search
  if (search) {
    const searchTerm = search.toLowerCase();
    applications = applications.filter((app: any) => 
      (app.name && app.name.toLowerCase().includes(searchTerm)) ||
      (app.email && app.email.toLowerCase().includes(searchTerm)) ||
      (app.id && app.id.toLowerCase().includes(searchTerm)) ||
      (app.rollNo && app.rollNo.toLowerCase().includes(searchTerm))
    );
  }

  // Server-side filters
  if (status) {
    applications = applications.filter((app: any) => app.status === status);
  }
  if (year) {
    applications = applications.filter((app: any) => app.yearOfStudy === year);
  }
  if (branch) {
    applications = applications.filter((app: any) => app.branch === branch);
  }
  // Admin-only domain filter
  if (domain && !panelDomain) {
    applications = applications.filter((app: any) => app.technicalDomain === domain);
  }
  
  // Sort by performance if requested
  if (sortByPerformance === 'true' && !panelDomain) {
    applications.sort((a: any, b: any) => (b.ratings?.overall || 0) - (a.ratings?.overall || 0));
  } else {
    // Default sort: newest first
    applications.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  return applications;
}

export async function getApplicationById(id: string) {
  const db = await readDb();
  const application = db.applications.find((app: any) => app.id === id);
  return application || null;
}

export async function getPanels() {
  const db = await readDb();
  return db.panels || [];
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
    
    db.applications[applicationIndex].status = parsed.data.status;
    db.applications[applicationIndex].suitability = parsed.data.suitability;
    db.applications[applicationIndex].ratings = parsed.data.ratings;
    db.applications[applicationIndex].remarks = parsed.data.remarks;
    
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

export async function evaluateCandidateAction(input: EvaluateCandidateInput) {
  try {
    const result = await evaluateCandidate(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error evaluating candidate:', error);
    if (error instanceof Error) {
      return {
        error: `An error occurred during evaluation: ${error.message}`,
      };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function loginAction(values: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Invalid input.' };
  }

  const { username, password } = parsed.data;

  // Hardcoded admin credentials for demo purposes.
  // In a real app, use environment variables.
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables.');
  }

  let userPayload: { role: string; domain?: string; username: string };

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    userPayload = { role: 'admin', username };
  } else {
    const panels = await getPanels();
    const panel = panels.find(p => p.username === username && p.password === password);
    if (panel) {
      userPayload = { role: 'panel', domain: panel.domain, username };
    } else {
      return { error: 'Invalid username or password.' };
    }
  }

  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1d' });

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  return { success: true };
}

export async function logoutAction() {
  cookies().delete('session');
  return { success: true };
}

export async function getFilterData() {
  const db = await readDb();
  const applications = db.applications || [];
  const statuses = [...new Set(applications.map(a => a.status))].filter(Boolean);
  const years = [...new Set(applications.map(a => a.yearOfStudy))].filter(Boolean);
  const branches = [...new Set(applications.map(a => a.branch))].filter(Boolean);
  const domains = [...new Set(applications.map(a => a.technicalDomain))].filter(Boolean);

  return { statuses, years, branches, domains };
}
