
import { getApplications } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ApplicationsTable } from "@/components/applications-table";
import { AdminFilters } from "@/components/admin-filters";
import { PaginationComponent } from "@/components/pagination";
import { ApplicationsTableSkeleton } from "@/components/applications-table-skeleton";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ApplicationsDashboardSkeleton({ panelDomain }: { panelDomain?: string }) {
    const domainLabels: Record<string, string> = {
      gen_ai: "Generative AI",
      ds_ml: "Data Science & ML",
      azure: "Azure Cloud",
      web_app: "Web & App Development",
    };
    const description = panelDomain
      ? `Applications for the ${domainLabels[panelDomain]} domain.`
      : `Loading applications...`;

    return (
        <>
            <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ApplicationsTableSkeleton />
            </CardContent>
        </>
    );
}

async function ApplicationsDashboard({
  panelDomain,
  userRole,
  searchParams
}: {
  panelDomain?: string;
  userRole: string | null;
  searchParams: { [key:string]: string | string[] | undefined };
}) {
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const searchBy = typeof searchParams.searchBy === 'string' ? searchParams.searchBy : 'rollNo';
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const year = typeof searchParams.year === 'string' ? searchParams.year : undefined;
  const branch = typeof searchParams.branch === 'string' ? searchParams.branch : undefined;
  const domain = typeof searchParams.domain === 'string' ? searchParams.domain : undefined;
  const sortByPerformance = typeof searchParams.sortByPerformance === 'string' ? searchParams.sortByPerformance : undefined;
  const sortByRecommended = typeof searchParams.sortByRecommended === 'string' ? searchParams.sortByRecommended : undefined;
  const page = typeof searchParams.page === 'string' ? searchParams.page : '1';
  const lastVisibleId = typeof searchParams.lastVisibleId === 'string' ? searchParams.lastVisibleId : undefined;

  const { applications, totalApplications, totalPages, currentPage } = await getApplications({ 
    panelDomain, 
    search, 
    searchBy,
    status, 
    year, 
    branch, 
    domain, 
    sortByPerformance,
    sortByRecommended,
    page,
    lastVisibleId
  });
  
  const filterData = {
    statuses: ['Received', 'Under Processing', 'Interviewing', 'Recommended', 'Hired', 'Rejected'],
    years: ["2nd", "3rd"],
    branches: ["AIML", "CAI", "CSE", "CST", "ECE", "Others"],
    domains: ['gen_ai', 'ds_ml', 'azure', 'web_app']
  };

  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };
  
  const description = panelDomain
    ? `Applications for the ${domainLabels[panelDomain]} domain.`
    : `Showing ${applications.length} of ${totalApplications} matching applications.`;

  return (
    <>
      <CardHeader>
        <CardTitle>All Applications</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <AdminFilters
          userRole={userRole}
          filterData={filterData}
          currentFilters={{ status, year, branch, domain, search, searchBy, sortByPerformance, sortByRecommended }}
         />
        <Suspense fallback={<ApplicationsTableSkeleton />}>
            <ApplicationsTable applications={applications} domainLabels={domainLabels} userRole={userRole} />
        </Suspense>
        <PaginationComponent 
            totalPages={totalPages} 
            currentPage={currentPage} 
            applications={applications}
        />
      </CardContent>
    </>
  );
}


export default async function ApplicationsPage({
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-4">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manage Applications
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto space-y-8">
          <Card>
            <Suspense key={JSON.stringify(searchParams)} fallback={<ApplicationsDashboardSkeleton panelDomain={panelDomain} />}>
              <ApplicationsDashboard panelDomain={panelDomain} userRole={userRole} searchParams={searchParams} />
            </Suspense>
          </Card>
        </div>
      </main>
    </div>
  );
}

    