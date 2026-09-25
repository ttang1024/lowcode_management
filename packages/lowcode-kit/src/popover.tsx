import React, { useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from './cn';

type Side = 'top' | 'right' | 'bottom' | 'left';
type Align = 'start' | 'center' | 'end';

/** Placement name (`topLeft`, `bottomRight`, …) → Radix side/align. */
export function toSideAlign(placement?: string): { side: Side; align: Align } {
  const m = /^(top|bottom|left|right)(Left|Right|Top|Bottom)?$/.exec(placement || '');
  if (!m) return { side: 'bottom', align: 'center' };
  const side = m[1] as Side;
  const edge = m[2];
  const align: Align = !edge ? 'center' : (edge === 'Left' || edge === 'Top') ? 'start' : 'end';
  return { side, align };
}

export interface PopoverProps {
  content?: React.ReactNode;
  title?: React.ReactNode;
  /** `click` (default) or `hover`. */
  trigger?: 'click' | 'hover';
  placement?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactElement;
}

/** Floating panel anchored to its trigger. */
export function Popover({ content, title, trigger = 'click', placement = 'bottom', open: openProp, onOpenChange, className, children }: PopoverProps) {
  const [inner, setInner] = useState(false);
  const open = openProp ?? inner;
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const setOpen = (next: boolean) => {
    setInner(next);
    onOpenChange?.(next);
  };
  const { side, align } = toSideAlign(placement);
  // Hover mode: open on enter, close shortly after leaving trigger or panel.
  const hover = trigger === 'hover' ? {
    onMouseEnter: () => {
      clearTimeout(timer.current);
      setOpen(true);
    },
    onMouseLeave: () => {
      timer.current = setTimeout(() => setOpen(false), 120);
    },
  } : {};

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild {...hover}>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          data-lc-overlay=""
          onOpenAutoFocus={trigger === 'hover' ? (e) => e.preventDefault() : undefined}
          {...hover}
          className={cn('z-[1100] max-w-[min(420px,calc(100vw-24px))] animate-pop-in rounded-xl border border-slate-100 bg-white p-3 text-sm text-slate-700 shadow-float outline-none', className)}
        >
          {title && <div className="mb-2 font-semibold text-slate-900">{title}</div>}
          {content}
          <PopoverPrimitive.Arrow className="fill-white" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export interface DropdownPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The field the panel hangs from; it gets the panel's min width. */
  anchor: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: Align;
  /** Keep focus in the anchor (e.g. a search input) instead of the panel. */
  keepFocus?: boolean;
  /** Classes for the element wrapping the anchor (its box sizes the panel). */
  anchorClassName?: string;
}

/**
 * Panel below a form field (select lists, calendars, cascades). The anchor is
 * not a trigger — the field decides when to open, so it can own typing,
 * clearing and keyboard navigation.
 */
export function DropdownPanel({ open, onOpenChange, anchor, children, className, align = 'start', keepFocus, anchorClassName }: DropdownPanelProps) {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Anchor asChild>
        <div ref={anchorRef} className={cn('relative w-full', anchorClassName)}>{anchor}</div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={4}
          data-lc-overlay=""
          onOpenAutoFocus={keepFocus ? (e) => e.preventDefault() : undefined}
          onCloseAutoFocus={(e) => e.preventDefault()}
          // Clicks back on the field toggle it themselves; don't double-close.
          onInteractOutside={(e) => {
            const target = e.target as Node | null;
            if (target && anchorRef.current?.contains(target)) e.preventDefault();
          }}
          className={cn(
            'z-[1100] min-w-[var(--radix-popover-trigger-width)] animate-pop-in overflow-hidden rounded-xl border border-slate-100 bg-white text-sm shadow-float outline-none',
            className,
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
