import { getAllUsers, assignUserRole, disableUser } from '@/lib/user-service';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { ROLE_LABELS, type Role } from '@/lib/roles';
import { UsersTable } from './users-table';

export default async function AdminUsersPage() {
  const headersList = headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== 'admin') {
    redirect('/admin');
  }

  const { users, error } = await getAllUsers();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div className="flex items-center gap-2">
              <MLSCLogo className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">User Management</h1>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <UsersIcon className="h-3 w-3" />
            {users.length} users
          </Badge>
        </div>
      </header>

      <main className="flex-1 p-4 container mx-auto space-y-6">
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Registered Users & RBAC
            </CardTitle>
            <CardDescription>
              Manage user roles and access control. Changes take effect immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable users={users} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
