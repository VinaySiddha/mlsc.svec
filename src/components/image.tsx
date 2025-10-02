
"use client";

import NextImage, { ImageProps } from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const Image = (props: ImageProps) => {
  const { src, className, ...rest } = props;
  
  if (!src) {
    return <NextImage src="/placeholder.jpg" className={cn(className)} {...rest} />;
  }

  const isCloudLink = typeof src === 'string' && (src.includes('drive.google.com') || src.includes('1drv.ms') || src.includes('ibb.co'));

  let finalSrc = src;

  if (typeof src === 'string' && isCloudLink) {
    const convertedSrc = convertGoogleDriveLink(src);
    // Use the API proxy route for Google Drive and OneDrive images
    finalSrc = `/api/image?url=${encodeURIComponent(convertedSrc)}`;
  } else if (typeof src === 'string') {
    // For non-cloud links, just use them as is if they are absolute, or prepend '/' if relative
    finalSrc = src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}`;
  }
  
  return <NextImage src={finalSrc} className={className} {...rest} />;
};
