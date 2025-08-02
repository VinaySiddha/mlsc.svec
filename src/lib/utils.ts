import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertGoogleDriveLink(url: string): string {
  if (typeof url !== 'string') {
    return url;
  }
  
  if (url.includes('drive.google.com')) {
    const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  if (url.includes('1drv.ms')) {
    // Basic OneDrive link conversion, may need to be more robust
    // This is often a redirect, which the proxy will handle.
    return url;
  }
  
  return url;
}
