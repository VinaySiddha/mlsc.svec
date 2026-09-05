import React from 'react';
import { headers } from 'next/headers';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role') || 'panel';

  const isAuthorized = userRole === 'super_admin' || userRole === 'admin' || userRole === 'panel' || userRole === 'common_panel' || userRole === 'view_only';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 text-red-500">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-150 uppercase tracking-tight">Restricted Access</h2>
          <p className="text-sm text-muted-foreground font-medium">
            You do not have the required permissions to view recruitment applications. If you believe this is an error, please contact the Super Admin.
          </p>
        </div>
        <Button asChild variant="glass">
          <Link href="/admin">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
