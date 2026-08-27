import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChapterSettingsManager } from '@/components/chapter-settings-manager';
import { FinalizeCycleDialog } from '@/components/finalize-cycle-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLES } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export default async function HiringSettingsPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== ROLES.SUPER_ADMIN) {
    redirect('/admin/applications');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
          Hiring <span className="text-[#4285F4]">Settings</span>
        </h1>
        <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          Manage chapter configs, toggle hiring & finalize cycles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <ChapterSettingsManager />
        </div>
        <div>
          <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-widest">
                Finalize Current Cycle
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
                Archive all active applications and invite recommended candidates to join the team database.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FinalizeCycleDialog />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
