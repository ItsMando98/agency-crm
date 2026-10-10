import type { InputHTMLAttributes } from 'react';

import { cn } from '~/lib/cn';

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      'h-9 w-full rounded-md border border-border bg-card px-3 text-sm placeholder:text-muted-foreground',
      className,
    )}
    {...props}
  />
);
