'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from './site-header';

const HIDDEN_PREFIXES = ['/admin', '/community', '/profile', '/auth', '/mlsc-pay'];

export function HeaderWrapper() {
  const pathname = usePathname();
  const hide = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hide) return null;
  return (
    <>
      <SiteHeader />
      <div className="h-20 sm:h-24 w-full shrink-0 pointer-events-none" />
    </>
  );
}
