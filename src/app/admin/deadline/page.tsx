import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DeadlineSetter } from '@/components/deadline-setter';
import { ROLES } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export default async function DeadlinePage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== ROLES.SUPER_ADMIN) {
    redirect('/admin/applications');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
          Application <span className="text-[#EA4335]">Deadline</span>
        </h1>
        <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          Set the application deadline shown on the public website
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm max-w-3xl">
        <DeadlineSetter />
      </div>
    </div>
  );
}
