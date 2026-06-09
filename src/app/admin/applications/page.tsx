import { getApplications, getHiringStatus } from "@/app/actions";
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
import { FinalizeCycleDialog } from "@/components/finalize-cycle-dialog";
import { HiringToggle } from "@/components/hiring-toggle";

export default async function ApplicationsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const headersList = await headers();
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;
  const userRole = headersList.get('X-User-Role');

  if (!userRole) {
    redirect('/login');
  }

  const { isHiringOpen } = await getHiringStatus();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full glass-panel !rounded-none !border-t-0 !border-x-0 !shadow-none py-2">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-12">
          <Link href="/admin" className="flex items-center gap-3 group">
            <MLSCLogo className="h-9 w-9 text-primary transition-transform group-hover:scale-105" />
            <h1 className="text-2xl font-black tracking-tighter">
              Manage <span className="text-muted-foreground/50">Applications</span>
            </h1>
          </Link>
          <div className="flex items-center gap-6">
            <HiringToggle initialStatus={isHiringOpen} />
            <FinalizeCycleDialog />
            <Button asChild variant="outline" size="sm" className="rounded-full px-6">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-8 md:p-12 lg:p-16">
        <div className="container mx-auto">
          <div className="apple-card p-0 overflow-hidden">
            <Suspense key={JSON.stringify(resolvedSearchParams)} fallback={<ApplicationsDashboardSkeleton panelDomain={panelDomain} />}>
              <ApplicationsDashboard panelDomain={panelDomain} userRole={userRole} searchParams={resolvedSearchParams} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

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
    <div className="p-10">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter">Applications.</h2>
        <p className="text-muted-foreground font-medium">{description}</p>
      </div>
      <ApplicationsTableSkeleton />
    </div>
  );
}

async function ApplicationsDashboard({
  panelDomain,
  userRole,
  searchParams
}: {
  panelDomain?: string;
  userRole: string | null;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // ... (keep logic same)
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
  const attendedOnly = typeof searchParams.attendedOnly === 'string' ? searchParams.attendedOnly === 'true' : undefined;

  const { applications, hasNextPage, currentPage } = await getApplications({
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
    lastVisibleId,
    attendedOnly,
  }) as any;

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
    ? `Hiring for the ${domainLabels[panelDomain]} domain.`
    : `View and manage all submitted applications.`;

  return (
    <div className="p-10 space-y-10">
      <div>
        <h2 className="text-3xl font-black tracking-tighter">Applications.</h2>
        <p className="text-muted-foreground font-medium">{description}</p>
      </div>
      <div className="space-y-8">
        <div className="glass-panel p-6 !rounded-2xl">
            <AdminFilters
            userRole={userRole}
            panelDomain={panelDomain}
            filterData={filterData}
            currentFilters={{ status, year, branch, domain, search, searchBy, sortByPerformance, sortByRecommended, attendedOnly: searchParams.attendedOnly as string }}
            />
        </div>
        <Suspense fallback={<ApplicationsTableSkeleton />}>
          <div className="overflow-hidden">
            <ApplicationsTable applications={applications} domainLabels={domainLabels} userRole={userRole} />
          </div>
        </Suspense>
        <PaginationComponent
          hasNextPage={hasNextPage || false}
          currentPage={currentPage || 1}
          applications={applications}
        />
      </div>
    </div>
  );
}
