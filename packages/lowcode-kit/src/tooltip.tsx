import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from './cn';
import { toSideAlign } from './popover';

export interface TooltipProps {
  title?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  /** Placement name (`top`, `bottomLeft`, …); wins over side/align. */
  placement?: string;
  open?: boolean;
  children: React.ReactElement;
  className?: string;
  [key: string]: any;
}

/** Hover/focus hint. Renders the child untouched when there is no title. */
export function Tooltip({ title, side = 'top', align = 'center', placement, open, children, className }: TooltipProps) {
  if (title === undefined || title === null || title === '') return children;
  const pos = placement ? toSideAlign(placement) : { side, align };
  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root open={open}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={pos.side}
            align={pos.align}
            sideOffset={6}
            className={cn(
              'z-[2000] max-w-xs animate-fade-in rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium break-words text-white shadow-lg',
              className,
            )}
          >
            {title}
            <TooltipPrimitive.Arrow className="fill-slate-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
