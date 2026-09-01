import { getApplicationById } from "@/app/actions";
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
    title: `Reviewing ${application.name} (${application.id}) | MLSC ATS`,
    description: `Review and evaluate application submitted by ${application.name}.`,
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
    <ApplicationDetailClient application={application} userRole={userRole} />
  );
}
