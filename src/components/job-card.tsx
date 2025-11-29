"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, MapPin, Briefcase, Clock } from "lucide-react";
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
    const postedDate = typeof job.posted_on === 'string' 
        ? new Date(job.posted_on)
        : new Date(job.posted_on.seconds * 1000);

    return (
        <Card className="glass-card flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <Building className="h-4 w-4" /> {job.company}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                </div>
                {job.type && (
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.type}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Posted {formatDistanceToNow(postedDate, { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                </p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={job.apply_link} target="_blank" rel="noopener noreferrer">
                        Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export function JobCardSkeleton() {
    return (
        <Card className="glass-card flex flex-col">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}
