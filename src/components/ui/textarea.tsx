import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-white/10 bg-[#0A0A0A]/80 px-4 py-3 text-sm text-white placeholder:text-white/35 transition-all duration-200 hover:bg-[#111111]/80 hover:border-white/20 focus:bg-black focus-visible:outline-none focus-visible:border-[#4285F4]/60 focus-visible:ring-1 focus-visible:ring-[#4285F4]/60 focus-visible:shadow-[0_0_12px_rgba(66,133,244,0.25)] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
