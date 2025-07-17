import { getApplications, getFilterData } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, X } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { ApplicationsTable } from "@/components/applications-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminFilters } from "@/components/admin-filters";

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const headersList = headers();
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;
  const userRole = headersList.get('X-User-Role');

  if (!userRole) {
    redirect('/login');
  }
  
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const year = typeof searchParams.year === 'string' ? searchParams.year : undefined;
  const branch = typeof searchParams.branch === 'string' ? searchParams.branch : undefined;
  const domain = typeof searchParams.domain === 'string' ? searchParams.domain : undefined;
  const sortByPerformance = typeof searchParams.sortByPerformance === 'string' ? searchParams.sortByPerformance : undefined;


  const applications = await getApplications({ panelDomain, search, status, year, branch, domain, sortByPerformance });
  const { statuses, years, branches, domains } = await getFilterData();


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

  const title = panelDomain ? `${domainLabels[panelDomain] || 'Panel'} Dashboard` : "MLSC Hub - Superadmin";
  const description = panelDomain
    ? `Applications for the ${domainLabels[panelDomain]} domain.`
    : `A total of ${applications.length} matching ${applications.length === 1 ? 'application' : 'applications'} found.`;


  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-4">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>
            <LogoutButton />
          </div>
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
            <CardContent className="space-y-4">
               <AdminFilters
                userRole={userRole}
                filterData={{ statuses, years, branches, domains }}
                currentFilters={{ status, year, branch, domain, search, sortByPerformance }}
               />
              <ApplicationsTable applications={applications} domainLabels={domainLabels} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
