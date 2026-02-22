import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    // Fetch jobs from Firestore cache (already populated by web app)
    const jobsQuery = query(
      collection(db, 'jobs'),
      orderBy('posted_on', 'desc'),
      limit(50)
    );

    const jobsSnapshot = await getDocs(jobsQuery);

    if (jobsSnapshot.empty) {
      return successResponse({
        jobs: [],
        message: 'No jobs available at the moment',
      });
    }

    const jobs = jobsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        posted_on: data.posted_on?.toDate().toISOString() || new Date().toISOString(),
      };
    });

    return successResponse({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);

    // If fetch fails, return empty array with error message
    return successResponse({
      jobs: [],
      error: 'Could not fetch job listings. Please try again later.',
    });
  }
}
