import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { QuizManager } from '@/components/admin/quiz-manager';
import { ROLES } from '@/lib/roles';
import { Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminQuizPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== ROLES.SUPER_ADMIN) {
    redirect('/admin');
  }

  return (
    <div className="space-y-6 font-sans text-black">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#FF0055] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-white">
          <Trophy className="h-7 w-7 text-white stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
            Daily Quiz <span className="text-[#FF0055]">Manager</span>
          </h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">
            Create unique daily challenges, edit AI-generated questions, and monitor student submissions
          </p>
        </div>
      </div>

      <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_#000000]">
        <QuizManager />
      </div>
    </div>
  );
}
