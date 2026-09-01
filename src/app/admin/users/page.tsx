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
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <div className="inline-block px-3 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-2">
            [ SYSTEM RBAC // ACCESS CONTROL ]
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-black uppercase italic">
            USER <span className="text-[#4285F4]">MANAGEMENT</span>
          </h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider mt-1">Manage user roles, permissions and team privileges</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2 px-3.5 py-1.5 bg-[#FFE600] border-2 border-black text-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000]">
            <UsersIcon className="h-4 w-4 text-black stroke-[2.5]" />
            <span>{users.length} TOTAL USERS</span>
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-2 border-black bg-[#FF0055]/10 shadow-[4px_4px_0px_0px_#FF0055]">
          <CardContent className="pt-6">
            <p className="text-[#FF0055] font-black text-xs uppercase">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] rounded-none">
        <CardHeader className="p-6 border-b-2 border-black bg-[#FAFAFA]">
          <CardTitle className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider font-display">
            <Shield className="h-4.5 w-4.5 text-[#4285F4] stroke-[2.5]" />
            Registered Users & RBAC Roster
          </CardTitle>
          <CardDescription className="text-xs text-zinc-600 font-bold">
            Assign user roles and manage system permissions. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <UsersTable users={users} currentUserId="" />
        </CardContent>
      </Card>
    </div>
  );
}
