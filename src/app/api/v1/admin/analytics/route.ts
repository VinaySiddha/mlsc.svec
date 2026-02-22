import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  QueryConstraint,
} from 'firebase/firestore';

const techDomainLabels: Record<string, string> = {
  gen_ai: 'Generative AI',
  ds_ml: 'Data Science & ML',
  azure: 'Azure Cloud',
  web_app: 'Web & App Development',
};

const nonTechDomainLabels: Record<string, string> = {
  event_management: 'Event Management',
  public_relations: 'Public Relations',
  media_marketing: 'Media Marketing',
  creativity: 'Creativity',
};

export async function GET(req: NextRequest) {
  try {
    // Get user role from headers (set by middleware)
    const userRole = req.headers.get('X-User-Role');
    const panelDomain = req.headers.get('X-Panel-Domain');

    if (!userRole || (userRole !== 'admin' && userRole !== 'panel')) {
      return errorResponse('Unauthorized', 403, 'ERROR_FORBIDDEN');
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const interviewOnly = searchParams.get('interviewOnly') === 'true';

    const constraints: QueryConstraint[] = [];

    // Panel admins can only see their domain
    if (userRole === 'panel' && panelDomain) {
      constraints.push(where('technicalDomain', '==', panelDomain));
    }

    // Filter for interview analytics
    if (interviewOnly) {
      constraints.push(where('interviewAttended', '==', true));
    }

    const applicationsRef = collection(db, 'applications');
    const baseQuery = query(applicationsRef, ...constraints);

    // Get total applications count
    const totalSnapshot = await getCountFromServer(baseQuery);
    const totalApplications = totalSnapshot.data().count;

    // Get attended interviews count (only if not already filtering for interviews)
    let attendedCount = 0;
    if (!interviewOnly) {
      const attendedQuery = query(baseQuery, where('interviewAttended', '==', true));
      const attendedSnapshot = await getCountFromServer(attendedQuery);
      attendedCount = attendedSnapshot.data().count;
    } else {
      attendedCount = totalApplications; // All are attended if filtering
    }

    // Get all applications within the scope to aggregate various counts
    const allApplicationsSnapshot = await getDocs(baseQuery);
    const applications = allApplicationsSnapshot.docs.map((doc) => doc.data());

    // Calculate various counts
    const techDomainCounts: { [key: string]: number } = {};
    const nonTechDomainCounts: { [key: string]: number } = {};
    const statusCounts: { [key: string]: number } = {};
    const branchCounts: { [key: string]: number } = {};
    const yearCounts: { [key: string]: number } = {};
    let hiredCount = 0;
    let rejectedCount = 0;

    applications.forEach((app: any) => {
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

    return successResponse({
      totalApplications,
      attendedCount,
      hiredCount,
      rejectedCount,
      techDomainData,
      nonTechDomainData,
      statusData,
      branchData,
      yearData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
