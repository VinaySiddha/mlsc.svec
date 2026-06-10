import { getApplications, getHiringStatus } from "@/app/actions";
import { Suspense } from "react";
import { ApplicationsTable } from "@/components/applications-table";
import { AdminFilters } from "@/components/admin-filters";
import { PaginationComponent } from "@/components/pagination";
import { ApplicationsTableSkeleton } from "@/components/applications-table-skeleton";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Manage <span className="text-[#4285F4]">Applications</span>
          </h1>
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Review applications and toggle hiring statuses</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-0 overflow-hidden shadow-sm">
        <Suspense key={JSON.stringify(resolvedSearchParams)} fallback={<ApplicationsDashboardSkeleton panelDomain={panelDomain} />}>
          <ApplicationsDashboard panelDomain={panelDomain} userRole={userRole} searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
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
    <div className="space-y-6 p-6">
      <AdminFilters
        userRole={userRole}
        panelDomain={panelDomain}
        filterData={filterData}
        currentFilters={{ status, year, branch, domain, search, searchBy, sortByPerformance, sortByRecommended, attendedOnly: searchParams.attendedOnly as string }}
      />
      <Suspense fallback={<ApplicationsTableSkeleton />}>
        <div className="overflow-hidden border border-slate-100 dark:border-zinc-800/80 rounded-xl">
          <ApplicationsTable applications={applications} domainLabels={domainLabels} userRole={userRole} />
        </div>
      </Suspense>
      <PaginationComponent
        hasNextPage={hasNextPage || false}
        currentPage={currentPage || 1}
        applications={applications}
      />
    </div>
  );
}
