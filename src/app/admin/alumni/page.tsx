import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlumniManager } from "@/components/admin/home/alumni-manager";
import { MessageSquareQuote } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminAlumniPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role') || '';

  if (userRole !== 'super_admin' && userRole !== 'admin') {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#4285F4]/10 text-[#4285F4] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquareQuote className="h-3 w-3" />
              COMMUNITY ARCHIVE
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Manage <span className="text-[#4285F4]">Alumni Words</span>
          </h1>
          <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
            Create, moderate, approve, and feature alumni testimonials and stories
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <AlumniManager />
      </div>
    </div>
  );
}
