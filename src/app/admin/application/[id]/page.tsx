import { getApplicationById } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata, ResolvingMetadata } from 'next';
import { ApplicationDetailClient } from "./detail-client";

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getApplicationById(resolvedParams.id);
  const previousTitle = (await parent).title?.absolute || 'Application';

  if (!result || result.error || !result.application) {
    return {
      title: `Application Not Found | ${previousTitle}`
    }
  }
 
  const application = result.application;

  return {
    title: `Reviewing Application for ${application.name} (${application.id})`,
    description: `Review and process the application submitted by ${application.name}.`,
  }
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = await getApplicationById(resolvedParams.id);
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role') ?? 'panel';

  if (!result || result.error || !result.application) {
    notFound();
  }
  
  const application = result.application;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] text-black">
      <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-8 w-8 text-[#4285F4]" />
            <h1 className="text-xl font-black tracking-tight uppercase italic text-black">
              MLSC 4.0 <span className="text-[#4285F4]">Hiring</span>
            </h1>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/applications" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
              <span>Back to Applications</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          <ApplicationDetailClient application={application} userRole={userRole} />
        </div>
      </main>
    </div>
  );
}
