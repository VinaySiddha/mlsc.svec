
'use server';

import {
  summarizeResume,
  SummarizeResumeInput,
} from '@/ai/flows/summarize-resume';
import { sendConfirmationEmail } from '@/ai/flows/send-confirmation-email';

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
  writeBatch,
  Query,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import papaparse from 'papaparse';


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
  linkedin: z.string().url('Please enter a valid LinkedIn URL.').optional().or(z.literal('')),
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

const ConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The applicant's name."),
  email: z.string().email().describe("The applicant's email address."),
  referenceId: z.string().describe('The unique reference ID for the application.'),
});
export type ConfirmationEmailInput = z.infer<typeof ConfirmationEmailInputSchema>;


// Generate a unique, readable reference ID
function generateReferenceId() {
  const prefix = "MLSC";
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars
  return `${prefix}-${timestamp}-${random}`;
}

export async function submitApplication(formData: FormData) {
  const file = formData.get('resume') as File;
  
  const values = Object.fromEntries(formData.entries());
  delete values.resume;

  const parsed = applicationSchema.safeParse(values);

  if (!parsed.success) {
    console.error('Form validation failed:', parsed.error.flatten().fieldErrors);
    return {error: 'Invalid form data. Please check your inputs.'};
  }

  const { ...applicationData } = parsed.data;
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
      linkedin: applicationData.linkedin || '',
      anythingElse: applicationData.anythingElse || '',
      resumeSummary: null, // Initially set summary to null
      status: 'Received',
      isRecommended: false,
      interviewAttended: false, // New field for attendance
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
    const resultForUser = { summary: null, referenceId };

    // 3. Process background tasks (summarization and email)
    // Don't await these promise chains in the user-facing response
    (async () => {
        // Send confirmation email directly
        try {
            const emailInput: ConfirmationEmailInput = { 
                name: newApplication.name, 
                email: newApplication.email, 
                referenceId 
            };
            await sendConfirmationEmail(emailInput);
        } catch (emailError) {
            console.error(`Email sending failed for ${referenceId}:`, emailError);
        }

        // Process resume summarization
        if (file && file.size > 0) {
            try {
                const buffer = await file.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const resumeDataUri = `data:${file.type};base64,${base64}`;

                const summarizationInput: SummarizeResumeInput = {resumeDataUri};
                const result = await summarizeResume(summarizationInput);
                
                if (docRef) {
                    await updateDoc(docRef, { resumeSummary: result.summary });
                    console.log(`Successfully generated summary for ${referenceId}`);
                }
            } catch (aiError) {
                console.error(`AI summarization failed for ${referenceId}:`, aiError);
                if (docRef) {
                    await updateDoc(docRef, { resumeSummary: "AI summary failed." });
                }
            }
        }
    })();

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

// Helper function to build the base query from filters
function buildFilteredQuery(params: {
  panelDomain?: string;
  search?: string;
  status?: string;
  year?: string;
  branch?: string;
  domain?: string;
  attendedOnly?: boolean;
}) {
  const { panelDomain, search, status, year, branch, domain, attendedOnly } = params;
  let q: Query<DocumentData> = collection(db, 'applications');
  const constraints: QueryConstraint[] = [];

  // Panel admin is locked to their domain
  if (panelDomain) {
    constraints.push(where('technicalDomain', '==', panelDomain));
  } else if (domain) {
    constraints.push(where('technicalDomain', '==', domain));
  }
  
  if (status) constraints.push(where('status', '==', status));
  if (year) constraints.push(where('yearOfStudy', '==', year));
  if (branch) constraints.push(where('branch', '==', branch));
  if (attendedOnly) constraints.push(where('interviewAttended', '==', true));
  if (search) constraints.push(where('rollNo', '==', search));

  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  return q;
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
  // Add flags for fetching all results or only attended
  fetchAll?: boolean;
  attendedOnly?: boolean;
}) {
  const { sortByPerformance, sortByRecommended, page = '1', limit: limitStr = '10', lastVisibleId, fetchAll = false } = params;
  const limitNumber = parseInt(limitStr, 10);
  
  let baseQuery = buildFilteredQuery(params);
  let finalQuery: Query<DocumentData>;

  const sortConstraints: QueryConstraint[] = [];

  if (sortByRecommended === 'true') {
    sortConstraints.push(where('isRecommended', '==', true));
    sortConstraints.push(orderBy('ratings.overall', 'desc'));
  } else if (sortByPerformance === 'true') {
    sortConstraints.push(orderBy('ratings.overall', 'desc'));
  } else {
    sortConstraints.push(orderBy('submittedAt', 'desc'));
  }

  finalQuery = query(baseQuery, ...sortConstraints);

  // If fetchAll is true, bypass pagination and get all documents
  if (fetchAll) {
    const querySnapshot = await getDocs(finalQuery);
    const applications = querySnapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
    return {
      applications,
      totalApplications: applications.length,
      totalPages: 1,
      currentPage: 1,
    };
  }


  // Get total count based on the constructed query
  const countQuery = query(baseQuery, ...sortConstraints.filter(c => c.type !== 'orderBy'));
  const countSnapshot = await getCountFromServer(countQuery);
  const totalApplications = countSnapshot.data().count;
  const totalPages = Math.ceil(totalApplications / limitNumber);

  // Apply pagination
  let paginatedQuery = finalQuery;
  if (page && parseInt(page, 10) > 1 && lastVisibleId) {
      const lastVisibleDoc = await getDoc(doc(db, 'applications', lastVisibleId));
      if(lastVisibleDoc.exists()) {
        paginatedQuery = query(paginatedQuery, startAfter(lastVisibleDoc));
      }
  }

  paginatedQuery = query(paginatedQuery, limit(limitNumber));

  const querySnapshot = await getDocs(paginatedQuery);
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
    
    // Automated status update logic
    if (reviewData.isRecommended && reviewData.ratings.overall >= 4.0) {
      reviewData.status = 'Recommended';
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
    sameSite: 'strict',
    priority: 'high',
  });

  return { success: true };
}

export async function logoutAction() {
  cookies().delete('session');
  return { success: true };
}

export async function updateAttendance(firestoreId: string, attended: boolean) {
  try {
    const appDocRef = doc(db, 'applications', firestoreId);
    await updateDoc(appDocRef, {
      interviewAttended: attended,
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating attendance:', error);
    if (error instanceof Error) {
      return { error: `Failed to update attendance: ${error.message}` };
    }
    return { error: 'An unexpected error occurred.' };
  }
}

export async function bulkUpdateStatus(filters: {
  panelDomain?: string;
  search?: string;
  status?: string;
  year?: string;
  branch?: string;
  domain?: string;
  attendedOnly?: boolean;
}, newStatus: string) {
  if (!newStatus) {
    return { error: 'No status provided for bulk update.' };
  }
  
  try {
    let q = buildFilteredQuery(filters);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: true, updatedCount: 0 };
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach(documentSnapshot => {
      batch.update(documentSnapshot.ref, { status: newStatus });
    });
    
    await batch.commit();

    return { success: true, updatedCount: querySnapshot.size };
  } catch (error) {
    console.error('Error during bulk update:', error);
    if (error instanceof Error) {
      return { error: `Bulk update failed: ${error.message}` };
    }
    return { error: 'An unexpected error occurred during bulk update.' };
  }
}

export async function exportHiredToCsv() {
    try {
        const q = query(collection(db, 'applications'), where('status', '==', 'Hired'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { error: 'No hired candidates found to export.' };
        }

        const hiredData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Flatten nested objects for easier CSV export
            return {
                referenceId: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                rollNo: data.rollNo,
                branch: data.branch,
                section: data.section,
                yearOfStudy: data.yearOfStudy,
                cgpa: data.cgpa,
                backlogs: data.backlogs,
                technicalDomain: data.technicalDomain,
                nonTechnicalDomain: data.nonTechnicalDomain,
                linkedin: data.linkedin,
                submittedAt: data.submittedAt,
                overallRating: data.ratings?.overall || 0,
            };
        });

        const csv = papaparse.unparse(hiredData);
        return { success: true, csvData: csv };

    } catch (error) {
        console.error('Error exporting hired candidates:', error);
        if (error instanceof Error) {
            return { error: `Export failed: ${error.message}` };
        }
        return { error: 'An unexpected error occurred during export.' };
    }
}


export async function getAnalyticsData() {
  try {
    const applicationsRef = collection(db, 'applications');

    // 1. Get total applications count
    const totalSnapshot = await getCountFromServer(applicationsRef);
    const totalApplications = totalSnapshot.data().count;

    // 2. Get attended interviews count
    const attendedQuery = query(applicationsRef, where('interviewAttended', '==', true));
    const attendedSnapshot = await getCountFromServer(attendedQuery);
    const attendedCount = attendedSnapshot.data().count;
    
    // 3. Get all applications to aggregate various counts
    const allApplicationsSnapshot = await getDocs(applicationsRef);
    const applications = allApplicationsSnapshot.docs.map(doc => doc.data());

    // 4. Calculate domain, status, branch, and year counts
    const domainCounts: { [key: string]: number } = {};
    const statusCounts: { [key: string]: number } = {};
    const branchCounts: { [key: string]: number } = {};
    const yearCounts: { [key: string]: number } = {};

    const domainLabels: Record<string, string> = {
      gen_ai: "Generative AI",
      ds_ml: "Data Science & ML",
      azure: "Azure Cloud",
      web_app: "Web & App Development",
    };

    applications.forEach(app => {
      // Domain
      const domainKey = app.technicalDomain;
      const domainName = domainLabels[domainKey] || domainKey;
      if (domainName) {
        domainCounts[domainName] = (domainCounts[domainName] || 0) + 1;
      }
      // Status
      const status = app.status || 'Received';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      // Branch
      const branch = app.branch || 'Unknown';
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
      // Year
      const year = app.yearOfStudy || 'Unknown';
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const domainData = Object.entries(domainCounts).map(([name, count]) => ({ name, count }));
    const statusData = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));
    const branchData = Object.entries(branchCounts).map(([name, count]) => ({ name, count }));
    const yearData = Object.entries(yearCounts).map(([name, count]) => ({ name, count }));

    return {
      totalApplications,
      attendedCount,
      domainData,
      statusData,
      branchData,
      yearData,
    };
    
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    if (error instanceof Error) {
      return { error: `Failed to fetch analytics: ${error.message}` };
    }
    return { error: 'An unexpected server error occurred.' };
  }
}
