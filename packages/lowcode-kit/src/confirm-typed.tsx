import React, { useState } from 'react';
import { Button } from './button';
import { Dialog } from './dialog';
import { Input } from './input';

export interface ConfirmTypedProps {
  title: React.ReactNode;
  /** What will be removed and what it affects. */
  description?: React.ReactNode;
  /** Text the user must type exactly (e.g. the record's code). */
  confirmText: string;
  actionLabel?: string;
  onConfirm: () => unknown;
  /** The control that opens the dialog. */
  children: React.ReactElement<any>;
}

/**
 * Destructive confirmation that requires typing `confirmText` before the
 * action button enables — for deletes that can't be undone.
 */
export function ConfirmTyped({ title, description, confirmText, actionLabel = 'Delete', onConfirm, children }: ConfirmTypedProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setOpen(false);
    setTyped('');
  };

  const confirm = async() => {
    setBusy(true);
    try {
      await onConfirm();
      close();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {React.cloneElement(children, { onClick: () => setOpen(true) })}
      <Dialog
        open={open}
        onClose={close}
        width={460}
        title={title}
        description={description}
        footer={(
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="danger" loading={busy} disabled={typed !== confirmText} onClick={confirm}>{actionLabel}</Button>
          </>
        )}
      >
        <label className="flex flex-col gap-2 text-sm text-slate-600">
          <span>
            Type <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800">{confirmText}</code> to confirm.
          </span>
          <Input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && typed === confirmText && !busy) confirm();
            }}
            aria-label={`Type ${confirmText} to confirm`}
          />
        </label>
      </Dialog>
    </>
  );
}
