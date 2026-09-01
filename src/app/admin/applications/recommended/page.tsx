import { getApplications } from "@/app/actions";
import { Suspense } from "react";
import { RecommendedDashboard } from "./recommended-dashboard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function RecommendedApplicationsPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    redirect('/admin'); // Only admins can see this
  }

  // Fetch only recommended applications that aren't finalized yet
  const { applications, error } = await getApplications({ sortByRecommended: 'true' }) as any;

  if (error) {
    return <div className="p-8 text-red-500">Error loading recommended applications.</div>;
  }

  // Filter out those already hired or rejected if necessary (though usually they remain recommended)
  const pendingRecommended = applications.filter((app: any) => app.status !== 'Hired' && app.status !== 'Rejected');

  return (
    <div className="space-y-6 font-sans text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
            <Star className="h-7 w-7 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
              Recommended <span className="text-[#FF0055]">Finalists</span>
            </h1>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">
              Review top candidates and perform bulk hiring actions
            </p>
          </div>
        </div>
        <Button asChild className="bg-white hover:bg-zinc-100 text-black border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000000] cursor-pointer rounded-none">
          <Link href="/admin/applications">
            <ArrowLeft className="mr-2 h-4 w-4 stroke-[2.5]" />
            Back to All
          </Link>
        </Button>
      </div>

      <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_#000000]">
        <Suspense fallback={<div className="flex justify-center p-12 text-black font-black text-sm uppercase">Loading Candidates...</div>}>
          <RecommendedDashboard initialApplications={pendingRecommended} />
        </Suspense>
      </div>
    </div>
  );
}
