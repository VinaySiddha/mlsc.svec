import type { Metadata } from "next";
import { fetchAndCacheJobs } from "@/app/actions";
import { JobCard, JobCardSkeleton } from "@/components/job-card";
import { Briefcase, Sparkles, AlertCircle } from "lucide-react";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Career & Internships Portal — MLSC SVEC",
  description: "Browse the latest tech job listings and internship opportunities curated for MLSC SVEC members.",
  openGraph: {
    title: "Career & Internships Portal — MLSC SVEC",
    description: "Browse the latest tech job listings and internship opportunities curated for MLSC SVEC members.",
    url: "https://mlscsvec.com/jobs",
  },
};

async function JobListings() {
    const { jobs, error } = await fetchAndCacheJobs();

    if (error) {
        return (
            <div className="border-2 border-black bg-[#EA4335]/10 p-8 text-center space-y-3 shadow-[4px_4px_0px_0px_#000000]">
                <AlertCircle className="h-8 w-8 text-[#EA4335] mx-auto" />
                <p className="text-xs font-black uppercase tracking-wider text-black">{error}</p>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className="border-2 border-dashed border-black bg-zinc-50 p-12 text-center space-y-2">
                <Briefcase className="h-10 w-10 text-zinc-400 mx-auto" />
                <h3 className="text-base font-black uppercase italic tracking-tight text-black">No Active Positions Listed</h3>
                <p className="text-xs text-zinc-600 font-bold max-w-sm mx-auto">
                    Check back soon! Our team updates technical listings, off-campus drives, and internships regularly.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
}

function JobListingsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
            ))}
        </div>
    );
}

export default function JobsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 Career Engine — Live Technical Jobs & Internship Opportunities
      </div>

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12 max-w-7xl">
          
          {/* Hero Section */}
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-1.5 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase tracking-widest text-black">
              <Sparkles className="h-4 w-4" /> [ CAREER ENGINE // LIVE OPENINGS ]
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.95] text-black">
              Engineering <br />
              <span className="text-[#4285F4]">Opportunities.</span>
            </h1>

            <p className="text-zinc-700 text-sm sm:text-base font-bold max-w-2xl leading-relaxed">
              Discover verified software engineering internships, graduate roles, and off-campus recruitment drives curated for student developers and alumni.
            </p>
          </div>

          {/* Job listings container */}
          <div className="space-y-6">
            <Suspense fallback={<JobListingsSkeleton />}>
              <JobListings />
            </Suspense>
          </div>

        </div>
      </main>
    </div>
  );
}
