import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  Query,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { Application } from '@/types';

function buildFilteredQuery(params: {
  panelDomain?: string;
  search?: string;
  searchBy?: string;
  status?: string;
  year?: string;
  branch?: string;
  domain?: string;
  attendedOnly?: boolean;
  sortByRecommended?: string;
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
    constraints.push(where(searchField, '==', searchTermLower));
  }

  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  return q;
}

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
    const search = searchParams.get('search') || undefined;
    const searchBy = searchParams.get('searchBy') || 'rollNo';
    const status = searchParams.get('status') || undefined;
    const year = searchParams.get('year') || undefined;
    const branch = searchParams.get('branch') || undefined;
    const domain = searchParams.get('domain') || undefined;
    const sortByPerformance = searchParams.get('sortByPerformance') || undefined;
    const sortByRecommended = searchParams.get('sortByRecommended') || undefined;
    const attendedOnly = searchParams.get('attendedOnly') === 'true';
    const page = searchParams.get('page') || '1';
    const limitStr = searchParams.get('limit') || '10';
    const lastVisibleId = searchParams.get('lastVisibleId') || undefined;
    const fetchAll = searchParams.get('fetchAll') === 'true';

    const limitNumber = parseInt(limitStr, 10);

    // Build filtered query
    let baseQuery = buildFilteredQuery({
      panelDomain: userRole === 'panel' ? (panelDomain || undefined) : undefined,
      search,
      searchBy,
      status,
      year,
      branch,
      domain,
      attendedOnly,
      sortByRecommended,
    });

    let finalQuery: Query<DocumentData>;
    const sortConstraints: QueryConstraint[] = [];

    // Apply sorting logic
    if (sortByRecommended === 'true') {
      sortConstraints.push(orderBy('ratings.overall', 'desc'));
    } else if (sortByPerformance === 'true') {
      sortConstraints.push(orderBy('ratings.overall', 'desc'));
    } else {
      // Default sort order
      sortConstraints.push(orderBy('submittedAt', 'desc'));
    }

    finalQuery = query(baseQuery, ...sortConstraints);

    // If fetchAll is true, bypass pagination and get all documents
    if (fetchAll) {
      const querySnapshot = await getDocs(finalQuery);
      const applications = querySnapshot.docs.map(
        (doc) => ({ firestoreId: doc.id, ...doc.data() } as Application)
      );
      return successResponse({
        applications,
        totalApplications: applications.length,
        totalPages: 1,
        currentPage: 1,
      });
    }

    // For pagination, fetch one more than the limit to check if there's a next page
    const paginatedQuery = query(finalQuery, limit(limitNumber + 1));
    let queryWithCursor = paginatedQuery;

    if (page && parseInt(page, 10) > 1 && lastVisibleId) {
      const lastVisibleDoc = await getDoc(doc(db, 'applications', lastVisibleId));
      if (lastVisibleDoc.exists()) {
        queryWithCursor = query(paginatedQuery, startAfter(lastVisibleDoc));
      }
    }

    const querySnapshot = await getDocs(queryWithCursor);
    const applications = querySnapshot.docs.map(
      (doc) => ({ firestoreId: doc.id, ...doc.data() } as Application)
    );

    const hasNextPage = applications.length > limitNumber;
    // Remove the extra document we fetched for the check
    if (hasNextPage) {
      applications.pop();
    }

    return successResponse({
      applications,
      hasNextPage,
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
