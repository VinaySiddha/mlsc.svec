'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './site-footer';

const HIDDEN_PREFIXES = ['/admin', '/auth', '/mlsc-pay'];

export function FooterWrapper() {
  const pathname = usePathname();
  const hide = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hide) return null;
  return <SiteFooter />;
}
