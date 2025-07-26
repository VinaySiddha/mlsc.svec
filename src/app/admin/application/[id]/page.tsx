
import { getApplicationById } from "@/app/actions";
import { ApplicationReviewForm } from "@/components/application-review-form";
import { MLSCLogo } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from 'date-fns';
import { headers } from "next/headers";
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const application = await getApplicationById(params.id);
  const previousTitle = (await parent).title?.absolute || 'Application';

  if (!application) {
    return {
      title: `Application Not Found | ${previousTitle}`
    }
  }
 
  return {
    title: `Reviewing Application for ${application.name} (${application.id})`,
    description: `Review and process the application submitted by ${application.name}.`,
  }
}

const domainLabels: Record<string, string> = {
  gen_ai: "Generative AI",
  ds_ml: "Data Science & ML",
  azure: "Azure Cloud",
  web_app: "Web & App Development",
  event_management: "Event Management",
  public_relations: "Public Relations",
  media_marketing: "Media Marketing",
  creativity: "Creativity",
};

const getStatusVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'hired':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'under processing':
    case 'interviewing':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const application = await getApplicationById(params.id);
  const headersList = headers();
  const userRole = headersList.get('X-User-Role') ?? 'panel';


  if (!application) {
    notFound();
  }
  
  const status = application.status || 'Received';

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              MLSC 3.0 Hiring Program
            </h1>
          </Link>
          <Button asChild variant="glass" size="sm">
            <Link href="/admin/applications">
              <ArrowLeft />
              <span>Back to Applications</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="container mx-auto grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{application.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Submitted on {format(new Date(application.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                   <Badge variant={getStatusVariant(status)} className="text-xs shrink-0">
                      {status}
                    </Badge>
                </div>
                 <div className="text-xs text-muted-foreground pt-3">
                  Reference ID: <span className="font-mono text-foreground break-all">{application.id}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                 {application.resumeSummary && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">AI-Generated Resume Summary</h4>
                      <blockquote className="text-xs text-muted-foreground mt-2 p-3 border rounded-md bg-muted/50 italic">{application.resumeSummary}</blockquote>
                    </div>
                  )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-muted-foreground break-all">{application.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-muted-foreground">{application.phone}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Roll No</h4>
                    <p className="text-muted-foreground">{application.rollNo}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Branch</h4>
                    <p className="text-muted-foreground">{application.branch}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Section</h4>
                    <p className="text-muted-foreground">{application.section}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Year of Study</h4>
                    <p className="text-muted-foreground">{application.yearOfStudy}</p>
                  </div>
                   <div>
                    <h4 className="font-semibold">CGPA</h4>
                    <p className="text-muted-foreground">{application.cgpa}</p>
                  </div>
                   <div>
                    <h4 className="font-semibold">Active Backlogs</h4>
                    <p className="text-muted-foreground">{application.backlogs}</p>
                  </div>
                  {application.linkedin && (
                     <div className="sm:col-span-2">
                        <h4 className="font-semibold">LinkedIn</h4>
                        <a href={application.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                          {application.linkedin}
                        </a>
                      </div>
                  )}
                </div>
                 <div className="flex flex-wrap gap-3 text-xs">
                   <div>
                    <h4 className="font-semibold mb-1">Technical Domain</h4>
                    <Badge variant="secondary">{domainLabels[application.technicalDomain] || application.technicalDomain}</Badge>
                  </div>
                   <div>
                    <h4 className="font-semibold mb-1">Non-Technical Domain</h4>
                    <Badge variant="secondary">{domainLabels[application.nonTechnicalDomain] || application.nonTechnicalDomain}</Badge>
                  </div>
                 </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-semibold">Why do you want to join this club?</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{application.joinReason}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">What do you know about MLSC club?</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{application.aboutClub}</p>
                  </div>
                   {application.anythingElse && (
                    <div>
                      <h4 className="font-semibold">Anything else?</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{application.anythingElse}</p>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <ApplicationReviewForm application={application} userRole={userRole} />
          </div>
        </div>
      </main>
    </div>
  );
}
