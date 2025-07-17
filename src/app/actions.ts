
'use server';

import {
  summarizeResume,
  SummarizeResumeInput,
} from '@/ai/flows/summarize-resume';

import {z} from 'zod';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  documentId,
} from 'firebase/firestore';


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
  isRecommended: z.boolean(),
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

    const newApplication = {
      id: referenceId, // Use reference ID as a field
      submittedAt: new Date().toISOString(),
      ...applicationData,
      resumeSummary: summary,
      status: 'Received',
      isRecommended: false,
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
    
    const applicationsRef = collection(db, "applications");
    const docRef = await addDoc(applicationsRef, { ...newApplication });

    // Update the document with its own Firestore ID for easy reference
    await updateDoc(docRef, { firestoreId: docRef.id });

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
  sortByRecommended?: string;
  page?: string;
  limit?: string;
  lastVisibleId?: string;
}) {
  const { panelDomain, search, status, year, branch, domain, sortByPerformance, sortByRecommended, page = '1', limit: limitStr = '10', lastVisibleId } = params;
  const limitNumber = parseInt(limitStr, 10);
  
  let q = query(collection(db, 'applications'));
  let conditions: any[] = [];
  
  // Panel-based filtering
  if (panelDomain) {
    conditions.push(where('technicalDomain', '==', panelDomain));
  }
  
  // Other filters
  if (status) conditions.push(where('status', '==', status));
  if (year) conditions.push(where('yearOfStudy', '==', year));
  if (branch) conditions.push(where('branch', '==', branch));
  if (domain && !panelDomain) conditions.push(where('technicalDomain', '==', domain));
  if (sortByRecommended === 'true' && !panelDomain) {
    conditions.push(where('isRecommended', '==', true));
  }

  // Combine all "where" clauses
  if (conditions.length > 0) {
    q = query(q, ...conditions);
  }

  // NOTE: Firestore doesn't support text search on multiple fields out-of-the-box.
  // The search implementation below is basic and only searches the name field.
  // For production, a dedicated search service like Algolia or Elasticsearch is recommended.
  if (search) {
     const searchTerm = search.toLowerCase();
     // This is a very limited search. For a real app, you would use a search service.
     // Here we are creating a pseudo-search by querying for a range.
     q = query(q, where('name', '>=', search), where('name', '<=', search + '\uf8ff'));
  }


  // Sorting
  if (sortByPerformance === 'true' && !panelDomain) {
    q = query(q, orderBy('ratings.overall', 'desc'));
  } else if (sortByRecommended === 'true' && !panelDomain) {
    // Already filtered by isRecommended=true, now sort by performance
    q = query(q, orderBy('ratings.overall', 'desc'));
  } else {
    // Default sort: newest first
    q = query(q, orderBy('submittedAt', 'desc'));
  }
  
  const countQuery = q;
  const snapshot = await getCountFromServer(countQuery);
  const totalApplications = snapshot.data().count;
  const totalPages = Math.ceil(totalApplications / limitNumber);


  // Pagination
  if (lastVisibleId) {
    const lastVisibleDoc = await getDoc(doc(db, 'applications', lastVisibleId));
    if(lastVisibleDoc.exists()) {
      q = query(q, startAfter(lastVisibleDoc));
    }
  }

  q = query(q, limit(limitNumber));

  const querySnapshot = await getDocs(q);
  const applications = querySnapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));

  return {
    applications,
    totalApplications,
    totalPages,
    currentPage: parseInt(page, 10),
  };
}


export async function getApplicationById(id: string) {
    const q = query(collection(db, 'applications'), where('id', '==', id), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const docSnap = querySnapshot.docs[0];
    return { firestoreId: docSnap.id, ...docSnap.data() };
}

export async function getPanels() {
  const panelsCol = collection(db, 'panels');
  const panelSnapshot = await getDocs(panelsCol);
  const panelList = panelSnapshot.docs.map(doc => doc.data());
  return panelList;
}

export async function saveApplicationReview(data: z.infer<typeof reviewSchema>) {
  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Review validation failed:', parsed.error.flatten().fieldErrors);
    return { error: 'Invalid review data.' };
  }

  try {
    const { id, ...reviewData } = parsed.data;
    const application = await getApplicationById(id);
    if (!application || !application.firestoreId) {
      return { error: 'Application not found.' };
    }
    
    const appDocRef = doc(db, 'applications', application.firestoreId);
    await updateDoc(appDocRef, {
        status: reviewData.status,
        isRecommended: reviewData.isRecommended,
        suitability: reviewData.suitability,
        ratings: reviewData.ratings,
        remarks: reviewData.remarks,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving review:', error);
    if (error instanceof Error) {
      return { error: `Failed to save review: ${error.message}` };
    }
    return { error: 'An unexpected error occurred while saving the review.' };
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
    const applicationsCol = collection(db, 'applications');
    const appSnapshot = await getDocs(applicationsCol);
    const applications = appSnapshot.docs.map(doc => doc.data());
    
    const statuses = [...new Set(applications.map(a => a.status))].filter(Boolean);
    const years = [...new Set(applications.map(a => a.yearOfStudy))].filter(Boolean);
    const branches = [...new Set(applications.map(a => a.branch))].filter(Boolean);
    const domains = [...new Set(applications.map(a => a.technicalDomain))].filter(Boolean);

    return { statuses, years, branches, domains };
}
