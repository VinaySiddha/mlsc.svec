import { getAnalyticsData } from "@/app/actions";
import { AdminAnalyticsSection } from "@/components/admin-analytics-section";
import { headers } from "next/headers";
import { Shield, AlertCircle } from "lucide-react";

export default async function AdminPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role') || 'panel';
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;

  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };

  const title = panelDomain ? `${domainLabels[panelDomain] || 'Panel'} Dashboard` : "SUPERADMIN CONTROL CENTER";

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
          Dashboard <span className="text-[#4285F4]">Overview</span>
        </h1>
        <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          {title}
        </p>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Analytics Cards & Charts Area */}
        <div className="lg:col-span-3 space-y-6">
          <AdminAnalyticsSection panelDomain={panelDomain} />
        </div>

        {/* Side Panel Controls */}
        <div className="space-y-6">
          {/* System Status Indicators */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">System Status</h3>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#34A853]"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">All Systems Operational</span>
            </div>
            
            <div className="border-t border-slate-100 dark:border-zinc-800 mt-6 pt-4 space-y-2">
              <div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Database Engine</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">Online (99.98% uptime)</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Hiring Gate</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">Active & Processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
