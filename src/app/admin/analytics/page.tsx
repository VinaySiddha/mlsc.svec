import { getAnalyticsData } from "@/app/actions";
import { AdminDashboardAnalytics } from "@/components/admin-dashboard-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== 'super_admin') {
    redirect('/admin');
  }

  const analyticsData = await getAnalyticsData();

  if ('error' in analyticsData) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
              Hiring <span className="text-[#EA4335]">Analytics</span>
            </h1>
            <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Detailed statistical insights</p>
          </div>
          <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-destructive font-bold text-sm uppercase">Error Loading Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive text-sm">
                {analyticsData.error || "Could not load analytics data."}
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
          Hiring <span className="text-[#4285F4]">Analytics</span>
        </h1>
        <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Detailed statistical insights and domain distributions</p>
      </div>

      <AdminDashboardAnalytics data={analyticsData.analytics as any} />
    </div>
  );
}
