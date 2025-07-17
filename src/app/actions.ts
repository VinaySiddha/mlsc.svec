
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
  const referenceId = generateReferenceId();
  let docRef;

  try {
    const applicationsRef = collection(db, "applications");

    // Check for existing email
    const emailQuery = query(applicationsRef, where("email", "==", applicationData.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return { error: 'An application with this email address already exists.' };
    }

    // Check for existing roll number
    const rollNoQuery = query(applicationsRef, where("rollNo", "==", applicationData.rollNo));
    const rollNoSnapshot = await getDocs(rollNoQuery);
    if (!rollNoSnapshot.empty) {
      return { error: 'An application with this roll number already exists.' };
    }

    const newApplication = {
      id: referenceId, // Use reference ID as a field
      submittedAt: new Date().toISOString(),
      ...applicationData,
      resumeSummary: null, // Initially set summary to null
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
    
    // 1. Immediately save the application to get a reference ID for the user
    docRef = await addDoc(applicationsRef, { ...newApplication });
    await updateDoc(docRef, { firestoreId: docRef.id });

    // 2. Return success to the user immediately
    // The AI processing will continue in the background
    const resultForUser = { summary: null, referenceId };

    // 3. Process resume summarization in the background
    if (resume && resume.size > 0) {
      // Don't await this promise chain in the user-facing response
      (async () => {
        try {
          const buffer = await resume.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const resumeDataUri = `data:${resume.type};base64,${base64}`;

          const summarizationInput: SummarizeResumeInput = {resumeDataUri};
          const result = await summarizeResume(summarizationInput);
          
          // Update the document with the AI-generated summary
          if (docRef) {
            await updateDoc(docRef, { resumeSummary: result.summary });
            console.log(`Successfully generated summary for ${referenceId}`);
          }
        } catch (aiError) {
           console.error(`AI summarization failed for ${referenceId}:`, aiError);
           if (docRef) {
            // Optionally update status to indicate failure
            await updateDoc(docRef, { resumeSummary: "AI summary failed." });
          }
        }
      })();
    }

    return resultForUser;
  } catch (error) {
    console.error('Error submitting application:', error);
    if (error instanceof Error) {
      return {
        error: `An error occurred during application submission: ${error.message}`,
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
    q = query(q, orderBy('ratings.overall', 'desc'));
  } else {
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
  // This function is no longer strictly needed if we hardcode panel credentials,
  // but it's good practice to keep it for future use with a real database.
  // For now, it will return an empty array.
  try {
    const panelsCol = collection(db, 'panels');
    const panelSnapshot = await getDocs(panelsCol);
    const panelList = panelSnapshot.docs.map(doc => doc.data());
    return panelList;
  } catch (error) {
    console.error("Could not fetch panels, maybe the collection doesn't exist yet.", error);
    return [];
  }
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

  // Hardcoded credentials for demo purposes.
  // In a real app, use environment variables and a secure user management system.
  const SUPER_ADMIN_USERNAME = 'vinaysiddha';
  const SUPER_ADMIN_PASSWORD = 'Vinay@15';
  
  const panelCredentials = [
      { username: 'gen_ai_panel', password: 'panel@genai', domain: 'gen_ai' },
      { username: 'ds_ml_panel', password: 'panel@ds', domain: 'ds_ml' },
      { username: 'azure_panel', password: 'panel@azure', domain: 'azure' },
      { username: 'web_app_panel', password: 'panel@web', domain: 'web_app' },
  ];

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables.');
  }

  let userPayload: { role: string; domain?: string; username: string };

  if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
    userPayload = { role: 'admin', username };
  } else {
    const panel = panelCredentials.find(p => p.username === username && p.password === password);
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
