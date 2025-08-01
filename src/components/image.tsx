"use client";

import NextImage, { ImageProps } from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';

export const Image = (props: ImageProps) => {
  const { src, ...rest } = props;
  const convertedSrc = typeof src === 'string' ? convertGoogleDriveLink(src) : src;

  return <NextImage src={convertedSrc} {...rest} />;
};
