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
    <div className="space-y-6 font-sans text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#4285F4] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-white">
            <MessageSquareQuote className="h-7 w-7 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
              Manage <span className="text-[#4285F4]">Alumni Words</span>
            </h1>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">
              Create, moderate, approve, and feature alumni testimonials and stories
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_#000000]">
        <AlumniManager />
      </div>
    </div>
  );
}
