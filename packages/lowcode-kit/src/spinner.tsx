import React from 'react';
import { cn } from './cn';

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <svg className={cn('size-5 animate-spin text-current', className)} viewBox="0 0 24 24" fill="none" role="status" aria-label={label}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Centred spinner filling its container, for page and panel loading states. */
export function LoadingBlock({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex min-h-40 items-center justify-center text-indigo-600', className)}>
      <Spinner className="size-7" label={label} />
    </div>
  );
}
