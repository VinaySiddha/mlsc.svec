
import { headers, cookies } from "next/headers";
import { AdminLayoutShell } from "@/components/admin-layout-shell";
import { getGlobalSettings } from "@/app/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role') || 'panel';
  const username = headersList.get('X-User-Username') || 'Admin';
  const userEmail = headersList.get('X-User-Email') || undefined;
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;

  const { settings } = await getGlobalSettings();
  const cookieStore = await cookies();
  const adminChapter = cookieStore.get('admin_chapter')?.value || settings?.activeChapter || '3.0';
  const chaptersMap = settings?.chapters || {};
  if (!chaptersMap['3.0']) {
    chaptersMap['3.0'] = { isHiringOpen: false, isTeamVisible: true };
  }
  if (!chaptersMap['4.0']) {
    chaptersMap['4.0'] = { isHiringOpen: true, isTeamVisible: true };
  }
  const chapters = Object.keys(chaptersMap).sort();

  return (
    <AdminLayoutShell
      userRole={userRole}
      username={username}
      userEmail={userEmail}
      panelDomain={panelDomain}
      adminChapter={adminChapter}
      chapters={chapters}
    >
      {children}
    </AdminLayoutShell>
  );
}

