import { getApplications } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Home } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const applications = await getApplications();

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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              MLSC Hub - Admin
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
                A total of {applications.length} {applications.length === 1 ? 'application' : 'applications'} received.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Technical Domain</TableHead>
                      <TableHead>Non-Technical Domain</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length > 0 ? (
                      applications.map((app) => (
                        <TableRow key={app.id}>
                           <TableCell className="text-muted-foreground whitespace-nowrap">
                            <Link href={`/admin/application/${app.id}`} className="hover:underline">
                              {format(new Date(app.submittedAt), "MMM d, yyyy")}
                            </Link>
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link href={`/admin/application/${app.id}`} className="hover:underline">
                              {app.name}
                            </Link>
                          </TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.branch}</TableCell>
                          <TableCell>{app.yearOfStudy}</TableCell>
                          <TableCell>{domainLabels[app.technicalDomain] || app.technicalDomain}</TableCell>
                          <TableCell>{domainLabels[app.nonTechnicalDomain] || app.nonTechnicalDomain}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
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
