import { JobDb } from '@/lib/db/job-db';

const CACHE_DURATION_HOURS = 6;

async function fetchFromJSearchAPI() {
  const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;
  if (!JSEARCH_API_KEY) {
    console.warn("JSearch API key is not configured. Skipping API call.");
    return [];
  }
  const url = 'https://jsearch.p.rapidapi.com/search?query=developer&country=IN&num_pages=1';
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': JSEARCH_API_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    console.error("JSearch API error:", await response.text());
    throw new Error("Failed to fetch data from the job API.");
  }
  const result = await response.json();
  return result.data;
}

export class JobService {
  static async fetchAndCacheJobs() {
    const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;
    if (!JSEARCH_API_KEY) {
      console.warn("JSEARCH_API_KEY is not configured during build/run. Job search feature will be disabled.");
      return { jobs: [], error: "The Job Search feature is currently disabled due to a configuration issue." };
    }

    const metaDoc = await JobDb.getLastFetchTimeDoc();
    const now = new Date();

    let shouldFetch = true;
    if (metaDoc.exists()) {
      const lastFetch = metaDoc.data().timestamp.toDate();
      const hoursSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastFetch < CACHE_DURATION_HOURS) {
        shouldFetch = false;
      }
    }

    if (shouldFetch) {
      console.log("Cache is stale or empty. Fetching new jobs from API...");
      const newJobsData = await fetchFromJSearchAPI();
      if (!newJobsData || newJobsData.length === 0) {
        console.log("No new jobs found from API.");
      } else {
        const existingJobsSnapshot = await JobDb.getExistingJobs();
        const existingLinks = new Set(existingJobsSnapshot.docs.map(d => d.data().apply_link));

        const jobsToSave: any[] = [];
        for (const job of newJobsData) {
          if (job.job_apply_link && !existingLinks.has(job.job_apply_link)) {
            jobsToSave.push({
              title: job.job_title || "N/A",
              company: job.employer_name || "N/A",
              location: job.job_city || "N/A",
              type: job.job_employment_type || "Full-time",
              description: job.job_description || "No description provided.",
              skills: job.job_required_skills || [],
              apply_link: job.job_apply_link,
              posted_on: new Date(job.job_posted_at_timestamp * 1000),
            });
          }
        }

        if (jobsToSave.length > 0) {
          await JobDb.saveJobsBatch(jobsToSave);
          console.log(`Successfully added ${jobsToSave.length} new jobs.`);
        }
        await JobDb.updateLastFetchTime(now);
      }
    }

    const jobs = await JobDb.getLatestJobs(50);
    return { jobs };
  }
}
