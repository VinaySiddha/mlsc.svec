import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChapterSettingsManager } from '@/components/chapter-settings-manager';
import { FinalizeCycleDialog } from '@/components/finalize-cycle-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { ROLES } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export default async function HiringSettingsPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== ROLES.SUPER_ADMIN) {
    redirect('/admin/applications');
  }

  return (
    <div className="space-y-6 font-sans text-black">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#4285F4] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-white">
          <Briefcase className="h-7 w-7 text-white stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
            Hiring <span className="text-[#4285F4]">Settings</span>
          </h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">
            Manage chapter configs, toggle hiring & finalize cycles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <ChapterSettingsManager />
        </div>
        <div>
          <Card className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#FF0055]">
            <CardHeader className="p-6 border-b-2 border-black bg-[#FAFAFA]">
              <CardTitle className="text-sm font-black text-black uppercase font-display tracking-tight">
                Finalize Current Cycle
              </CardTitle>
              <CardDescription className="text-xs text-zinc-600 font-bold mt-1">
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
