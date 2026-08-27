'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface GoogleAdUnitProps {
  slot?: string;
  client?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function GoogleAdUnit({
  slot = '4243057364',
  client = 'ca-pub-4523569844866132',
  format = 'auto',
  responsive = true,
  className = 'my-6 w-full flex justify-center overflow-hidden',
  style = { display: 'block', minHeight: '90px' },
}: GoogleAdUnitProps) {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      // AdSense throws in development/hot-reloads when adsbygoogle already pushed
      console.debug('AdSense status:', err);
    }
  }, []);

  return (
    <div className={className}>
      {/* Google AdSense Display Unit (MLSC) */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
