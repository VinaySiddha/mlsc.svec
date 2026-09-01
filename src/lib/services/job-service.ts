import { JobDb } from '@/lib/db/job-db';

export class JobService {
  static async fetchAndCacheJobs() {
    try {
      const jobs = await JobDb.getLatestJobs(50);
      return { jobs };
    } catch (error: any) {
      console.error("Error retrieving jobs from database:", error);
      return { jobs: [], error: "Unable to load jobs at this time." };
    }
  }
}
