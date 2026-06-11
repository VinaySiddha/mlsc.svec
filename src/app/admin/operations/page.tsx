import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  // Restrict to superadmin
  if (userRole !== ROLES.SUPER_ADMIN) {
    redirect('/admin');
  }

  redirect('/admin/operations/activity');
}
