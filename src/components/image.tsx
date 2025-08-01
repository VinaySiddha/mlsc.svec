
"use client";

import NextImage, { ImageProps } from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const Image = (props: ImageProps) => {
  const { src, className, ...rest } = props;
  const isGoogleDrive = typeof src === 'string' && src.includes('drive.google.com');

  let finalSrc = src;

  if (typeof src === 'string' && isGoogleDrive) {
    const convertedSrc = convertGoogleDriveLink(src);
    // Use the API proxy route for Google Drive images
    finalSrc = `/api/image?url=${encodeURIComponent(convertedSrc)}`;
  } else if (typeof src === 'string') {
    // For non-google drive links, just use them as is if they are absolute, or prepend '/' if relative
    finalSrc = src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}`;
  }
  
  // The next/image component can handle the proxy route
  return <NextImage src={finalSrc} className={className} {...rest} />;
};
