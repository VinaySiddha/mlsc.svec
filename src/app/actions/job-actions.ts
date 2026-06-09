'use server';

import { JobService } from '@/lib/services/job-service';

export async function fetchAndCacheJobs() {
  try {
    const result = await JobService.fetchAndCacheJobs();
    return result as any;
  } catch (error) {
    console.error("Error in fetchAndCacheJobs action:", error);
    return { jobs: [], error: "An unexpected error occurred while fetching jobs." };
  }
}
