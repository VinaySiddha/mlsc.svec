
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
import { adminDb, adminStorage } from '@/lib/firebase-admin';
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
  writeBatch,
  Query,
  DocumentData,
  QueryConstraint,
  runTransaction,
  setDoc,
  deleteDoc,
  getCountFromServer
} from 'firebase-admin/firestore';
import { getDownloadURL } from 'firebase-admin/storage';
import papaparse from 'papaparse';
import { randomBytes } from 'crypto';


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

export async function getVisitors() {
    try {
        const visitorsCol = adminDb.collection('visitors');
        const q = query(visitorsCol, orderBy('timestamp', 'desc'), limit(100)); // Limit to last 100 for performance
        const visitorsSnapshot = await q.get();
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
    const applicationsRef = adminDb.collection("applications");
    const rollNo_lowercase = applicationData.rollNo.toLowerCase();
    const name_lowercase = applicationData.name.toLowerCase();

    // Check for existing email
    const emailQuery = query(applicationsRef, where("email", "==", applicationData.email));
    const emailSnapshot = await emailQuery.get();
    if (!emailSnapshot.empty) {
      return { error: 'An application with this email address already exists.' };
    }

    // Check for existing roll number
    const rollNoQuery = query(applicationsRef, where("rollNo_lowercase", "==", rollNo_lowercase));
    const rollNoSnapshot = await rollNoQuery.get();
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
    docRef = await applicationsRef.add({ ...newApplication });
    await docRef.update({ firestoreId: docRef.id });

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
            await docRef.update({ resumeSummary: result.summary });
            summaryResult = result.summary;
            console.log(`Successfully generated summary for ${referenceId}`);
        }
      } catch (aiError) {
          console.error(`AI summarization failed for ${referenceId}:`, aiError);
          summaryResult = "AI summary generation failed. We'll process your resume manually.";
          if (docRef) {
              await docRef.update({ resumeSummary: "AI summary failed." });
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
    const applicationsRef = adminDb.collection("applications");
    const rollNo_lowercase = applicationData.rollNo.toLowerCase();
    const name_lowercase = applicationData.name.toLowerCase();

    // Check for existing email
    const emailQuery = query(applicationsRef, where("email", "==", applicationData.email));
    const emailSnapshot = await emailQuery.get();
    if (!emailSnapshot.empty) {
      return { error: 'An application with this email address already exists.' };
    }

    // Check for existing roll number
    const rollNoQuery = query(applicationsRef, where("rollNo_lowercase", "==", rollNo_lowercase));
    const rollNoSnapshot = await rollNoQuery.get();
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
    
    const docRef = await applicationsRef.add({ ...newApplication });
    await docRef.update({ firestoreId: docRef.id });

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
  let q: Query = adminDb.collection('applications');

  if (panelDomain) {
    q = q.where('technicalDomain', '==', panelDomain);
  } else if (domain) {
    q = q.where('technicalDomain', '==', domain);
  }
  
  if (status && status !== 'all') {
    q = q.where('status', '==', status);
  }
  if (year) q = q.where('yearOfStudy', '==', year);
  if (branch) q = q.where('branch', '==', branch);
  if (attendedOnly) q = q.where('interviewAttended', '==', true);
  if (sortByRecommended === 'true') {
    q = q.where('isRecommended', '==', true);
  }
  
  if (search) {
      const searchTermLower = search.toLowerCase();
      const searchField = searchBy === 'name' ? 'name_lowercase' : 'rollNo_lowercase';
      q = q.where(searchField, '==', searchTermLower);
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

  // Apply sorting logic
  if (sortByRecommended === 'true') {
    baseQuery = baseQuery.orderBy('ratings.overall', 'desc');
  } else if (sortByPerformance === 'true') {
    baseQuery = baseQuery.orderBy('ratings.overall', 'desc');
  } else {
    // Default sort order when no specific sort is applied
    baseQuery = baseQuery.orderBy('submittedAt', 'desc');
  }

  // If fetchAll is true, bypass pagination and get all documents
  if (fetchAll) {
    const querySnapshot = await baseQuery.get();
    const applications = querySnapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
    return {
      applications,
      totalApplications: applications.length,
      totalPages: 1,
      currentPage: 1,
    };
  }
  
  let paginatedQuery = baseQuery.limit(limitNumber + 1);
  let queryWithCursor = paginatedQuery;

  if (page && parseInt(page, 10) > 1 && lastVisibleId) {
      const lastVisibleDoc = await adminDb.collection('applications').doc(lastVisibleId).get();
      if (lastVisibleDoc.exists) {
        queryWithCursor = paginatedQuery.startAfter(lastVisibleDoc);
      }
  }

  const querySnapshot = await queryWithCursor.get();
  const applications = querySnapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));

  const hasNextPage = applications.length > limitNumber;
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
    const q = query(adminDb.collection('applications'), where('id', '==', id), limit(1));
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
        return null;
    }
    const docSnap = querySnapshot.docs[0];
    return { firestoreId: docSnap.id, ...docSnap.data() };
}

export async function getPanels() {
  try {
    const panelsCol = adminDb.collection('panels');
    const panelSnapshot = await panelsCol.get();
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
    
    await adminDb.runTransaction(async (transaction) => {
      const applicationQueryResult = await transaction.get(query(adminDb.collection('applications'), where('id', '==', id), limit(1)));
      if (applicationQueryResult.empty) {
        throw new Error('Application not found.');
      }
      
      const appDocRef = applicationQueryResult.docs[0].ref;
      const appData = applicationQueryResult.docs[0].data();
      
      originalStatus = appData.status;
      applicantInfo = { name: appData.name, email: appData.email };

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

    if (applicantInfo && reviewData.status !== originalStatus) {
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
    const appDocRef = adminDb.collection('applications').doc(firestoreId);
    await appDocRef.update({
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
    const querySnapshot = await q.get();
    
    if (querySnapshot.empty) {
      return { success: true, updatedCount: 0, sentEmailCount: 0 };
    }

    const batch = adminDb.batch();
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
    const applicationsRef = adminDb.collection('applications');
    const allApplicationsSnapshot = await applicationsRef.get();
    
    const batch = adminDb.batch();
    const applicantsToEmail: StatusUpdateEmailInput[] = [];
    const membersToInvite: { email: string, name: string, role: string, categoryId: string }[] = [];
    
    const categoriesRef = adminDb.collection('teamCategories');
    const q = query(categoriesRef, where('name', '==', 'Technical Team'), limit(1));
    const categorySnapshot = await q.get();
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

    (async () => {
      for (const member of membersToInvite) {
        try {
          await inviteTeamMember(member);
        } catch (inviteError) {
          console.error(`Failed to invite team member ${member.email}:`, inviteError);
        }
      }
      
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
        const q = query(adminDb.collection('applications'), where('status', '==', 'Hired'));
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            return { error: 'No hired candidates found to export.' };
        }

        const hiredData = querySnapshot.docs.map(doc => {
            const data = doc.data();
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
    let baseQuery: Query = adminDb.collection('applications');
    if (panelDomain) {
      baseQuery = baseQuery.where('technicalDomain', '==', panelDomain);
    }
    
    const totalSnapshot = await getCountFromServer(baseQuery);
    const totalApplications = totalSnapshot.data().count;

    const attendedQuery = baseQuery.where('interviewAttended', '==', true);
    const attendedSnapshot = await getCountFromServer(attendedQuery);
    const attendedCount = attendedSnapshot.data().count;
    
    const allApplicationsSnapshot = await baseQuery.get();
    const applications = allApplicationsSnapshot.docs.map(doc => doc.data());

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
      const status = app.status || 'Received';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (status === 'Hired') hiredCount++;
      if (status === 'Rejected') rejectedCount++;

      const techDomainKey = app.technicalDomain;
      const techDomainName = techDomainLabels[techDomainKey] || techDomainKey;
      if (techDomainName) {
        techDomainCounts[techDomainName] = (techDomainCounts[techDomainName] || 0) + 1;
      }
      
      const nonTechDomainKey = app.nonTechnicalDomain;
      const nonTechDomainName = nonTechDomainLabels[nonTechDomainKey] || nonTechDomainKey;
      if (nonTechDomainName) {
          nonTechDomainCounts[nonTechDomainName] = (nonTechDomainCounts[nonTechDomainName] || 0) + 1;
      }

      const branch = app.branch || 'Unknown';
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
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
    const baseQuery = adminDb.collection('applications').where('interviewAttended', '==', true);

    const totalSnapshot = await getCountFromServer(baseQuery);
    const totalApplications = totalSnapshot.data().count;
    
    const allApplicationsSnapshot = await baseQuery.get();
    const applications = allApplicationsSnapshot.docs.map(doc => doc.data());

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
      const status = app.status || 'Received';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (status === 'Hired') hiredCount++;
      if (status === 'Rejected') rejectedCount++;

      const techDomainKey = app.technicalDomain;
      const techDomainName = techDomainLabels[techDomainKey] || techDomainKey;
      if (techDomainName) {
        techDomainCounts[techDomainName] = (techDomainCounts[techDomainName] || 0) + 1;
      }
      
      const nonTechDomainKey = app.nonTechnicalDomain;
      const nonTechDomainName = nonTechDomainLabels[nonTechDomainKey] || nonTechDomainKey;
      if (nonTechDomainName) {
          nonTechDomainCounts[nonTechDomainName] = (nonTechDomainCounts[nonTechDomainName] || 0) + 1;
      }

      const branch = app.branch || 'Unknown';
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
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
      attendedCount: totalApplications,
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
    const settingsRef = adminDb.collection('settings').doc('deadline');
    await settingsRef.set({ deadlineTimestamp: deadline.toISOString() });
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
    const settingsRef = adminDb.collection('settings').doc('deadline');
    const docSnap = await settingsRef.get();

    if (docSnap.exists) {
      return { deadlineTimestamp: docSnap.data()?.deadlineTimestamp };
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
        const docRef = await adminDb.collection('events').add({
            ...parsed.data,
            speakers: [],
        });
        const eventId = docRef.id;
        const bucket = adminStorage.bucket();
        
        let imageUrl = "";
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const filePath = `event-images/${eventId}/cover`;
            const file = bucket.file(filePath);
            await file.save(buffer, { contentType: imageFile.type });
            imageUrl = await getDownloadURL(file);
        }

        const highlightImageUrls: string[] = [];
        for (let i = 0; i < highlightImageFiles.length; i++) {
            const file = highlightImageFiles[i];
            if (file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const filePath = `event-images/${eventId}/highlight_${i}`;
                const fileRef = bucket.file(filePath);
                await fileRef.save(buffer, { contentType: file.type });
                highlightImageUrls.push(await getDownloadURL(fileRef));
            }
        }
        
        const speakersWithImageUrls = await Promise.all(
            (parsed.data.speakers || []).map(async (speaker, index) => {
                const file = speaker.image as File | null;
                let speakerImageUrl = '';
                if (file && file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const filePath = `event-images/${eventId}/speaker_${index}`;
                    const fileRef = bucket.file(filePath);
                    await fileRef.save(buffer, { contentType: file.type });
                    speakerImageUrl = await getDownloadURL(fileRef);
                }
                return { name: speaker.name, title: speaker.title, image: speakerImageUrl };
            })
        );
        
        await docRef.update({
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
        const eventDocRef = adminDb.collection('events').doc(id);
        const currentEventSnap = await eventDocRef.get();
        const currentEventData = currentEventSnap.data();
        const bucket = adminStorage.bucket();

        const dataToUpdate: any = { ...parsed.data };
        
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const filePath = `event-images/${id}/cover`;
            const file = bucket.file(filePath);
            await file.save(buffer, { contentType: imageFile.type });
            dataToUpdate.image = await getDownloadURL(file);
        }
        
        if (highlightImageFiles.length > 0 && highlightImageFiles[0].size > 0) {
            const highlightImageUrls: string[] = [];
            for (let i = 0; i < highlightImageFiles.length; i++) {
                const file = highlightImageFiles[i];
                const buffer = Buffer.from(await file.arrayBuffer());
                const filePath = `event-images/${id}/highlight_${Date.now()}_${i}`;
                const fileRef = bucket.file(filePath);
                await fileRef.save(buffer, { contentType: file.type });
                highlightImageUrls.push(await getDownloadURL(fileRef));
            }
            dataToUpdate.highlightImages = [...(currentEventData?.highlightImages || []), ...highlightImageUrls];
        }

         const speakersWithImageUrls = await Promise.all(
            (parsed.data.speakers || []).map(async (speaker, index) => {
                const file = speaker.image as File | null;
                const existingSpeaker = (currentEventData?.speakers || [])[index];
                let speakerImageUrl = existingSpeaker?.image || '';

                if (file && file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const filePath = `event-images/${id}/speaker_${index}`;
                    const fileRef = bucket.file(filePath);
                    await fileRef.save(buffer, { contentType: file.type });
                    speakerImageUrl = await getDownloadURL(fileRef);
                }
                return { name: speaker.name, title: speaker.title, image: speakerImageUrl };
            })
        );
        dataToUpdate.speakers = speakersWithImageUrls;

        await eventDocRef.update(dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to update event.' };
    }
}


export async function deleteEvent(id: string) {
    try {
        await adminDb.collection('events').doc(id).delete();
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete event.' };
    }
}

export async function getEvents() {
    try {
        const eventsCol = adminDb.collection('events');
        const q = query(eventsCol, orderBy('date', 'desc'));
        const eventSnapshot = await q.get();
        const eventList = eventSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                date: new Date(data.date.toDate()).toISOString(),
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
        const eventDoc = await adminDb.collection('events').doc(id).get();
        if (!eventDoc.exists) {
            return { error: 'Event not found.' };
        }
        const data = eventDoc.data()!;
        const eventData = { 
            ...data,
            id: eventDoc.id,
            date: new Date(data.date.toDate()).toISOString(),
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
        const eventRef = adminDb.collection('events').doc(eventId);
        const eventSnap = await eventRef.get();

        if (!eventSnap.exists) {
             return { error: 'Event not found.' };
        }
        
        const eventData = eventSnap.data()!;

        if (!eventData.registrationOpen) {
            return { error: 'Registrations for this event are closed.' };
        }
        
        const registrationsRef = adminDb.collection('events').doc(eventId).collection('registrations');

        const emailQuery = query(registrationsRef, where("email", "==", parsed.data.email));
        const emailSnapshot = await emailQuery.get();
        if (!emailSnapshot.empty) {
            return { error: 'This email is already registered for this event.' };
        }

        await registrationsRef.add({
            ...parsed.data,
            registeredAt: new Date().toISOString(),
        });
        
        (async () => {
            try {
                const emailInput: RsvpConfirmationEmailInput = { 
                    name: parsed.data.name,
                    email: parsed.data.email,
                    eventName: eventData.title,
                    eventDate: new Date(eventData.date.toDate()).toISOString(),
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
        const registrationsCol = adminDb.collection('events').doc(eventId).collection('registrations');
        const q = query(registrationsCol, orderBy('registeredAt', 'desc'));
        const registrationSnapshot = await q.get();
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
        await adminDb.collection('teamCategories').add(parsed.data);
        return { success: true };
    } catch (e) {
        return { error: "Failed to create category." };
    }
}

export async function getTeamCategories() {
    try {
        const q = query(adminDb.collection('teamCategories'), orderBy('order'));
        const snapshot = await q.get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { categories };
    } catch (e) {
        return { error: "Failed to fetch categories." };
    }
}

export async function getTeamCategoryById(id: string) {
    try {
        const docRef = adminDb.collection('teamCategories').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return { error: 'Category not found.' };
        return { category: { id: docSnap.id, ...docSnap.data() } };
    } catch (e) {
        return { error: 'Failed to fetch category.' };
    }
}

export async function updateTeamCategory(id: string, values: z.infer<typeof teamCategorySchema>) {
    const parsed = teamCategorySchema.safeParse(values);
    if (!parsed.success) return { error: "Invalid data." };
    try {
        await adminDb.collection('teamCategories').doc(id).update(parsed.data as any);
        return { success: true };
    } catch (e) {
        return { error: "Failed to update category." };
    }
}

export async function deleteTeamCategory(id: string) {
    try {
        await adminDb.collection('teamCategories').doc(id).delete();
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
        const q = query(adminDb.collection('teamMembers'), where('email', '==', email));
        const existing = await q.get();
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

        await adminDb.collection('teamMembers').add(newMemberData);

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
        const memberDocRef = adminDb.collection('teamMembers').doc(memberId);
        const memberDoc = await memberDocRef.get();
        if (!memberDoc.exists) {
            return { error: "Team member not found." };
        }
        const member = memberDoc.data()!;

        if (member.status !== 'pending') {
            return { error: "This member is already active. Use the 'Send Edit Link' option instead." };
        }

        const onboardingToken = randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await memberDocRef.update({
            onboardingToken,
            tokenExpiresAt: tokenExpiresAt.toISOString(),
            status: 'pending',
        });

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
        const memberDocRef = adminDb.collection('teamMembers').doc(memberId);
        const memberDoc = await memberDocRef.get();

        if (!memberDoc.exists) {
            return { error: "Team member not found." };
        }
        const member = { id: memberDoc.id, ...memberDoc.data()! };

        if (member.status !== 'active') {
             return { error: "Cannot send edit link to a pending member. Please resend their invitation instead." };
        }

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
        const q = query(adminDb.collection('teamMembers'), where('status', '==', 'pending'));
        const snapshot = await q.get();

        if (snapshot.empty) {
            return { success: true, count: 0 };
        }

        const batch = adminDb.batch();
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
        const q = query(adminDb.collection('teamMembers'), where('status', '==', 'active'));
        const snapshot = await q.get();

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
        const docRef = adminDb.collection("teamMembers").doc(id);
        const dataToUpdate: any = parsed.data;
        const bucket = adminStorage.bucket();

        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const filePath = `profile-images/${id}`;
            const file = bucket.file(filePath);
            await file.save(buffer, { contentType: imageFile.type });
            dataToUpdate.image = await getDownloadURL(file);
        }

        await docRef.update(dataToUpdate);
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
            adminDb.collection('teamMembers'),
            where('onboardingToken', '==', token)
        );
        const snapshot = await q.get();

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

        const bucket = adminStorage.bucket();
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filePath = `profile-images/${member.id}`;
        const file = bucket.file(filePath);
        await file.save(buffer, { contentType: imageFile.type });
        const imageUrl = await getDownloadURL(file);

        const updatedMemberData = {
            image: imageUrl,
            linkedin,
            status: 'active',
            onboardingToken: '',
            tokenExpiresAt: '',
        };

        await adminDb.collection('teamMembers').doc(member.id).update(updatedMemberData);

        const updatedMember = { ...member, ...updatedMemberData };

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
        const teamMembersQuery = query(adminDb.collection('teamMembers'), where('status', '==', 'active'));
        const teamCategoriesQuery = query(adminDb.collection('teamCategories'), orderBy('order'));
        
        const [teamMembersSnapshot, teamCategoriesSnapshot] = await Promise.all([
            teamMembersQuery.get(),
            teamCategoriesQuery.get()
        ]);

        const teamMembers = teamMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const teamCategoriesData = teamCategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (teamCategoriesData.length === 0) {
            return { membersByCategory: [], error: null };
        }

        const membersByCategory = teamCategoriesData.map(category => {
            const members = teamMembers.filter(member => member.categoryId === category.id);
            return { ...category, members };
        });

        return { membersByCategory: membersByCategory as any[], error: null };
    } catch (e: any) {
        console.error("Error fetching team members:", e);
        return { error: `Failed to fetch team members: ${e.message}`, membersByCategory: [] };
    }
}

export async function getAllTeamMembersWithCategory() {
    try {
        const membersSnapshot = await adminDb.collection("teamMembers").get();
        const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const categoriesSnapshot = await adminDb.collection("teamCategories").get();
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
        const docRef = adminDb.collection('teamMembers').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return { error: 'Team member not found.' };
        return { member: { id: docSnap.id, ...docSnap.data()! } };
    } catch (e) {
        return { error: 'Failed to fetch team member.' };
    }
}


export async function deleteTeamMember(id: string) {
    try {
        const bucket = adminStorage.bucket();
        const filePath = `profile-images/${id}`;
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        if (exists) {
            await file.delete();
        }
        
        await adminDb.collection('teamMembers').doc(id).delete();
        return { success: true };
    } catch (e) {
        console.error("Error deleting team member:", e);
        if (e instanceof Error) {
            return { error: `Failed to delete team member: ${e.message}` };
        }
        return { error: "Failed to delete team member." };
    }
}
