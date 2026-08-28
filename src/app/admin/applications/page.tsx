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
  const rawDomain = headersList.get('X-Panel-Domain') || undefined;
  const userRole = headersList.get('X-User-Role');
  const panelDomain = userRole === 'common_panel' ? undefined : rawDomain;

  if (!userRole) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-[3px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000000]">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black uppercase italic">
            Manage <span className="text-[#4285F4]">Applications</span>
          </h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider mt-1">Review applications and manage hiring decisions</p>
        </div>
        {(userRole === 'admin' || userRole === 'super_admin') && (
          <div className="flex items-center gap-2.5">
            <a 
              href="/admin/internal-registration" 
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FFE600] text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              + Register Applicant
            </a>
            <a 
              href="/admin/applications/recommended" 
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FFE600] hover:bg-yellow-300 text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              ★ Recommended Finalists
            </a>
          </div>
        )}
      </div>

      <div className="bg-white border-[3px] border-black rounded-2xl p-0 overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
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
    event_management: "Event Management",
    public_relations: "Public Relations",
    media_marketing: "Media Marketing",
    creativity: "Creativity",
  };
  const description = panelDomain
    ? `Applications for the ${domainLabels[panelDomain]} domain.`
    : `Loading applications...`;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black uppercase italic tracking-tight text-black">Applications Pool</h2>
        <p className="text-zinc-500 font-medium text-xs">{description}</p>
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
    statuses: ['Received', 'Invited to Interview', 'Interview Done', 'Thank You For Attending', 'Hired', 'Rejected'],
    years: ["2nd", "3rd"],
    branches: ["AIML", "CAI", "CSE", "CST", "ECE", "Others"],
    domains: ['gen_ai', 'ds_ml', 'azure', 'web_app', 'event_management', 'public_relations', 'media_marketing', 'creativity']
  };

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
    <div className="space-y-6 p-6">
      <AdminFilters
        userRole={userRole}
        panelDomain={panelDomain}
        filterData={filterData}
        currentFilters={{ status, year, branch, domain, search, searchBy, sortByPerformance, sortByRecommended, attendedOnly: searchParams.attendedOnly as string }}
      />
      <Suspense fallback={<ApplicationsTableSkeleton />}>
        <div className="overflow-hidden border-2 border-black rounded-xl">
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
