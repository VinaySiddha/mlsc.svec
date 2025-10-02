
'use server';

import {
  summarizeResume,
  SummarizeResumeInput,
} from '@/ai/flows/summarize-resume';
import { sendConfirmationEmail } from '@/ai/flows/send-confirmation-email';
import { sendStatusUpdateEmail, StatusUpdateEmailInput } from '@/ai/flows/send-status-update-email';
import { sendInvitationEmail, InvitationEmailInput } from '@/ai/flows/send-invitation-email';
import { sendProfileConfirmationEmail, ProfileConfirmationEmailInput } from '@/ai/flows/send-profile-confirmation-email';
import { sendRsvpConfirmationEmail, RsvpConfirmationEmailInput } from '@/ai/flows/send-rsvp-confirmation-email';


import {z} from 'zod';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { db, storage } from '@/lib/firebase';
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
  runTransaction,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import papaparse from 'papaparse';
import { randomBytes } from 'crypto';
import type { User } from 'firebase/auth';


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
  technicalDomain: z.string({ required_error: 'Please select a technical domain.' }).min(1, 'Please select a technical domain.'),
  nonTechnicalDomain: z.string({ required_error: 'Please select a non-technical domain.' }).min(1, 'Please select a non-technical domain.'),
  linkedin: z.string().url('Please enter a valid LinkedIn URL.').optional().or(z.literal('')),
  anythingElse: z.string().optional(),
  resume: z.any().optional(),
});

const internalApplicationSchema = applicationSchema.omit({
  joinReason: true,
  aboutClub: true,
  anythingElse: true,
  resume: true,
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


const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  date: z.date(),
  image: z.any().optional(),
  registrationOpen: z.boolean().default(false),
  speakers: z.array(z.object({
    name: z.string().min(1, "Speaker name is required."),
    title: z.string().min(1, "Speaker title is required."),
    image: z.any().optional(),
  })).optional(),
  timeline: z.string().optional(),
  highlightImages: z.any().optional(),
});

const registrationSchema = z.object({
    name: z.string().min(2, 'Name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    rollNo: z.string().min(1, 'Roll number is required.'),
    phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
    branch: z.string({ required_error: "Please select your branch." }),
    yearOfStudy: z.string({ required_error: "Please select your year of study." }),
});

const teamCategorySchema = z.object({
  name: z.string({ required_error: "Please select a main category." }),
  subDomain: z.string().min(2, "Sub-domain name is required."),
  order: z.coerce.number().min(0, "Order must be a positive number."),
});

const teamMemberSchema = z.object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("A valid email is required."),
    role: z.string().min(2, "Role is required."),
    categoryId: z.string({ required_error: "Please select a category." }),
});

const teamMemberUpdateSchema = teamMemberSchema.extend({
    image: z.any().optional(),
    linkedin: z.string().url("A valid LinkedIn URL is required.").or(z.literal('')),
});


const completeOnboardingSchema = z.object({
    token: z.string(),
    image: z.any().optional(),
    linkedin: z.string().url("LinkedIn URL is required."),
});

const userProfileUpdateSchema = z.object({
    previousRepresentations: z.string().optional(),
    receiveEmailUpdates: z.boolean().default(false),
});


export async function createUserProfile(user: User) {
    const userRef = doc(db, 'users', user.uid);
    const userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        phone: user.phoneNumber,
    };
    // Use set with merge:true to create or update the document without overwriting existing fields
    await setDoc(userRef, userData, { merge: true });
}

export async function updateUserProfile(userId: string, data: z.infer<typeof userProfileUpdateSchema>) {
    const parsed = userProfileUpdateSchema.safeParse(data);
    if (!parsed.success) {
        return { error: 'Invalid profile data.' };
    }
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, parsed.data);
        return { success: true };
    } catch (e) {
        if (e instanceof Error) {
            return { error: e.message };
        }
        return { error: 'An unknown error occurred while updating the profile.' };
    }
}


export async function getVisitors() {
    try {
        const visitorsCol = collection(db, 'visitors');
        const q = query(visitorsCol, orderBy('timestamp', 'desc'), limit(100)); // Limit to last 100 for performance
        const visitorsSnapshot = await getDocs(q);
        const visitorsList = visitorsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
            }
        });
        return { visitors: visitorsList as any[] };
    } catch (error) {
        console.error("Could not fetch visitors:", error);
        if (error instanceof Error) {
            return { error: `Failed to fetch visitors: ${error.message}` };
        }
        return { error: 'An unexpected error occurred while fetching visitors.' };
    }
}


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
    const rollNo_lowercase = applicationData.rollNo.toLowerCase();
    const name_lowercase = applicationData.name.toLowerCase();

    // Check for existing email
    const emailQuery = query(applicationsRef, where("email", "==", applicationData.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return { error: 'An application with this email address already exists.' };
    }

    // Check for existing roll number
    const rollNoQuery = query(applicationsRef, where("rollNo_lowercase", "==", rollNo_lowercase));
    const rollNoSnapshot = await getDocs(rollNoQuery);
    if (!rollNoSnapshot.empty) {
      return { error: 'An application with this roll number already exists.' };
    }

    const newApplication = {
      id: referenceId, // Use reference ID as a field
      submittedAt: new Date().toISOString(),
      ...applicationData,
      rollNo_lowercase,
      name_lowercase,
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

    // Send confirmation email in background
     (async () => {
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
    })();
    
    // Process resume and return result to user
    let summaryResult = null;
    if (file && file.size > 0) {
      try {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const resumeDataUri = `data:${file.type};base64,${base64}`;

        const summarizationInput: SummarizeResumeInput = {resumeDataUri};
        const result = await summarizeResume(summarizationInput);
        
        if (docRef) {
            await updateDoc(docRef, { resumeSummary: result.summary });
            summaryResult = result.summary;
            console.log(`Successfully generated summary for ${referenceId}`);
        }
      } catch (aiError) {
          console.error(`AI summarization failed for ${referenceId}:`, aiError);
          summaryResult = "AI summary generation failed. We'll process your resume manually.";
          if (docRef) {
              await updateDoc(docRef, { resumeSummary: "AI summary failed." });
          }
      }
    }


    return { summary: summaryResult, referenceId };
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

export async function internalRegister(values: z.infer<typeof internalApplicationSchema>) {
  const parsed = internalApplicationSchema.safeParse(values);

  if (!parsed.success) {
    console.error('Internal form validation failed:', parsed.error.flatten().fieldErrors);
    return { error: 'Invalid form data. Please check your inputs.' };
  }

  const applicationData = parsed.data;
  const referenceId = generateReferenceId();

  try {
    const applicationsRef = collection(db, "applications");
    const rollNo_lowercase = applicationData.rollNo.toLowerCase();
    const name_lowercase = applicationData.name.toLowerCase();

    // Check for existing email
    const emailQuery = query(applicationsRef, where("email", "==", applicationData.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return { error: 'An application with this email address already exists.' };
    }

    // Check for existing roll number
    const rollNoQuery = query(applicationsRef, where("rollNo_lowercase", "==", rollNo_lowercase));
    const rollNoSnapshot = await getDocs(rollNoQuery);
    if (!rollNoSnapshot.empty) {
      return { error: 'An application with this roll number already exists.' };
    }

    const newApplication = {
      id: referenceId,
      submittedAt: new Date().toISOString(),
      ...applicationData,
      rollNo_lowercase,
      name_lowercase,
      linkedin: applicationData.linkedin || '',
      resumeSummary: 'Manually registered by admin.',
      status: 'Received',
      isRecommended: false,
      interviewAttended: false,
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
      remarks: 'Manually registered by admin.',
      // Fields not in the internal form
      joinReason: '',
      aboutClub: '',
      anythingElse: '',
    };
    
    const docRef = await addDoc(applicationsRef, { ...newApplication });
    await updateDoc(docRef, { firestoreId: docRef.id });

    return { referenceId };
  } catch (error) {
    console.error('Error during internal registration:', error);
    if (error instanceof Error) {
      return {
        error: `An error occurred during registration: ${error.message}`,
      };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Helper function to build the base query from filters
function buildFilteredQuery(params: {
  panelDomain?: string;
  search?: string;
  searchBy?: string;
  status?: string;
  year?: string;
  branch?: string;
  domain?: string;
  attendedOnly?: boolean;
  sortByRecommended?: string; // Add sortByRecommended here
}) {
  const { panelDomain, search, searchBy, status, year, branch, domain, attendedOnly, sortByRecommended } = params;
  let q: Query<DocumentData> = collection(db, 'applications');
  const constraints: QueryConstraint[] = [];

  // Panel admin is locked to their domain
  if (panelDomain) {
    constraints.push(where('technicalDomain', '==', panelDomain));
  } else if (domain) {
    constraints.push(where('technicalDomain', '==', domain));
  }
  
  if (status && status !== 'all') {
    constraints.push(where('status', '==', status));
  }
  if (year) constraints.push(where('yearOfStudy', '==', year));
  if (branch) constraints.push(where('branch', '==', branch));
  if (attendedOnly) constraints.push(where('interviewAttended', '==', true));
  if (sortByRecommended === 'true') {
    constraints.push(where('isRecommended', '==', true));
  }
  
  if (search) {
      const searchTermLower = search.toLowerCase();
      const searchField = searchBy === 'name' ? 'name_lowercase' : 'rollNo_lowercase';
      // Use exact match for searching
      constraints.push(where(searchField, '==', searchTermLower));
  }


  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  return q;
}


export async function getApplications(params: {
  panelDomain?: string;
  search?: string;
  searchBy?: string;
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
  const { search, sortByPerformance, sortByRecommended, page = '1', limit: limitStr = '10', lastVisibleId, fetchAll = false } = params;
  const limitNumber = parseInt(limitStr, 10);
  
  let baseQuery = buildFilteredQuery(params);
  let finalQuery: Query<DocumentData>;

  const sortConstraints: QueryConstraint[] = [];

  // Apply sorting logic
  if (sortByRecommended === 'true') {
    sortConstraints.push(orderBy('ratings.overall', 'desc'));
  } else if (sortByPerformance === 'true') {
    sortConstraints.push(orderBy('ratings.overall', 'desc'));
  } else {
    // Default sort order when no specific sort is applied
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
  
  // For pagination, we fetch one more than the limit to see if there's a next page
  const paginatedQuery = query(finalQuery, limit(limitNumber + 1));
  let queryWithCursor = paginatedQuery;

  if (page && parseInt(page, 10) > 1 && lastVisibleId) {
      const lastVisibleDoc = await getDoc(doc(db, 'applications', lastVisibleId));
      if (lastVisibleDoc.exists()) {
        queryWithCursor = query(paginatedQuery, startAfter(lastVisibleDoc));
      }
  }

  const querySnapshot = await getDocs(queryWithCursor);
  const applications = querySnapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));

  const hasNextPage = applications.length > limitNumber;
  // Remove the extra document we fetched for the check
  if (hasNextPage) {
    applications.pop();
  }

  return {
    applications,
    hasNextPage,
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
    let originalStatus = '';
    let applicantInfo: { name: string; email: string; } | null = null;
    
    await runTransaction(db, async (transaction) => {
      const applicationQueryResult = await getDocs(query(collection(db, 'applications'), where('id', '==', id), limit(1)));
      if (applicationQueryResult.empty) {
        throw new Error('Application not found.');
      }
      
      const appDocRef = applicationQueryResult.docs[0].ref;
      const appData = applicationQueryResult.docs[0].data();
      
      originalStatus = appData.status;
      applicantInfo = { name: appData.name, email: appData.email };

      // Automated status update logic
      if (reviewData.isRecommended) {
        reviewData.status = 'Recommended';
      }

      transaction.update(appDocRef, {
        status: reviewData.status,
        isRecommended: reviewData.isRecommended,
        suitability: reviewData.suitability,
        ratings: reviewData.ratings,
        remarks: reviewData.remarks,
      });
    });

    // Send email only if the status has changed
    if (applicantInfo && reviewData.status !== originalStatus) {
      // Do not await this, let it run in the background
      sendStatusUpdateEmail({
        name: applicantInfo.name,
        email: applicantInfo.email,
        status: reviewData.status,
        referenceId: id,
      }).catch(emailError => {
        console.error(`Failed to send status update email for ${id} after manual review:`, emailError);
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving review:', error);
    if (error instanceof Error) {
      if (error.message.includes('contention')) {
        return { error: 'This application was updated by someone else. Please refresh and try again.' };
      }
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
  
  const secret = new TextEncoder().encode(JWT_SECRET);

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

  const token = await new jose.SignJWT(userPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);

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
  searchBy?: string;
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
      return { success: true, updatedCount: 0, sentEmailCount: 0 };
    }

    const batch = writeBatch(db);
    const applicantsToEmail: StatusUpdateEmailInput[] = [];

    querySnapshot.docs.forEach(documentSnapshot => {
      const data = documentSnapshot.data();
      if (data.status !== newStatus) {
        batch.update(documentSnapshot.ref, { status: newStatus });
        applicantsToEmail.push({
          name: data.name,
          email: data.email,
          status: newStatus,
          referenceId: data.id,
        });
      }
    });
    
    await batch.commit();

    // After successfully committing the batch, send emails in the background.
    // Do not await this so the UI returns immediately.
    (async () => {
      let sentCount = 0;
      for (const applicant of applicantsToEmail) {
        try {
          await sendStatusUpdateEmail(applicant);
          sentCount++;
        } catch (emailError) {
          console.error(`Failed to send status update email to ${applicant.email}:`, emailError);
        }
      }
      console.log(`Successfully sent ${sentCount} out of ${applicantsToEmail.length} status update emails.`);
    })();

    return { success: true, updatedCount: querySnapshot.size, sentEmailCount: applicantsToEmail.length };
  } catch (error) {
    console.error('Error during bulk update:', error);
    if (error instanceof Error) {
      return { error: `Bulk update failed: ${error.message}` };
    }
    return { error: 'An unexpected error occurred during bulk update.' };
  }
}

export async function bulkUpdateFromCsv(hiredCandidates: { rollNo: string }[]) {
  if (!hiredCandidates || hiredCandidates.length === 0) {
    return { error: "The CSV file is empty or invalid." };
  }

  const hiredRollNos = new Set(hiredCandidates.map(c => c.rollNo.toLowerCase()));
  
  try {
    const applicationsRef = collection(db, 'applications');
    const allApplicationsSnapshot = await getDocs(applicationsRef);
    
    const batch = writeBatch(db);
    const applicantsToEmail: StatusUpdateEmailInput[] = [];
    const membersToInvite: { email: string, name: string, role: string, categoryId: string }[] = [];
    
    // Find the default "Technical Team" category
    const categoriesRef = collection(db, 'teamCategories');
    const q = query(categoriesRef, where('name', '==', 'Technical Team'), limit(1));
    const categorySnapshot = await getDocs(q);
    const defaultCategoryId = !categorySnapshot.empty ? categorySnapshot.docs[0].id : null;

    if (!defaultCategoryId) {
      console.warn("Default 'Technical Team' category not found. Hired members won't be assigned a category.");
    }

    for (const doc of allApplicationsSnapshot.docs) {
      const app = doc.data();
      const isHired = hiredRollNos.has(app.rollNo_lowercase);
      
      if (isHired) {
        if (app.status !== 'Hired') {
          batch.update(doc.ref, { status: 'Hired' });
          if (defaultCategoryId) {
            membersToInvite.push({
              name: app.name,
              email: app.email,
              role: 'Team Member',
              categoryId: defaultCategoryId
            });
          }
        }
      } else {
        if (app.status !== 'Hired' && app.status !== 'Rejected') {
          batch.update(doc.ref, { status: 'Rejected' });
          applicantsToEmail.push({
            name: app.name,
            email: app.email,
            status: 'Rejected',
            referenceId: app.id,
          });
        }
      }
    }

    await batch.commit();

    // Send emails in the background
    (async () => {
      // Invite Hired Members
      for (const member of membersToInvite) {
        try {
          await inviteTeamMember(member);
        } catch (inviteError) {
          console.error(`Failed to invite team member ${member.email}:`, inviteError);
        }
      }
      
      // Notify Rejected Applicants
      for (const applicant of applicantsToEmail) {
        try {
          await sendStatusUpdateEmail(applicant);
        } catch (emailError) {
          console.error(`Failed to send status update email to ${applicant.email}:`, emailError);
        }
      }
    })();
    
    return { success: true, updatedCount: applicantsToEmail.length + membersToInvite.length };

  } catch (error) {
    console.error('Error during bulk update from CSV:', error);
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


export async function getAnalyticsData(panelDomain?: string) {
  try {
    const constraints: QueryConstraint[] = [];
    if (panelDomain) {
      constraints.push(where('technicalDomain', '==', panelDomain));
    }
    
    const applicationsRef = collection(db, 'applications');
    const baseQuery = query(applicationsRef, ...constraints);

    // 1. Get total applications count for the scope
    const totalSnapshot = await getCountFromServer(baseQuery);
    const totalApplications = totalSnapshot.data().count;

    // 2. Get attended interviews count for the scope
    const attendedQuery = query(baseQuery, where('interviewAttended', '==', true));
    const attendedSnapshot = await getCountFromServer(attendedQuery);
    const attendedCount = attendedSnapshot.data().count;
    
    // 3. Get all applications within the scope to aggregate various counts
    const allApplicationsSnapshot = await getDocs(baseQuery);
    const applications = allApplicationsSnapshot.docs.map(doc => doc.data());

    // 4. Calculate various counts
    const techDomainCounts: { [key: string]: number } = {};
    const nonTechDomainCounts: { [key: string]: number } = {};
    const statusCounts: { [key: string]: number } = {};
    const branchCounts: { [key: string]: number } = {};
    const yearCounts: { [key: string]: number } = {};
    let hiredCount = 0;
    let rejectedCount = 0;

    const techDomainLabels: Record<string, string> = {
      gen_ai: "Generative AI",
      ds_ml: "Data Science & ML",
      azure: "Azure Cloud",
      web_app: "Web & App Development",
    };
    
    const nonTechDomainLabels: Record<string, string> = {
        event_management: "Event Management",
        public_relations: "Public Relations",
        media_marketing: "Media Marketing",
        creativity: "Creativity",
    };

    applications.forEach(app => {
      // Status
      const status = app.status || 'Received';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (status === 'Hired') hiredCount++;
      if (status === 'Rejected') rejectedCount++;

      // Technical Domain
      const techDomainKey = app.technicalDomain;
      const techDomainName = techDomainLabels[techDomainKey] || techDomainKey;
      if (techDomainName) {
        techDomainCounts[techDomainName] = (techDomainCounts[techDomainName] || 0) + 1;
      }
      
      // Non-Technical Domain
      const nonTechDomainKey = app.nonTechnicalDomain;
      const nonTechDomainName = nonTechDomainLabels[nonTechDomainKey] || nonTechDomainKey;
      if (nonTechDomainName) {
          nonTechDomainCounts[nonTechDomainName] = (nonTechDomainCounts[nonTechDomainName] || 0) + 1;
      }

      // Branch
      const branch = app.branch || 'Unknown';
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
      // Year
      const year = app.yearOfStudy || 'Unknown';
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const techDomainData = Object.entries(techDomainCounts).map(([name, count]) => ({ name, count }));
    const nonTechDomainData = Object.entries(nonTechDomainCounts).map(([name, count]) => ({ name, count }));
    const statusData = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));
    const branchData = Object.entries(branchCounts).map(([name, count]) => ({ name, count }));
    const yearData = Object.entries(yearCounts).map(([name, count]) => ({ name, count }));

    return {
      totalApplications,
      attendedCount,
      hiredCount,
      rejectedCount,
      techDomainData,
      nonTechDomainData,
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

export async function getInterviewAnalyticsData() {
  try {
    const applicationsRef = collection(db, 'applications');
    // Base query is now filtered for attended interviews
    const baseQuery = query(applicationsRef, where('interviewAttended', '==', true));

    // 1. Get total applications count for the scope (which is already attended)
    const totalSnapshot = await getCountFromServer(baseQuery);
    const totalApplications = totalSnapshot.data().count; // This is the total number of attended interviews
    
    // 2. Get all applications within the scope to aggregate various counts
    const allApplicationsSnapshot = await getDocs(baseQuery);
    const applications = allApplicationsSnapshot.docs.map(doc => doc.data());

    // 3. Calculate various counts
    const techDomainCounts: { [key: string]: number } = {};
    const nonTechDomainCounts: { [key: string]: number } = {};
    const statusCounts: { [key: string]: number } = {};
    const branchCounts: { [key: string]: number } = {};
    const yearCounts: { [key: string]: number } = {};
    let hiredCount = 0;
    let rejectedCount = 0;

    const techDomainLabels: Record<string, string> = {
      gen_ai: "Generative AI",
      ds_ml: "Data Science & ML",
      azure: "Azure Cloud",
      web_app: "Web & App Development",
    };
    
    const nonTechDomainLabels: Record<string, string> = {
        event_management: "Event Management",
        public_relations: "Public Relations",
        media_marketing: "Media Marketing",
        creativity: "Creativity",
    };

    applications.forEach(app => {
      // Status
      const status = app.status || 'Received';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (status === 'Hired') hiredCount++;
      if (status === 'Rejected') rejectedCount++;

      // Technical Domain
      const techDomainKey = app.technicalDomain;
      const techDomainName = techDomainLabels[techDomainKey] || techDomainKey;
      if (techDomainName) {
        techDomainCounts[techDomainName] = (techDomainCounts[techDomainName] || 0) + 1;
      }
      
      // Non-Technical Domain
      const nonTechDomainKey = app.nonTechnicalDomain;
      const nonTechDomainName = nonTechDomainLabels[nonTechDomainKey] || nonTechDomainKey;
      if (nonTechDomainName) {
          nonTechDomainCounts[nonTechDomainName] = (nonTechDomainCounts[nonTechDomainName] || 0) + 1;
      }

      // Branch
      const branch = app.branch || 'Unknown';
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
      // Year
      const year = app.yearOfStudy || 'Unknown';
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const techDomainData = Object.entries(techDomainCounts).map(([name, count]) => ({ name, count }));
    const nonTechDomainData = Object.entries(nonTechDomainCounts).map(([name, count]) => ({ name, count }));
    const statusData = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));
    const branchData = Object.entries(branchCounts).map(([name, count]) => ({ name, count }));
    const yearData = Object.entries(yearCounts).map(([name, count]) => ({ name, count }));

    return {
      totalApplications, // This now represents attended interviews
      attendedCount: totalApplications, // attendedCount is the same as total in this context
      hiredCount,
      rejectedCount,
      techDomainData,
      nonTechDomainData,
      statusData,
      branchData,
      yearData,
    };
    
  } catch (error) {
    console.error("Error fetching interview analytics data:", error);
    if (error instanceof Error) {
      return { error: `Failed to fetch analytics: ${error.message}` };
    }
    return { error: 'An unexpected server error occurred.' };
  }
}

export async function setDeadline(deadline: Date) {
  try {
    const settingsRef = doc(db, 'settings', 'deadline');
    await setDoc(settingsRef, { deadlineTimestamp: deadline.toISOString() });
    return { success: true };
  } catch (error) {
    console.error('Error setting deadline:', error);
    if (error instanceof Error) {
      return { error: `Failed to set deadline: ${error.message}` };
    }
    return { error: 'An unexpected error occurred.' };
  }
}

export async function getDeadline() {
  try {
    const settingsRef = doc(db, 'settings', 'deadline');
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      return { deadlineTimestamp: docSnap.data().deadlineTimestamp };
    }
    return { deadlineTimestamp: null };
  } catch (error) {
    console.error('Error fetching deadline:', error);
    return { deadlineTimestamp: null, error: 'Failed to fetch deadline.' };
  }
}


export async function createEvent(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const imageFile = formData.get('image') as File | null;
    const highlightImageFiles = formData.getAll('highlightImages') as File[];
    const speakerImageFiles = formData.getAll('speakerImage') as File[];

    if (values.date) values.date = new Date(values.date as string);
    if (values.registrationOpen) values.registrationOpen = values.registrationOpen === 'on';

    const speakers = [];
    const speakerNames = formData.getAll('speakerName');
    const speakerTitles = formData.getAll('speakerTitle');
    for (let i = 0; i < speakerNames.length; i++) {
        if (speakerNames[i]) {
            speakers.push({
                name: speakerNames[i] as string,
                title: speakerTitles[i] as string,
                image: speakerImageFiles[i] || null
            });
        }
    }
    values.speakers = speakers as any;

    const parsed = eventFormSchema.omit({ image: true, highlightImages: true }).safeParse(values);
    if (!parsed.success) {
        console.error("Validation error:", parsed.error.flatten());
        return { error: 'Invalid event data.' };
    }
    
    try {
        const docRef = await addDoc(collection(db, 'events'), {
            ...parsed.data,
            speakers: [], // Temp clear
        });
        const eventId = docRef.id;
        
        let imageUrl = "";
        if (imageFile && imageFile.size > 0) {
            const storageRef = ref(storage, `event-images/${eventId}/cover`);
            await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(storageRef);
        }

        const highlightImageUrls: string[] = [];
        for (let i = 0; i < highlightImageFiles.length; i++) {
            const file = highlightImageFiles[i];
            if (file.size > 0) {
                const storageRef = ref(storage, `event-images/${eventId}/highlight_${i}`);
                await uploadBytes(storageRef, file);
                highlightImageUrls.push(await getDownloadURL(storageRef));
            }
        }
        
        const speakersWithImageUrls = await Promise.all(
            (parsed.data.speakers || []).map(async (speaker, index) => {
                const file = speaker.image as File | null;
                let speakerImageUrl = '';
                if (file && file.size > 0) {
                    const storageRef = ref(storage, `event-images/${eventId}/speaker_${index}`);
                    await uploadBytes(storageRef, file);
                    speakerImageUrl = await getDownloadURL(storageRef);
                }
                return { name: speaker.name, title: speaker.title, image: speakerImageUrl };
            })
        );
        
        await updateDoc(docRef, {
            image: imageUrl,
            highlightImages: highlightImageUrls,
            speakers: speakersWithImageUrls,
        });

        return { success: true, id: eventId };
    } catch (error) {
        console.error("Error creating event", error);
        return { error: 'Failed to create event.' };
    }
}


export async function updateEvent(id: string, formData: FormData) {
     const values = Object.fromEntries(formData.entries());
    const imageFile = formData.get('image') as File | null;
    const highlightImageFiles = formData.getAll('highlightImages') as File[];

    if (values.date) values.date = new Date(values.date as string);
    if (values.registrationOpen) values.registrationOpen = values.registrationOpen === 'on';

    const speakers = [];
    const speakerNames = formData.getAll('speakerName');
    const speakerTitles = formData.getAll('speakerTitle');
    const speakerImageFiles = formData.getAll('speakerImage');

    for (let i = 0; i < speakerNames.length; i++) {
        if (speakerNames[i]) {
            speakers.push({
                name: speakerNames[i] as string,
                title: speakerTitles[i] as string,
                image: speakerImageFiles[i] || null
            });
        }
    }
    values.speakers = speakers as any;

    const parsed = eventFormSchema.omit({ image: true, highlightImages: true }).safeParse(values);

    if (!parsed.success) {
        console.log(parsed.error.flatten().fieldErrors)
        return { error: 'Invalid event data.' };
    }
    try {
        const eventDocRef = doc(db, 'events', id);
        const currentEventSnap = await getDoc(eventDocRef);
        const currentEventData = currentEventSnap.data();

        const dataToUpdate: any = { ...parsed.data };
        
        if (imageFile && imageFile.size > 0) {
            const storageRef = ref(storage, `event-images/${id}/cover`);
            await uploadBytes(storageRef, imageFile);
            dataToUpdate.image = await getDownloadURL(storageRef);
        }
        
        if (highlightImageFiles.length > 0 && highlightImageFiles[0].size > 0) {
            const highlightImageUrls: string[] = [];
            for (let i = 0; i < highlightImageFiles.length; i++) {
                const file = highlightImageFiles[i];
                const storageRef = ref(storage, `event-images/${id}/highlight_${Date.now()}_${i}`);
                await uploadBytes(storageRef, file);
                highlightImageUrls.push(await getDownloadURL(storageRef));
            }
            dataToUpdate.highlightImages = [...(currentEventData?.highlightImages || []), ...highlightImageUrls];
        }

         const speakersWithImageUrls = await Promise.all(
            (parsed.data.speakers || []).map(async (speaker, index) => {
                const file = speaker.image as File | null;
                const existingSpeaker = (currentEventData?.speakers || [])[index];
                let speakerImageUrl = existingSpeaker?.image || '';

                if (file && file.size > 0) {
                    const storageRef = ref(storage, `event-images/${id}/speaker_${index}`);
                    await uploadBytes(storageRef, file);
                    speakerImageUrl = await getDownloadURL(storageRef);
                }
                return { name: speaker.name, title: speaker.title, image: speakerImageUrl };
            })
        );
        dataToUpdate.speakers = speakersWithImageUrls;

        await updateDoc(eventDocRef, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to update event.' };
    }
}


export async function deleteEvent(id: string) {
    try {
        await deleteDoc(doc(db, 'events', id));
        // Note: Does not delete subcollections like registrations. 
        // For a production app, a Cloud Function would be needed to handle this.
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete event.' };
    }
}

export async function getEvents() {
    try {
        const eventsCol = collection(db, 'events');
        const q = query(eventsCol, orderBy('date', 'desc'));
        const eventSnapshot = await getDocs(q);
        const eventList = eventSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                date: data.date.toDate().toISOString(),
            }
        });
        return { events: eventList as any[], error: null };
    } catch (error) {
        console.error("Could not fetch events:", error);
        if (error instanceof Error) {
            return { error: `Failed to fetch events: ${error.message}` };
        }
        return { error: 'An unexpected error occurred while fetching events.' };
    }
}


export async function getEventById(id: string) {
    try {
        const eventDoc = await getDoc(doc(db, 'events', id));
        if (!eventDoc.exists()) {
            return { error: 'Event not found.' };
        }
        const data = eventDoc.data();
        const eventData = { 
            ...data,
            id: eventDoc.id,
            date: data.date.toDate().toISOString(),
        };
        return { event: eventData as any };
    } catch (error) {
        return { error: 'Failed to fetch event.' };
    }
}


export async function registerForEvent(eventId: string, values: z.infer<typeof registrationSchema>) {
    const parsed = registrationSchema.safeParse(values);
    if (!parsed.success) {
        return { error: 'Invalid registration data.' };
    }
    
    try {
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
             return { error: 'Event not found.' };
        }
        
        const eventData = eventSnap.data();

        if (!eventData.registrationOpen) {
            return { error: 'Registrations for this event are closed.' };
        }
        
        const registrationsRef = collection(db, 'events', eventId, 'registrations');

        // Check for existing email in this event's registrations
        const emailQuery = query(registrationsRef, where("email", "==", parsed.data.email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
            return { error: 'This email is already registered for this event.' };
        }

        await addDoc(registrationsRef, {
            ...parsed.data,
            registeredAt: new Date().toISOString(),
        });
        
         // Send confirmation email in background
        (async () => {
            try {
                const emailInput: RsvpConfirmationEmailInput = { 
                    name: parsed.data.name,
                    email: parsed.data.email,
                    eventName: eventData.title,
                    eventDate: eventData.date.toDate().toISOString(),
                };
                await sendRsvpConfirmationEmail(emailInput);
            } catch (emailError) {
                console.error(`RSVP Email sending failed for ${parsed.data.email}:`, emailError);
            }
        })();

        return { success: true };

    } catch (error) {
        console.error("Error registering for event:", error);
        return { error: 'An unexpected error occurred during registration.' };
    }
}

export async function getEventRegistrations(eventId: string) {
    try {
        const registrationsCol = collection(db, 'events', eventId, 'registrations');
        const q = query(registrationsCol, orderBy('registeredAt', 'desc'));
        const registrationSnapshot = await getDocs(q);
        const registrationList = registrationSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));
        return { registrations: registrationList as any[] };
    } catch (error) {
        console.error("Error fetching event registrations:", error);
        return { error: 'Could not fetch event registrations.' };
    }
}

export async function exportRegistrationsToCsv(eventId: string) {
    try {
        const { registrations, error } = await getEventRegistrations(eventId);
        if (error) {
            throw new Error(error);
        }

        if (registrations.length === 0) {
            return { error: 'No registrations found to export.' };
        }

        const csv = papaparse.unparse(registrations);
        return { success: true, csvData: csv };

    } catch (error) {
        console.error('Error exporting registrations:', error);
        if (error instanceof Error) {
            return { error: `Export failed: ${error.message}` };
        }
        return { error: 'An unexpected error occurred during export.' };
    }
}


// Team Category Actions
export async function createTeamCategory(values: z.infer<typeof teamCategorySchema>) {
    const parsed = teamCategorySchema.safeParse(values);
    if (!parsed.success) return { error: "Invalid data." };
    try {
        await addDoc(collection(db, 'teamCategories'), parsed.data);
        return { success: true };
    } catch (e) {
        return { error: "Failed to create category." };
    }
}

export async function getTeamCategories() {
    try {
        const q = query(collection(db, 'teamCategories'), orderBy('order'));
        const snapshot = await getDocs(q);
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { categories };
    } catch (e) {
        return { error: "Failed to fetch categories." };
    }
}

export async function getTeamCategoryById(id: string) {
    try {
        const docRef = doc(db, 'teamCategories', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return { error: 'Category not found.' };
        return { category: { id: docSnap.id, ...docSnap.data() } };
    } catch (e) {
        return { error: 'Failed to fetch category.' };
    }
}

export async function updateTeamCategory(id: string, values: z.infer<typeof teamCategorySchema>) {
    const parsed = teamCategorySchema.safeParse(values);
    if (!parsed.success) return { error: "Invalid data." };
    try {
        await updateDoc(doc(db, 'teamCategories', id), parsed.data as any);
        return { success: true };
    } catch (e) {
        return { error: "Failed to update category." };
    }
}

export async function deleteTeamCategory(id: string) {
    try {
        // You might want to check if any team members are using this category first
        await deleteDoc(doc(db, 'teamCategories', id));
        return { success: true };
    } catch (e) {
        return { error: "Failed to delete category." };
    }
}

// Team Member Actions
export async function inviteTeamMember(values: z.infer<typeof teamMemberSchema>) {
    const parsed = teamMemberSchema.safeParse(values);
    if (!parsed.success) return { error: "Invalid data provided." };

    const { email, name, role, categoryId } = parsed.data;

    try {
        // Check if member with this email already exists
        const q = query(collection(db, 'teamMembers'), where('email', '==', email));
        const existing = await getDocs(q);
        if (!existing.empty) {
            return { error: "A team member with this email already exists." };
        }

        const onboardingToken = randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token valid for 24 hours

        const newMemberData = {
            ...parsed.data,
            status: 'pending',
            onboardingToken,
            tokenExpiresAt: tokenExpiresAt.toISOString(),
            image: '', // To be filled by the user
            linkedin: '', // To be filled by the user
        };

        await addDoc(collection(db, 'teamMembers'), newMemberData);

        // Send invitation email
        (async () => {
            try {
                const emailInput: InvitationEmailInput = {
                    name,
                    email,
                    role,
                    onboardingToken,
                };
                await sendInvitationEmail(emailInput);
            } catch (emailError) {
                console.error(`Invitation email sending failed for ${email}:`, emailError);
                // Even if email fails, the member is in the DB. This could be handled with a retry queue.
            }
        })();
        
        return { success: true };
    } catch (e) {
        console.error("Error inviting team member:", e);
        return { error: "Failed to invite team member." };
    }
}

export async function resendInvitation(memberId: string) {
    try {
        const memberDocRef = doc(db, 'teamMembers', memberId);
        const memberDoc = await getDoc(memberDocRef);
        if (!memberDoc.exists()) {
            return { error: "Team member not found." };
        }
        const member = memberDoc.data();

        if (member.status !== 'pending') {
            return { error: "This member is already active. Use the 'Send Edit Link' option instead." };
        }

        const onboardingToken = randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await updateDoc(memberDocRef, {
            onboardingToken,
            tokenExpiresAt: tokenExpiresAt.toISOString(),
            status: 'pending',
        });

        // Send invitation email with the new token
        await sendInvitationEmail({
            name: member.name,
            email: member.email,
            role: member.role,
            onboardingToken,
        });

        return { success: true };
    } catch (error) {
        console.error("Error resending invitation:", error);
        return { error: "Failed to resend invitation email." };
    }
}

export async function sendProfileEditLink(memberId: string) {
    try {
        const memberDocRef = doc(db, 'teamMembers', memberId);
        const memberDoc = await getDoc(memberDocRef);

        if (!memberDoc.exists()) {
            return { error: "Team member not found." };
        }
        const member = { id: memberDoc.id, ...memberDoc.data() };

        if (member.status !== 'active') {
             return { error: "Cannot send edit link to a pending member. Please resend their invitation instead." };
        }

        // Send profile confirmation/edit email
        await sendProfileConfirmationEmail({
            name: member.name,
            email: member.email,
            memberId: member.id,
            editLink: `https://mlscsvec.in/profile/edit/${member.id}`,
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending profile edit link:", error);
        return { error: "Failed to send profile edit link email." };
    }
}

export async function bulkResendInvitations() {
    try {
        const q = query(collection(db, 'teamMembers'), where('status', '==', 'pending'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: true, count: 0 };
        }

        const batch = writeBatch(db);
        let count = 0;

        for (const memberDoc of snapshot.docs) {
            const member = memberDoc.data();
            const onboardingToken = randomBytes(32).toString('hex');
            const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            batch.update(memberDoc.ref, {
                onboardingToken,
                tokenExpiresAt: tokenExpiresAt.toISOString(),
            });

            await sendInvitationEmail({
                name: member.name,
                email: member.email,
                role: member.role,
                onboardingToken,
            });
            count++;
        }

        await batch.commit();
        return { success: true, count };
    } catch (error) {
        console.error("Error bulk resending invitations:", error);
        return { error: "Failed to resend all invitations." };
    }
}

export async function bulkSendProfileEditLinks() {
    try {
        const q = query(collection(db, 'teamMembers'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: true, count: 0 };
        }

        let count = 0;
        for (const memberDoc of snapshot.docs) {
            const member = { id: memberDoc.id, ...memberDoc.data() };
            await sendProfileConfirmationEmail({
                name: member.name,
                email: member.email,
                memberId: member.id,
                editLink: `https://mlscsvec.in/profile/edit/${member.id}`,
            });
            count++;
        }
        
        return { success: true, count };
    } catch (error) {
        console.error("Error bulk sending edit links:", error);
        return { error: "Failed to send all edit links." };
    }
}



export async function updateTeamMember(id: string, formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const imageFile = formData.get('image') as File | null;

    const updatePayloadSchema = teamMemberUpdateSchema.omit({ image: true });
    const parsed = updatePayloadSchema.safeParse(values);

    if (!parsed.success) {
        console.error("Update validation error:", parsed.error.flatten().fieldErrors);
        return { error: "Invalid data provided." };
    }

    try {
        const docRef = doc(db, "teamMembers", id);
        const dataToUpdate: any = parsed.data;

        if (imageFile && imageFile.size > 0) {
            const storageRef = ref(storage, `profile-images/${id}`);
            const imageBuffer = await imageFile.arrayBuffer();
            await uploadBytes(storageRef, imageBuffer, { contentType: imageFile.type });
            dataToUpdate.image = await getDownloadURL(storageRef);
        }

        await updateDoc(docRef, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error updating team member:", error);
        if (error instanceof Error) {
            return { error: `Failed to update team member: ${error.message}` };
        }
        return { error: "Failed to update team member." };
    }
}


export async function getTeamMemberByToken(token: string) {
    try {
        const q = query(
            collection(db, 'teamMembers'),
            where('onboardingToken', '==', token)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { error: "Invalid onboarding link." };
        }
        
        const memberDoc = snapshot.docs[0];
        const member = { id: memberDoc.id, ...memberDoc.data() };
        
        if (member.status !== 'pending') {
            return { error: "This invitation has already been used." };
        }

        const now = new Date();
        const expiresAt = new Date(member.tokenExpiresAt);
        
        if (now > expiresAt) {
            return { error: "This onboarding link has expired." };
        }
        
        return { member };
    } catch (e) {
        console.error("Error fetching member by token:", e);
        return { error: "Failed to validate onboarding link." };
    }
}

export async function completeOnboarding(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const imageFile = formData.get('image') as File;

    const parsed = completeOnboardingSchema.omit({ image: true }).safeParse(values);
    if (!parsed.success) {
        return { error: "Invalid data provided." };
    }

    const { token, linkedin } = parsed.data;

    try {
        const { member, error } = await getTeamMemberByToken(token);
        if (error || !member) {
            return { error: error || "Failed to validate token." };
        }

        // Upload image to Firebase Storage
        const storageRef = ref(storage, `profile-images/${member.id}`);
        const imageBuffer = await imageFile.arrayBuffer();
        await uploadBytes(storageRef, imageBuffer, { contentType: imageFile.type });
        const imageUrl = await getDownloadURL(storageRef);

        const updatedMemberData = {
            image: imageUrl,
            linkedin,
            status: 'active',
            onboardingToken: '', // Clear the token after use
            tokenExpiresAt: '',
        };

        await updateDoc(doc(db, 'teamMembers', member.id), updatedMemberData);

        const updatedMember = { ...member, ...updatedMemberData };

        // Send confirmation email with edit link
        (async () => {
            try {
                const emailInput: ProfileConfirmationEmailInput = {
                    name: updatedMember.name,
                    email: updatedMember.email,
                    memberId: member.id,
                    editLink: `https://mlscsvec.in/profile/edit/${member.id}`,
                };
                await sendProfileConfirmationEmail(emailInput);
            } catch (emailError) {
                console.error(`Profile confirmation email sending failed for ${updatedMember.email}:`, emailError);
            }
        })();

        return { success: true, member: updatedMember };
    } catch (e) {
        console.error("Error completing onboarding:", e);
        return { error: "Failed to activate profile." };
    }
}


export async function getTeamMembers() {
    try {
        const teamMembersQuery = query(collection(db, 'teamMembers'), where('status', '==', 'active'));
        const teamMembersSnapshot = await getDocs(teamMembersQuery);
        const teamMembers = teamMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const teamCategoriesQuery = query(collection(db, 'teamCategories'), orderBy('order'));
        const teamCategoriesSnapshot = await getDocs(teamCategoriesQuery);
        const teamCategoriesData = teamCategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const membersByCategory = teamCategoriesData.map(category => ({
            ...category,
            members: teamMembers.filter(member => member.categoryId === category.id)
        }));

        return { membersByCategory: membersByCategory as any[], error: null };
    } catch (e) {
        console.error("Error fetching team members:", e);
        if (e instanceof Error) {
            return { error: `Failed to fetch team members: ${e.message}`, membersByCategory: [] };
        }
        return { error: 'An unexpected server error occurred.', membersByCategory: [] };
    }
}

export async function getAllTeamMembersWithCategory() {
    try {
        const membersSnapshot = await getDocs(collection(db, "teamMembers"));
        const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const categoriesSnapshot = await getDocs(collection(db, "teamCategories"));
        const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, subDomain: doc.data().subDomain }));
        const categoryMap = new Map(categories.map(c => [c.id, {name: c.name, subDomain: c.subDomain}]));

        const membersWithCategoryName = members.map(member => ({
            ...member,
            categoryName: categoryMap.get(member.categoryId)?.name || 'Uncategorized',
            subDomain: categoryMap.get(member.categoryId)?.subDomain || 'N/A',
        }));
        
        return { members: membersWithCategoryName };
    } catch (e) {
        return { error: "Failed to fetch team members." };
    }
}

export async function getTeamMemberById(id: string) {
    try {
        const docRef = doc(db, 'teamMembers', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return { error: 'Team member not found.' };
        return { member: { id: docSnap.id, ...docSnap.data() } };
    } catch (e) {
        return { error: 'Failed to fetch team member.' };
    }
}


export async function deleteTeamMember(id: string) {
    try {
        // First, try to delete the image from storage.
        const storageRef = ref(storage, `profile-images/${id}`);
        try {
            await deleteObject(storageRef);
        } catch (storageError: any) {
            // It's okay if the image doesn't exist.
            if (storageError.code !== 'storage/object-not-found') {
                console.warn(`Could not delete profile image for member ${id}:`, storageError);
            }
        }
        
        // Then, delete the member document from Firestore.
        await deleteDoc(doc(db, 'teamMembers', id));
        return { success: true };
    } catch (e) {
        console.error("Error deleting team member:", e);
        if (e instanceof Error) {
            return { error: `Failed to delete team member: ${e.message}` };
        }
        return { error: "Failed to delete team member." };
    }
}
