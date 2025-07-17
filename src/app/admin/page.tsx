
import { getApplications } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Home } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

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

export default async function AdminPage() {
  const headersList = headers();
  const domain = headersList.get('X-Panel-Domain') || undefined;

  const applications = await getApplications(domain);

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

  const title = domain ? `${domainLabels[domain]} Panel` : "MLSC Hub - Admin";
  const description = domain
    ? `Applications for the ${domainLabels[domain]} domain.`
    : `A total of ${applications.length} ${applications.length === 1 ? 'application' : 'applications'} received.`;


  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-4">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          </Link>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2" />
              <span>Home</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Technical Domain</TableHead>
                      <TableHead>Non-Technical Domain</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length > 0 ? (
                      applications.map((app: any) => {
                        const status = app.status || 'Received';
                        return (
                          <TableRow key={app.id}>
                            <TableCell className="font-mono text-xs">
                               <Link href={`/admin/application/${app.id}`} className="hover:underline">
                                  {app.id}
                                </Link>
                            </TableCell>
                            <TableCell className="font-medium">
                              <Link href={`/admin/application/${app.id}`} className="hover:underline">
                                {app.name}
                              </Link>
                            </TableCell>
                             <TableCell className="text-muted-foreground whitespace-nowrap">
                                {format(new Date(app.submittedAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(status)}>{status}</Badge>
                            </TableCell>
                            <TableCell>{domainLabels[app.technicalDomain] || app.technicalDomain}</TableCell>
                            <TableCell>{domainLabels[app.nonTechnicalDomain] || app.nonTechnicalDomain}</TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No applications yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
