
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ContentProtection() {
  const { toast } = useToast();

  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyup = (e: KeyboardEvent) => {
        // Note: This is a basic deterrent and will not prevent all screenshot methods.
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText(''); // Clear clipboard to prevent pasting the image
            toast({
                variant: 'destructive',
                title: 'Screenshot Attempt Detected',
                description: 'For security reasons, taking screenshots of this page is not allowed.',
            });
        }
    };

    document.addEventListener("contextmenu", handleContextmenu);
    document.addEventListener("keyup", handleKeyup);
    
    return () => {
      document.removeEventListener("contextmenu", handleContextmenu);
      document.removeEventListener("keyup", handleKeyup);
    };
  }, [toast]);

  return null;
}
