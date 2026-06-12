'use server';

import { JobService } from '@/lib/services/job-service';
import { logErrorAction } from './log-actions';

export async function fetchAndCacheJobs() {
  try {
    const result = await JobService.fetchAndCacheJobs();
    return result as any;
  } catch (error: any) {
    console.error("Error in fetchAndCacheJobs action:", error);
    await logErrorAction(
      `Fetch and Cache Jobs Failed`,
      `Failed to fetch and cache job openings. Error: ${error.message || error}`
    );
    return { jobs: [], error: "An unexpected error occurred while fetching jobs." };
  }
}
