
import type { Metadata } from "next";
import { fetchAndCacheJobs } from "@/app/actions";

export const metadata: Metadata = {
  title: "Jobs — MLSC SVEC",
  description: "Browse the latest tech job listings and internship opportunities curated for MLSC SVEC members.",
  openGraph: {
    title: "Jobs — MLSC SVEC",
    description: "Browse the latest tech job listings and internship opportunities curated for MLSC SVEC members.",
    url: "https://mlscsvec.in/jobs",
  },
};
import { JobCard, JobCardSkeleton } from "@/components/job-card";
import { Briefcase } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

async function JobListings() {
    const { jobs, error } = await fetchAndCacheJobs();

    if (error) {
        return <div className="text-center text-destructive-foreground p-8 bg-destructive/20 rounded-lg">{error}</div>;
    }

    if (!jobs || jobs.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No job listings found.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
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
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <main className="flex-1">
        <section id="jobs" className="w-full py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="relative w-full py-20 md:py-28 text-center mb-12 rounded-lg overflow-hidden">
                    <Image src="/team1.jpg" alt="Jobs Background" fill className="object-cover -z-10" priority />
                    <div className="absolute inset-0 bg-black/60 rounded-lg -z-10"></div>
                    <div className="relative z-10 container mx-auto px-4">
                        <div className="glass-card inline-block p-8">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl flex items-center gap-3">
                                <Briefcase className="h-8 w-8" />
                                <span>Latest Job <span className="text-primary">Openings</span></span>
                            </h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl mt-4">
                                Curated job listings for developers, fetched automatically.
                            </p>
                        </div>
                    </div>
                </div>
                
                <Suspense fallback={<JobListingsSkeleton />}>
                    <JobListings />
                </Suspense>
            </div>
        </section>
      </main>

    </div>
  );
}
