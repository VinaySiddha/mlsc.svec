
"use client";

import NextImage, { ImageProps } from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export const Image = (props: ImageProps) => {
  const { src, className, alt, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
    } else {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  let processedSrc = imgSrc;

  if (typeof processedSrc === 'string' && !hasError) {
    if (processedSrc.includes('drive.google.com')) {
      processedSrc = convertGoogleDriveLink(processedSrc);
    } else if (processedSrc.includes('1drv.ms')) {
      processedSrc = `/api/image?url=${encodeURIComponent(processedSrc)}`;
    } else {
      processedSrc = processedSrc.startsWith('http') ? processedSrc : processedSrc.startsWith('/') ? processedSrc : `/${processedSrc}`;
    }
  }

  if (hasError) {
    const isFill = (rest as any).fill;
    const initials = alt
      ? alt.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '?';
    return (
      <div
        className={cn(
          "bg-gradient-to-b from-zinc-900 to-black flex flex-col items-center justify-center select-none p-4",
          isFill ? "absolute inset-0 w-full h-full" : "",
          className
        )}
        style={{
          width: !isFill ? (rest as any).width : undefined,
          height: !isFill ? (rest as any).height : undefined,
          ...(rest as any).style
        }}
      >
        <span className="text-xl md:text-3xl font-black tracking-widest text-white/30 uppercase">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <NextImage
      {...(rest as any)}
      src={processedSrc}
      alt={alt}
      className={className}
      unoptimized={rest.unoptimized || (typeof processedSrc === 'string' && processedSrc.startsWith('/api/image'))}
      onError={() => {
        setHasError(true);
      }}
    />
  );
};
