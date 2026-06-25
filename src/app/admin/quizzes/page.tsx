import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { QuizManager } from '@/components/admin/quiz-manager';
import { ROLES } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export default async function AdminQuizPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== ROLES.SUPER_ADMIN) {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
          Daily Quiz <span className="text-[#EA4335]">Manager</span>
        </h1>
        <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          Create unique daily challenges, edit AI-generated questions, and monitor student submissions
        </p>
      </div>

      <div className="bg-white dark:bg-[#050505]/60 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <QuizManager />
      </div>
    </div>
  );
}
