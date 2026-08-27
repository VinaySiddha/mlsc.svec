'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { IosLoader } from '@/components/ui/ios-loader';

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // When pathname or search params change, hide the loader
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept click on links to show loader if target differs from current page
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (
        anchor &&
        anchor.href &&
        anchor.target !== '_blank' &&
        !anchor.hasAttribute('download') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        try {
          const url = new URL(anchor.href);
          const currentUrl = new URL(window.location.href);

          // Only trigger loader if navigating to a different internal URL
          if (
            url.origin === currentUrl.origin &&
            (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search)
          ) {
            setIsNavigating(true);
          }
        } catch {
          // ignore invalid URLs
        }
      }
    };

    window.addEventListener('click', handleAnchorClick, true);
    return () => {
      window.removeEventListener('click', handleAnchorClick, true);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center gap-3 backdrop-blur-xl">
        <IosLoader size="lg" color="text-white" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/70 animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
}
