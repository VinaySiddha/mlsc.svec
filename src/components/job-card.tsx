"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, MapPin, Briefcase, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type?: string | null;
    posted_on: {
        seconds: number;
        nanoseconds: number;
    } | string;
    description: string;
    apply_link: string;
}

export function JobCard({ job }: { job: Job }) {
    let postedDate: Date;
    try {
        postedDate = typeof job.posted_on === 'string' 
            ? new Date(job.posted_on)
            : new Date(job.posted_on.seconds * 1000);
    } catch {
        postedDate = new Date();
    }

    return (
        <div className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#FFE600] transition-all flex flex-col justify-between h-full group">
            <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 border-b-2 border-black pb-3">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-black">
                            <Building className="h-3.5 w-3.5 text-[#4285F4]" />
                            <span>{job.company}</span>
                        </div>
                        <h3 className="text-lg font-black uppercase italic tracking-tight text-black group-hover:text-[#4285F4] transition-colors mt-1">
                            {job.title}
                        </h3>
                    </div>
                    {job.type && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-black bg-[#FFE600] text-black shrink-0 font-mono">
                            {job.type}
                        </span>
                    )}
                </div>

                {/* Meta details */}
                <div className="flex flex-wrap gap-2 text-xs font-bold text-zinc-700">
                    <div className="inline-flex items-center gap-1 bg-zinc-100 border border-black px-2 py-0.5 text-[11px]">
                        <MapPin className="h-3 w-3 text-black" />
                        <span>{job.location}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 bg-zinc-100 border border-black px-2 py-0.5 text-[11px]">
                        <Clock className="h-3 w-3 text-black" />
                        <span>{formatDistanceToNow(postedDate, { addSuffix: true })}</span>
                    </div>
                </div>

                {/* Job description snippet */}
                <p className="text-xs text-zinc-700 font-semibold leading-relaxed line-clamp-3">
                    {job.description}
                </p>
            </div>

            {/* Action Footer */}
            <div className="pt-5 mt-4 border-t-2 border-black">
                <Button asChild className="w-full bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase tracking-wider text-xs h-11 active:translate-x-[2px] active:translate-y-[2px]">
                    <Link href={job.apply_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        Apply for Position <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

export function JobCardSkeleton() {
    return (
        <div className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000000] flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
                <div className="h-4 bg-zinc-200 border border-black w-1/3 animate-pulse" />
                <div className="h-6 bg-zinc-200 border border-black w-3/4 animate-pulse" />
                <div className="flex gap-2">
                    <div className="h-5 bg-zinc-100 border border-black w-20 animate-pulse" />
                    <div className="h-5 bg-zinc-100 border border-black w-24 animate-pulse" />
                </div>
                <div className="h-16 bg-zinc-100 border border-black w-full animate-pulse" />
            </div>
            <div className="h-10 bg-zinc-200 border-2 border-black w-full animate-pulse" />
        </div>
    );
}
