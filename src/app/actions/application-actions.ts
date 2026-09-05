'use server';

import papaparse from 'papaparse';
import { ApplicationService } from '@/lib/services/application-service';
import { ApplicationDb } from '@/lib/db/application-db';
import { cookies } from 'next/headers';
import {
  applicationSchema,
  internalApplicationSchema,
  reviewSchema,
} from '@/schemas/application';
import { logActivityAction, logErrorAction } from './log-actions';
import { AuthService } from '@/lib/services/auth-service';

async function assertCanMutate(actionName: string) {
  const sessionUser = await AuthService.getSessionUser();
  if (sessionUser?.role === 'view_only') {
    throw new Error(`Unauthorized: View-only administrators cannot perform actions (${actionName}).`);
  }
}

export async function submitApplication(formData: FormData) {
  const file = formData.get('resume') as File;

  const values = Object.fromEntries(formData.entries());
  delete values.resume;

  const parsed = applicationSchema.safeParse(values);

  if (!parsed.success) {
    console.error('Form validation failed:', parsed.error.flatten().fieldErrors);
    return { error: 'Invalid form data. Please check your inputs.' };
  }

  try {
    const { referenceId, summary } = await ApplicationService.submitApplication(parsed.data, file);
    // Log real-time system activity
    await logActivityAction(
      `Application Submitted`,
      `Candidate ${parsed.data.name} (${parsed.data.rollNo}) submitted application for ${parsed.data.technicalDomain} domain. Ref: ${referenceId}`,
      undefined,
      parsed.data.name,
      parsed.data.email,
      { domain: parsed.data.technicalDomain, ref: referenceId }
    );
    return { success: true, referenceId, summary };
  } catch (error: any) {
    console.error('Error submitting application:', error);
    await logErrorAction(
      `Application Submission Failed`,
      `Candidate ${parsed.data.name} (${parsed.data.rollNo}) failed to submit. Error: ${error.message || error}`
    );
    return { error: error.message || 'An unexpected error occurred. Please try again.' };
  }
}

export async function internalRegister(values: any) {
  const parsed = internalApplicationSchema.safeParse(values);

  if (!parsed.success) {
    console.error('Internal form validation failed:', parsed.error.flatten().fieldErrors);
    return { error: 'Invalid form data. Please check your inputs.' };
  }

  try {
    const referenceId = await ApplicationService.internalRegister(parsed.data);
    // Log real-time system activity
    await logActivityAction(
      `Internal Registration`,
      `User ${parsed.data.name} (${parsed.data.rollNo}) registered internally for ${parsed.data.technicalDomain || parsed.data.nonTechnicalDomain} domain. Ref: ${referenceId}`,
      undefined,
      parsed.data.name,
      parsed.data.email,
      { domain: parsed.data.technicalDomain || parsed.data.nonTechnicalDomain, ref: referenceId }
    );
    return { referenceId };
  } catch (error: any) {
    console.error('Error during internal registration:', error);
    await logErrorAction(
      `Internal Registration Failed`,
      `User ${parsed.data.name} (${parsed.data.rollNo}) failed. Error: ${error.message || error}`
    );
    return { error: error.message || 'An unexpected error occurred. Please try again.' };
  }
}


export async function getApplications(params: {
  panelDomain?: string;
  search?: string;
  searchBy?: string;
  searchMode?: string;
  selectionFilter?: string;
  status?: string;
  year?: string;
  branch?: string;
  domain?: string;
  sortByPerformance?: string;
  sortByRecommended?: string;
  page?: string;
  limit?: string;
  lastVisibleId?: string;
  fetchAll?: boolean;
  attendedOnly?: boolean;
  chapter?: string;
}) {
  try {
    const cookieStore = await cookies();
    const cookieChapter = cookieStore.get('admin_chapter')?.value;
    const adminChapter = params.chapter || cookieChapter || await ApplicationDb.getActiveChapter();
    const result = await ApplicationService.getApplications({ ...params, chapter: adminChapter });
    return result;
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return { error: error.message || 'Failed to fetch applications.' };
  }
}

export async function getApplicationById(id: string) {
  try {
    const application = await ApplicationService.getApplicationById(id);
    if (!application) return { error: 'Application not found.' };
    return { application };
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return { error: 'Failed to fetch application.' };
  }
}

export async function saveApplicationReview(data: any) {
  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Review validation failed:', parsed.error.flatten().fieldErrors);
    return { error: 'Invalid review data.' };
  }

  try {
    await assertCanMutate('saveApplicationReview');
    await ApplicationService.saveApplicationReview(parsed.data);
    // Log real-time system activity
    await logActivityAction(
      `Application Reviewed`,
      `Application ID ${parsed.data.id} was reviewed by interviewer. Status updated.`
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error saving review:', error);
    await logErrorAction(
      `Application Review Failed`,
      `Failed to save review for App ID ${parsed.data.id}. Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to save review.' };
  }
}

export async function syncReviewedApplicationsAction() {
  try {
    await assertCanMutate('syncReviewedApplications');
    const result = await ApplicationService.syncReviewedApplications();
    await logActivityAction(
      `Synced Reviewed Applications`,
      `Synchronized ${result.updatedCount} reviewed applications to Attended & Interviewed status.`
    );
    return { success: true, ...result };
  } catch (error: any) {
    console.error('Error syncing reviewed applications:', error);
    await logErrorAction(
      `Sync Reviewed Applications Failed`,
      `Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to sync reviewed applications.' };
  }
}

export async function toggleRecommendation(id: string, isRecommended: boolean) {
  try {
    await assertCanMutate('toggleRecommendation');
    await ApplicationService.toggleRecommendation(id, isRecommended);
    await logActivityAction(
      `Candidate Recommendation Toggled`,
      `Application ID ${id} was marked as recommended: ${isRecommended}`
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling recommendation:', error);
    await logErrorAction(
      `Recommendation Toggle Failed`,
      `Failed to toggle recommendation for App ID ${id}. Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to toggle recommendation.' };
  }
}

export async function updateApplicantDetailsAction(id: string, data: any) {
  try {
    await assertCanMutate('updateApplicantDetails');
    await ApplicationService.updateApplicantDetails(id, data);
    await logActivityAction(
      `Applicant Details Updated`,
      `Application ID ${id} was updated with new details.`
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error updating applicant details:', error);
    await logErrorAction(
      `Applicant Update Failed`,
      `Failed to update applicant ID ${id}. Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to update applicant details.' };
  }
}

export async function deleteApplicationAction(id: string) {
  try {
    await assertCanMutate('deleteApplication');
    await ApplicationService.deleteApplication(id);
    await logActivityAction(
      `Application Deleted`,
      `Application ID ${id} was permanently deleted from the database.`
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting application:', error);
    await logErrorAction(
      `Application Deletion Failed`,
      `Failed to delete application ID ${id}. Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to delete application.' };
  }
}


export async function updateAttendance(firestoreId: string, attended: boolean) {
  try {
    await assertCanMutate('updateAttendance');
    await ApplicationService.updateAttendance(firestoreId, attended);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    await logErrorAction(
      `Attendance Update Failed`,
      `Failed to update attendance status for application ID ${firestoreId}. Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to update attendance status.' };
  }
}

export async function bulkUpdateStatus(filters: any, newStatus: string) {
  try {
    await assertCanMutate('bulkUpdateStatus');
    const result = await ApplicationService.bulkUpdateStatus(filters, newStatus);
    return { success: true, ...result };
  } catch (error: any) {
    console.error('Error during bulk status update:', error);
    await logErrorAction(
      `Bulk Status Update Failed`,
      `Failed to perform bulk status update to "${newStatus}". Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to complete status update.' };
  }
}

export async function bulkUpdateFromCsv(hiredCandidates: { rollNo: string }[]) {
  try {
    await assertCanMutate('bulkUpdateFromCsv');
    const updatedCount = await ApplicationService.bulkUpdateFromCsv(hiredCandidates);
    return { success: true, count: updatedCount };
  } catch (error: any) {
    console.error('Error during CSV bulk update:', error);
    await logErrorAction(
      `CSV Bulk Update Failed`,
      `Failed to perform CSV bulk update. Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to complete CSV import.' };
  }
}

export async function bulkProcessList(ids: string[], newStatus: string) {
  try {
    await assertCanMutate('bulkProcessList');
    const { ApplicationDb } = await import('@/lib/db/application-db');
    let updatedCount = 0;
    for (const id of ids) {
      await ApplicationDb.updateApplicationDoc(id, { status: newStatus });
      updatedCount++;
    }
    await logActivityAction(
      `Bulk Processed Recommended Candidates`,
      `Updated ${updatedCount} candidates to status: ${newStatus}`
    );
    return { success: true, count: updatedCount };
  } catch (error: any) {
    console.error('Error bulk processing list:', error);
    return { error: error.message || 'Failed to complete bulk processing.' };
  }
}

export async function exportApplicationsToCsv(filters: any) {
  try {
    const { applications, error } = await getApplications({ ...filters, fetchAll: true }) as any;
    if (error) throw new Error(error);

    if (!applications || applications.length === 0) {
      return { csvData: null };
    }

    const dataToExport = applications.map((app: any) => ({
      'Reference ID': app.id || '',
      'Name': app.name || '',
      'Email': app.email || '',
      'Phone': app.phone || '',
      'Roll No': app.rollNo || '',
      'Branch': app.branch || '',
      'Section': app.section || '',
      'Year of Study': app.yearOfStudy || '',
      'CGPA': app.cgpa || '',
      'Backlogs': app.backlogs || '',
      'Technical Domain': app.technicalDomain || '',
      'Non-Technical Domain': app.nonTechnicalDomain || '',
      'LinkedIn': app.linkedin || '',
      'Status': app.status || '',
      'Submitted At': app.submittedAt || '',
    }));

    const csv = papaparse.unparse(dataToExport);
    return { success: true, csvData: csv };
  } catch (error) {
    console.error('Error exporting applications to CSV:', error);
    return { error: 'Failed to export applications.' };
  }
}

export async function exportHiredToCsv() {
  try {
    const candidates = await ApplicationService.getHiredCandidates();
    if (!candidates || candidates.length === 0) {
      return { csvData: null };
    }

    const csv = papaparse.unparse(candidates);
    return { success: true, csvData: csv };
  } catch (error: any) {
    console.error('Error exporting hired list:', error);
    return { error: 'Failed to export hired candidates.' };
  }
}

export async function exportRegisteredExcelToCsv(filters: any) {
  try {
    const { applications, error } = await getApplications({ ...filters, fetchAll: true }) as any;
    if (error) throw new Error(error);

    if (!applications || applications.length === 0) {
      return { csvData: null, count: 0 };
    }

    const dataToExport = applications.map((app: any) => ({
      'Roll Number': (app.rollNo || '').toString().trim().toUpperCase() || '-',
      'Name': (app.name || '').toString().trim() || '-',
      'Year': (app.yearOfStudy || '').toString().trim() || '-',
      'Branch': (app.branch || '').toString().trim().toUpperCase() || '-',
      'Section': (app.section || '').toString().trim().toUpperCase() || '-',
    }));

    const csv = '\uFEFF' + papaparse.unparse(dataToExport);
    return { success: true, csvData: csv, count: dataToExport.length };
  } catch (error: any) {
    console.error('Error exporting registered excel sheet:', error);
    return { error: 'Failed to export registered excel sheet.' };
  }
}


export async function getAnalyticsData(panelDomain?: string) {
  try {
    const cookieStore = await cookies();
    const adminChapter = cookieStore.get('admin_chapter')?.value || '3.0';
    const analytics = await ApplicationService.getAnalyticsData(panelDomain, adminChapter);
    return { analytics };
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return { error: 'Failed to fetch analytics.' };
  }
}

export async function getInterviewAnalyticsData() {
  try {
    const cookieStore = await cookies();
    const adminChapter = cookieStore.get('admin_chapter')?.value || '3.0';
    const analytics = await ApplicationService.getInterviewAnalyticsData(adminChapter);
    return { analytics };
  } catch (error: any) {
    console.error('Error fetching interview analytics:', error);
    return { error: 'Failed to fetch interview analytics.' };
  }
}

export async function getPanels() {
  try {
    const panels = await ApplicationService.getPanels();
    return { panels };
  } catch (error: any) {
    console.error('Error fetching panels:', error);
    return { error: 'Failed to fetch panels.' };
  }
}

export async function setDeadline(deadline: Date) {
  try {
    await assertCanMutate('setDeadline');
    await ApplicationService.setDeadline(deadline);
    return { success: true };
  } catch (error: any) {
    console.error('Error setting deadline:', error);
    await logErrorAction(
      `Set Deadline Failed`,
      `Failed to set recruitment application deadline to ${deadline.toISOString()}. Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to set deadline.' };
  }
}

export async function getDeadline() {
  try {
    const deadline = await ApplicationService.getDeadline();
    return { deadline };
  } catch (error: any) {
    console.error('Error getting deadline:', error);
    return { error: 'Failed to retrieve deadline.' };
  }
}

export async function getHiringStatus() {
  try {
    const status = await ApplicationService.getHiringStatus();
    return { ...status };
  } catch (error: any) {
    console.error('Error getting hiring status:', error);
    return { 
      error: 'Failed to retrieve hiring status.', 
      isHiringOpen: false,
      isHiringOpenRaw: false,
      isLimitReached: false,
      isDeadlinePassed: false,
      registrationLimit: 0,
      currentCount: 0,
      activeChapter: '4.0'
    };
  }
}

export async function toggleHiringStatus(isOpen: boolean) {
  try {
    await assertCanMutate('toggleHiringStatus');
    await ApplicationService.toggleHiringStatus(isOpen);
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling hiring status:', error);
    await logErrorAction(
      `Toggle Hiring Status Failed`,
      `Failed to toggle hiring status to ${isOpen ? 'Open' : 'Closed'}. Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to change hiring status.' };
  }
}

export async function finalizeHiringCycle() {
  try {
    await assertCanMutate('finalizeHiringCycle');
    await ApplicationService.finalizeHiringCycle();
    return { success: true };
  } catch (error: any) {
    console.error('Error finalizing hiring cycle:', error);
    await logErrorAction(
      `Finalize Hiring Cycle Failed`,
      `Failed to finalize recruitment hiring cycle. Error: ${error.message || error}`
    );
    return { error: error.message || 'Failed to finalize hiring cycle.' };
  }
}

export async function generateCandidateInsightsAction(input: {
  name: string;
  domain: string;
  cgpa?: string;
  resumeSummary?: string;
  joinReason?: string;
  aboutClub?: string;
  anythingElse?: string;
}) {
  try {
    const { generateCandidateInsights } = await import('@/ai/flows/generate-candidate-insights');
    const insights = await generateCandidateInsights(input);
    return { success: true, insights };
  } catch (error: any) {
    console.error('Error generating AI candidate insights:', error);
    return { error: error.message || 'Failed to generate AI insights.' };
  }
}

export async function cleanChapterApplicantsAction(chapter: string = '4.0') {
  try {
    await assertCanMutate('cleanChapterApplicants');
    const cleanedCount = await ApplicationService.cleanChapterApplicants(chapter);
    return { success: true, cleanedCount };
  } catch (error: any) {
    console.error(`Error cleaning Chapter ${chapter} applicants:`, error);
    return { error: error.message || 'Failed to clean chapter applicants.' };
  }
}

