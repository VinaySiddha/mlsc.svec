import { getApplications } from "@/app/actions/application-actions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AttendanceClient } from "./attendance-client";

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');
  const rawDomain = headersList.get('X-Panel-Domain') || undefined;
  const panelDomain = userRole === 'common_panel' || userRole === 'view_only' ? undefined : rawDomain;

  if (!userRole) {
    redirect('/login');
  }

  // Fetch all applications for the active cycle
  const result = await getApplications({
    panelDomain,
    fetchAll: true,
  }) as any;

  const applications = result?.applications || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
          Interview <span className="text-[#4285F4]">Attendance</span>
        </h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          Mark and monitor candidate check-ins for active interviews
        </p>
      </div>

      <AttendanceClient 
        initialApplications={applications} 
        userRole={userRole} 
        panelDomain={panelDomain} 
      />
    </div>
  );
}
