import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-none border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-zinc-400 transition-all duration-200 hover:border-black focus:bg-white focus-visible:outline-none focus-visible:border-black focus-visible:shadow-[3px_3px_0px_0px_#000000] disabled:cursor-not-allowed disabled:opacity-50',
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
