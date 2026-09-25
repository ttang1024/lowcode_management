import React, { useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Button } from './button';
import { toSideAlign } from './popover';

export interface ConfirmProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: React.ReactNode;
  /** Alias of `confirmText`. */
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  danger?: boolean;
  onConfirm?: () => unknown;
  onCancel?: () => void;
  /** Controlled visibility (e.g. to ask before a programmatic action). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Clicking the trigger does not open the popover (it acts normally). */
  disabled?: boolean;
  placement?: string;
  children: React.ReactElement;
}

/** Inline "are you sure?" popover anchored to its trigger. */
export function Confirm({
  title, description, confirmText, okText, cancelText = 'Cancel', danger, onConfirm, onCancel, open: openProp, onOpenChange, disabled, placement = 'topRight', children,
}: ConfirmProps) {
  const [inner, setInner] = useState(false);
  const [busy, setBusy] = useState(false);
  const open = openProp ?? inner;
  const setOpen = (next: boolean) => {
    setInner(next);
    onOpenChange?.(next);
  };
  const { side, align } = toSideAlign(placement);

  const confirm = async() => {
    setBusy(true);
    try {
      await onConfirm?.();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };
  const cancel = () => {
    onCancel?.();
    setOpen(false);
  };

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && open) onCancel?.();
        setOpen(next);
      }}
    >
      {disabled ? <PopoverPrimitive.Anchor asChild>{children}</PopoverPrimitive.Anchor> : <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          data-lc-overlay=""
          onClick={(e) => e.stopPropagation()}
          className="z-[1500] w-72 animate-pop-in rounded-xl border border-slate-100 bg-white p-4 shadow-float outline-none"
        >
          <div className="flex gap-3">
            <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${danger ? 'bg-red-500' : 'bg-amber-500'}`}>!</span>
            <div className="min-w-0 text-sm">
              <div className="font-medium break-words text-slate-900">{title}</div>
              {description && <div className="mt-1 text-slate-500">{description}</div>}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" onClick={cancel}>{cancelText}</Button>
            <Button size="sm" variant={danger ? 'danger' : 'primary'} loading={busy} onClick={confirm}>{confirmText ?? okText ?? 'Confirm'}</Button>
          </div>
          <PopoverPrimitive.Arrow className="fill-white" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
