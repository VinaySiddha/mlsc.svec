import { getAnalyticsData } from "@/app/actions";
import { AdminDashboardAnalytics } from "@/components/admin-dashboard-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
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
        <div className="space-y-6 font-sans text-black">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FF0055] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-white">
              <BarChart className="h-7 w-7 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
                Hiring <span className="text-[#FF0055]">Analytics</span>
              </h1>
              <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">Detailed statistical insights</p>
            </div>
          </div>
          <Card className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#FF0055]">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-[#FF0055] font-black text-sm uppercase">Error Loading Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-black font-bold text-xs">
                {analyticsData.error || "Could not load analytics data."}
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }

  return (
    <div className="space-y-6 font-sans text-black">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-black">
          <BarChart className="h-7 w-7 text-black stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
            Hiring <span className="text-[#4285F4]">Analytics</span>
          </h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">Detailed statistical insights and domain distributions</p>
        </div>
      </div>

      <AdminDashboardAnalytics data={analyticsData.analytics as any} />
    </div>
  );
}
