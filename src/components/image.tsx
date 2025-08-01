
"use client";

import NextImage, { ImageProps } from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const Image = (props: ImageProps) => {
  const { src, className, ...rest } = props;
  const isGoogleDrive = typeof src === 'string' && src.includes('drive.google.com');

  const convertedSrc = typeof src === 'string' ? convertGoogleDriveLink(src) : src;

  if (isGoogleDrive) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={convertedSrc as string} className={cn(className)} alt={props.alt} width={props.width} height={props.height} referrerPolicy="no-referrer" {...(rest as any)} />;
  }

  return <NextImage src={convertedSrc} className={className} {...rest} />;
};
