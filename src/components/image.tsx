
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
        const name = alt ? encodeURIComponent(alt) : 'User';
        setImgSrc(`https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=512`);
    } else {
        setImgSrc(src);
        setHasError(false);
    }
  }, [src, alt]);

  const isCloudLink = typeof src === 'string' && (src.includes('drive.google.com') || src.includes('1drv.ms'));

  let processedSrc = imgSrc;

  if (typeof processedSrc === 'string' && !hasError) {
    if (isCloudLink) {
      const convertedSrc = convertGoogleDriveLink(processedSrc);
      processedSrc = `/api/image?url=${encodeURIComponent(convertedSrc)}`;
    } else {
      processedSrc = processedSrc.startsWith('http') ? processedSrc : processedSrc.startsWith('/') ? processedSrc : `/${processedSrc}`;
    }
  }

  // Use standard img tag for fallbacks or if hostname issue is suspected
  // This is more reliable for external dynamic content like ui-avatars
  if (hasError || (typeof processedSrc === 'string' && processedSrc.includes('ui-avatars.com'))) {
    const isFill = (rest as any).fill;
    return (
      <img
        src={typeof processedSrc === 'string' ? processedSrc : ''}
        alt={alt || ''}
        className={cn(
          "object-cover", 
          isFill ? "absolute inset-0 w-full h-full" : "",
          className
        )}
      />
    );
  }

  return (
    <NextImage
      {...(rest as any)}
      src={processedSrc}
      alt={alt}
      className={className}
      onError={() => {
        setHasError(true);
        const name = alt ? encodeURIComponent(alt) : 'User';
        setImgSrc(`https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=512`);
      }}
    />
  );
};
