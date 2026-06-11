import { OperationsCenter } from "@/components/admin/operations-center";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ROLES } from "@/lib/roles";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function BugsPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  // Restrict to superadmin
  if (userRole !== ROLES.SUPER_ADMIN) {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
          OPERATIONS <span className="text-[#4285F4]">CENTER</span>
        </h1>
        <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          Real-time system actions, logging and error monitoring
        </p>
      </div>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-zinc-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4] mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading Bug Tickets...</p>
        </div>
      }>
        <OperationsCenter mode="bugs" />
      </Suspense>
    </div>
  );
}
