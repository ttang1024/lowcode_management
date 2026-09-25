import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from './cn';

function CloseIcon() {
  return <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true"><path d="M3.7 2.6 8 6.9l4.3-4.3 1.1 1.1L9.1 8l4.3 4.3-1.1 1.1L8 9.1l-4.3 4.3-1.1-1.1L6.9 8 2.6 3.7z" /></svg>;
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  width?: number | string;
  className?: string;
  bodyClassName?: string;
  bodyStyle?: React.CSSProperties;
  /** Close when the backdrop is clicked (default true). */
  maskClosable?: boolean;
  /** Show the × button (default true). */
  closable?: boolean;
  /** Content at the right of the header, before the close button. */
  extra?: React.ReactNode;
}

function Header({ title, description }: Pick<OverlayProps, 'title' | 'description'>) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <DialogPrimitive.Title className="m-0 text-[17px] leading-6 font-semibold text-slate-900">{title}</DialogPrimitive.Title>
      {description ?
        <DialogPrimitive.Description className="m-0 text-sm text-slate-500">{description}</DialogPrimitive.Description> :
        <DialogPrimitive.Description className="sr-only">{typeof title === 'string' ? title : 'Dialog'}</DialogPrimitive.Description>}
    </div>
  );
}

const closeButton = 'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700';

/** Centred modal dialog. */
export function Dialog({
  open, onClose, title, description, footer, children, width = 520, className, bodyClassName, bodyStyle, maskClosable = true, closable = true, extra,
}: OverlayProps) {
  const hasHeader = title !== undefined && title !== null && title !== '';
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[1000] animate-fade-in bg-slate-900/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          data-lc-overlay=""
          style={{ width }}
          onPointerDownOutside={maskClosable ? undefined : (e) => e.preventDefault()}
          className={cn(
            'fixed top-[8vh] left-1/2 z-[1000] flex max-h-[84vh] max-w-[calc(100vw-32px)] -translate-x-1/2 animate-pop-in flex-col',
            'rounded-2xl bg-white shadow-float outline-none',
            className,
          )}
        >
          {hasHeader ? (
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-2">
              <Header title={title} description={description} />
              {extra}
              {closable && <DialogPrimitive.Close className={closeButton} aria-label="Close"><CloseIcon /></DialogPrimitive.Close>}
            </div>
          ) : (
            <>
              <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">Dialog</DialogPrimitive.Description>
              {closable && <DialogPrimitive.Close className={cn(closeButton, 'absolute top-3 right-3 z-[1]')} aria-label="Close"><CloseIcon /></DialogPrimitive.Close>}
            </>
          )}
          <div className={cn('min-h-0 flex-1 overflow-y-auto px-6', hasHeader ? 'py-3' : 'pt-6 pb-3', !footer && 'pb-6', bodyClassName)} style={bodyStyle}>{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 px-6 pt-3 pb-5">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface SheetProps extends OverlayProps {
  side?: 'right' | 'left';
  /**
   * `inspector`: non-modal floating card (no mask, no focus trap, stays open
   * while the page behind is used) — for editing something live.
   */
  inspector?: boolean;
  /** Accessible name when there is no visible title. */
  label?: string;
}

/** Side panel. Inspectors float below `--lc-sheet-top` (set by the host shell). */
export function Sheet({
  open, onClose, title, description, footer, children, width = 420, side = 'right', inspector, className, bodyClassName, bodyStyle, label = 'Panel',
  maskClosable = true, closable = true, extra,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} modal={!inspector} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        {!inspector && <DialogPrimitive.Overlay className="fixed inset-0 z-[1000] animate-fade-in bg-slate-900/40" />}
        <DialogPrimitive.Content
          data-lc-overlay=""
          style={{ width }}
          // An inspector edits the page behind it, so interacting there must not close it.
          onInteractOutside={inspector || !maskClosable ? (e) => e.preventDefault() : undefined}
          className={cn(
            'fixed z-[1000] flex max-w-[calc(100vw-24px)] flex-col bg-white outline-none',
            inspector ?
              'top-[var(--lc-sheet-top,12px)] right-3 bottom-3 animate-slide-in-right rounded-2xl shadow-float' :
              cn('inset-y-0 shadow-2xl', side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left'),
            className,
          )}
        >
          {title === undefined && (
            <>
              <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">{label}</DialogPrimitive.Description>
            </>
          )}
          {title !== undefined && (
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              {closable && <DialogPrimitive.Close className={closeButton} aria-label="Close"><CloseIcon /></DialogPrimitive.Close>}
              <Header title={title} description={description} />
              {extra && <div className="shrink-0">{extra}</div>}
            </div>
          )}
          <div className={cn('min-h-0 flex-1 overflow-y-auto', title !== undefined && 'px-5 py-4', bodyClassName)} style={bodyStyle}>{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
