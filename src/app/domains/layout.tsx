'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DomainsLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-black px-6 py-20">
        <div className="w-full max-w-md bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.03] border border-white/10 mb-6">
            <Lock className="h-6 w-6 text-white/60" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-2 uppercase italic">
            Authentication Required
          </h2>
          <p className="text-white/40 text-sm font-medium leading-relaxed mb-8">
            This section is restricted. Please sign in to view our domains and roadmaps.
          </p>
          <Button asChild className="w-full rounded-xl bg-white text-black font-bold hover:bg-white/90 py-5 transition-transform active:scale-95">
            <Link href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}>
              Sign In to Access
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
