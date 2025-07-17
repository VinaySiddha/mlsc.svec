
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

export const dynamic = 'force-dynamic';

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
    case 'accepted':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'under review':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const application = await getApplicationById(params.id);

  if (!application) {
    notFound();
  }
  
  const status = application.status || 'Received';

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              MLSC Hub - Admin
            </h1>
          </Link>
          <Button asChild variant="outline">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to Applications</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{application.name}</CardTitle>
                    <CardDescription>
                      Submitted on {format(new Date(application.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                   <Badge variant={getStatusVariant(status)} className="text-sm">
                      {status}
                    </Badge>
                </div>
                 <div className="text-sm text-muted-foreground pt-4">
                  Reference ID: <span className="font-mono text-foreground">{application.id}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-muted-foreground">{application.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-muted-foreground">{application.phone}</p>
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
                     <div>
                        <h4 className="font-semibold">LinkedIn</h4>
                        <a href={application.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                          {application.linkedin}
                        </a>
                      </div>
                  )}
                </div>
                 <div className="flex flex-wrap gap-4 text-sm">
                   <div>
                    <h4 className="font-semibold mb-2">Technical Domain</h4>
                    <Badge variant="secondary">{domainLabels[application.technicalDomain] || application.technicalDomain}</Badge>
                  </div>
                   <div>
                    <h4 className="font-semibold mb-2">Non-Technical Domain</h4>
                    <Badge variant="secondary">{domainLabels[application.nonTechnicalDomain] || application.nonTechnicalDomain}</Badge>
                  </div>
                 </div>

                <div className="space-y-4 text-sm">
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

                {application.resumeSummary && (
                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">AI Resume Summary</h4>
                    <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
                      {application.resumeSummary}
                    </blockquote>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <ApplicationReviewForm application={application} />
          </div>
        </div>
      </main>
    </div>
  );
}
