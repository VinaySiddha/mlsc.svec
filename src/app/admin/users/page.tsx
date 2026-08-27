import { getAllUsers, assignUserRole, disableUser } from '@/lib/user-service';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/roles';
import { UsersTable } from './users-table';

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  // Only super_admin can manage users
  if (userRole !== ROLES.SUPER_ADMIN) {
    redirect('/admin');
  }

  const { users, error } = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            User <span className="text-[#4285F4]">Management</span>
          </h1>
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage user roles and access control</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-full font-bold text-xs">
            <UsersIcon className="h-3.5 w-3.5 text-[#4285F4]" />
            <span>{users.length} users</span>
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive font-semibold text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <CardHeader className="p-6 border-b border-slate-100 dark:border-zinc-800">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white uppercase tracking-widest">
            <Shield className="h-4.5 w-4.5 text-[#4285F4]" />
            Registered Users & RBAC
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
            Assign user roles and manage system permissions. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
