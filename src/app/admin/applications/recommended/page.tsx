import { getApplications } from "@/app/actions";
import { Suspense } from "react";
import { RecommendedDashboard } from "./recommended-dashboard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic flex items-center gap-2">
            <span className="text-yellow-500">★ Recommended</span> Finalists
          </h1>
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Review top candidates and perform bulk hiring actions</p>
        </div>
        <Button asChild variant="outline" className="border-white/10 bg-white/5">
          <Link href="/admin/applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm p-6">
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary size-8" /></div>}>
          <RecommendedDashboard initialApplications={pendingRecommended} />
        </Suspense>
      </div>
    </div>
  );
}
