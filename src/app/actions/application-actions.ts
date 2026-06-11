'use server';

import papaparse from 'papaparse';
import { ApplicationService } from '@/lib/services/application-service';
import { cookies } from 'next/headers';
import {
  applicationSchema,
  internalApplicationSchema,
  reviewSchema,
} from '@/schemas/application';
import { logActivityAction, logErrorAction } from './log-actions';

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
    const adminChapter = cookieStore.get('admin_chapter')?.value || '3.0';
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
    await ApplicationService.saveApplicationReview(parsed.data);
    // Log real-time system activity
    await logActivityAction(
      `Application Reviewed`,
      `Application ID ${parsed.data.id} was reviewed by interviewer. Status updated.`,
      undefined,
      "Interviewer"
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error saving review:', error);
    await logErrorAction(
      `Application Review Failed`,
      `Failed to save review for App ID ${parsed.data.id}. Error: ${error.message || error}`
    );
    return { error: 'Failed to save review.' };
  }
}


export async function updateAttendance(firestoreId: string, attended: boolean) {
  try {
    await ApplicationService.updateAttendance(firestoreId, attended);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return { error: 'Failed to update attendance status.' };
  }
}

export async function bulkUpdateStatus(filters: any, newStatus: string) {
  try {
    const result = await ApplicationService.bulkUpdateStatus(filters, newStatus);
    return { success: true, ...result };
  } catch (error: any) {
    console.error('Error during bulk status update:', error);
    return { error: error.message || 'Failed to complete status update.' };
  }
}

export async function bulkUpdateFromCsv(hiredCandidates: { rollNo: string }[]) {
  try {
    const updatedCount = await ApplicationService.bulkUpdateFromCsv(hiredCandidates);
    return { success: true, count: updatedCount };
  } catch (error: any) {
    console.error('Error during CSV bulk update:', error);
    return { error: error.message || 'Failed to complete CSV import.' };
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
    await ApplicationService.setDeadline(deadline);
    return { success: true };
  } catch (error: any) {
    console.error('Error setting deadline:', error);
    return { error: 'Failed to set deadline.' };
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
    const isHiringOpen = await ApplicationService.getHiringStatus();
    return { isHiringOpen };
  } catch (error: any) {
    console.error('Error getting hiring status:', error);
    return { error: 'Failed to retrieve hiring status.' };
  }
}

export async function toggleHiringStatus(isOpen: boolean) {
  try {
    await ApplicationService.toggleHiringStatus(isOpen);
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling hiring status:', error);
    return { error: 'Failed to change hiring status.' };
  }
}

export async function finalizeHiringCycle() {
  try {
    await ApplicationService.finalizeHiringCycle();
    return { success: true };
  } catch (error: any) {
    console.error('Error finalizing hiring cycle:', error);
    return { error: error.message || 'Failed to finalize hiring cycle.' };
  }
}
