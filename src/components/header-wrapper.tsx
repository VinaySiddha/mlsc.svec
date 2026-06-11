'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from './site-header';

const HIDDEN_PREFIXES = ['/admin', '/community', '/profile', '/auth'];

export function HeaderWrapper() {
  const pathname = usePathname();
  const hide = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hide) return null;
  return (
    <>
      <SiteHeader />
      <div className="h-[108px] w-full bg-black shrink-0" />
    </>
  );
}
