
'use server';

import {
  summarizeResume,
  SummarizeResumeInput,
} from '@/ai/flows/summarize-resume';
import { sendConfirmationEmail } from '@/ai/flows/send-confirmation-email';
import { sendStatusUpdateEmail, StatusUpdateEmailInput } from '@/ai/flows/send-status-update-email';


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
  runTransaction,
  setDoc,
  deleteDoc,
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
  image: z.string().url("Please enter a valid image URL."),
  registrationOpen: z.boolean().default(false),
  bannerLink: z.string().url("Please enter a valid Google Drive link.").optional().or(z.literal('')),
  speakers: z.string().optional(),
  highlightImages: z.string().optional(),
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
    role: z.string().min(2, "Role is required."),
    image: z.string().url("A valid image URL is required."),
    linkedin: z.string().url("A valid LinkedIn URL is required."),
    categoryId: z.string({ required_error: "Please select a category." }),
});


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


export async function createEvent(values: z.infer<typeof eventFormSchema>) {
    const parsed = eventFormSchema.safeParse(values);
    if (!parsed.success) {
        return { error: 'Invalid event data.' };
    }
    try {
        const dataToSave = {
            ...parsed.data,
            highlightImages: parsed.data.highlightImages?.split('\n').filter(link => link.trim() !== '') || [],
        };
        const docRef = await addDoc(collection(db, 'events'), dataToSave);
        return { success: true, id: docRef.id };
    } catch (error) {
        return { error: 'Failed to create event.' };
    }
}

export async function updateEvent(id: string, values: z.infer<typeof eventFormSchema>) {
    const parsed = eventFormSchema.safeParse(values);
    if (!parsed.success) {
        return { error: 'Invalid event data.' };
    }
    try {
        const dataToUpdate = {
            ...parsed.data,
            highlightImages: parsed.data.highlightImages?.split('\n').filter(link => link.trim() !== '') || [],
        };
        const eventDoc = doc(db, 'events', id);
        await updateDoc(eventDoc, dataToUpdate as any);
        return { success: true };
    } catch (error) {
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
    // This is a temporary solution to display events without a database.
    // In a real application, this would fetch from Firestore.
    const staticEvents = [
        {
            id: '1',
            title: 'Azure Cloud Workshop',
            description: 'Our college recently organized an engaging Azure workshop, providing students with hands-on experience in cloud computing. Participants delved into the diverse functionalities of Azure services, gaining valuable insights into cloud technology. The workshop equipped attendees with practical skills essential for the evolving landscape of modern IT infrastructure.',
            date: new Date('2023-10-18T00:00:00Z').toISOString(),
            image: 'https://placehold.co/600x400.png',
            registrationOpen: false,
        },
        {
            id: '2',
            title: 'Web development BootCamp',
            description: 'We are going organize an engaging Web Development workshop, providing students with hands-on experience in Basic Web technologies. Participants delved into the diverse functionalities of HTML,CSS and JavaScript, gaining valuable insights into Web technology. The workshop equipped attendees with practical skills and a mini project knowledge essential for the evolving landscape of modern IT infrastructure',
            date: new Date().toISOString(), // Shows as upcoming
            image: 'https://placehold.co/600x400.png',
            registrationOpen: true,
        }
    ];

    return { events: staticEvents, error: null };
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
            highlightImages: Array.isArray(data.highlightImages) ? data.highlightImages.join('\n') : '',
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

        if (!eventSnap.exists() || !eventSnap.data().registrationOpen) {
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
export async function createTeamMember(values: z.infer<typeof teamMemberSchema>) {
    const parsed = teamMemberSchema.safeParse(values);
    if (!parsed.success) return { error: "Invalid data." };
    try {
        await addDoc(collection(db, 'teamMembers'), parsed.data);
        return { success: true };
    } catch (e) {
        return { error: "Failed to create team member." };
    }
}

export async function getTeamMembers() {
    try {
        const teamMembersSnapshot = await getDocs(collection(db, 'teamMembers'));
        const teamMembers = teamMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const teamCategoriesSnapshot = await getDocs(query(collection(db, 'teamCategories'), orderBy('order')));
        const teamCategoriesData = teamCategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // This function needs to return a more structured format for the page
        const membersByCategory = teamCategoriesData.map(category => ({
            ...category,
            members: teamMembers.filter(member => member.categoryId === category.id)
        }));

        return { membersByCategory };
    } catch (e) {
        console.error(e)
        return { error: "Failed to fetch team members." };
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

export async function updateTeamMember(id: string, values: z.infer<typeof teamMemberSchema>) {
    const parsed = teamMemberSchema.safeParse(values);
    if (!parsed.success) return { error: "Invalid data." };
    try {
        await updateDoc(doc(db, 'teamMembers', id), parsed.data);
        return { success: true };
    } catch (e) {
        return { error: "Failed to update team member." };
    }
}

export async function deleteTeamMember(id: string) {
    try {
        await deleteDoc(doc(db, 'teamMembers', id));
        return { success: true };
    } catch (e) {
        return { error: "Failed to delete team member." };
    }
}
