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
    <div className="space-y-6 font-sans text-black">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#FF0055] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-white">
          <CalendarIcon className="h-7 w-7 text-white stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
            Application <span className="text-[#EA4335]">Deadline</span>
          </h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">
            Set the application deadline shown on the public website
          </p>
        </div>
      </div>

      <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_#000000] max-w-3xl">
        <DeadlineSetter />
      </div>
    </div>
  );
}
