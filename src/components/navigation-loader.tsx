'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { BrutalistLoader } from '@/components/ui/brutalist-loader';

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

  return <BrutalistLoader fullScreen={true} statusText="ROUTING PROTOCOL ACTIVE" />;
}

