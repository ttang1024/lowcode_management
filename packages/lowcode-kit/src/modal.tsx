/**
 * `Modal` / `Drawer` (prop-driven wrappers over the kit `Dialog` / `Sheet`) and
 * imperative dialogs:
 *
 *   Modal.confirm({ title: 'Delete?', content: '…', danger: true, onOk: () => api.remove() });
 *   Modal.error({ title: 'Save failed', content: error.message });
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { CircleAlert, CircleCheck, CircleX, Info } from 'lucide-react';
import { Button, type ButtonProps } from './button';
import { Dialog, Sheet } from './dialog';

export interface ModalProps {
  open?: boolean;
  /** Alias of `open`. */
  visible?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** `null` hides the footer; omitted shows Cancel / OK. */
  footer?: React.ReactNode | null;
  width?: number | string;
  onOk?: (e: React.MouseEvent) => unknown;
  onCancel?: (e?: React.SyntheticEvent) => void;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  confirmLoading?: boolean;
  okButtonProps?: ButtonProps & { danger?: boolean };
  cancelButtonProps?: ButtonProps;
  okType?: 'primary' | 'danger';
  maskClosable?: boolean;
  closable?: boolean;
  className?: string;
  bodyStyle?: React.CSSProperties;
  bodyClassName?: string;
  /** Accepted and ignored (content always unmounts on close). */
  destroyOnClose?: boolean;
  centered?: boolean;
  wrapClassName?: string;
  zIndex?: number;
  afterClose?: () => void;
}

function ModalBase({
  open, visible, title, children, footer, width = 520, onOk, onCancel, okText = 'OK', cancelText = 'Cancel', confirmLoading,
  okButtonProps, cancelButtonProps, okType, maskClosable, closable, className, bodyStyle, bodyClassName, afterClose,
}: ModalProps) {
  const isOpen = !!(open ?? visible);
  const wasOpen = React.useRef(isOpen);
  React.useEffect(() => {
    if (wasOpen.current && !isOpen) afterClose?.();
    wasOpen.current = isOpen;
  }, [isOpen]);
  const { danger, ...okRest } = okButtonProps || {};
  const defaultFooter = (
    <>
      <Button {...cancelButtonProps} onClick={(e) => onCancel?.(e)}>{cancelText}</Button>
      <Button variant={danger || okType === 'danger' ? 'danger' : 'primary'} loading={confirmLoading} {...okRest} onClick={(e) => onOk?.(e)}>{okText}</Button>
    </>
  );
  return (
    <Dialog
      open={isOpen}
      onClose={() => onCancel?.()}
      title={title}
      width={width}
      footer={footer === undefined ? defaultFooter : footer}
      maskClosable={maskClosable}
      closable={closable}
      className={className}
      bodyStyle={bodyStyle}
      bodyClassName={bodyClassName}
    >
      {children}
    </Dialog>
  );
}

export interface DrawerProps {
  open?: boolean;
  visible?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  extra?: React.ReactNode;
  placement?: 'right' | 'left';
  width?: number | string;
  onClose?: () => void;
  maskClosable?: boolean;
  closable?: boolean;
  /** No mask and no focus trap; the page behind stays usable. */
  inspector?: boolean;
  className?: string;
  bodyStyle?: React.CSSProperties;
  bodyClassName?: string;
  destroyOnClose?: boolean;
}

export function Drawer({ open, visible, title, children, footer, extra, placement = 'right', width = 420, onClose, maskClosable, closable, inspector, className, bodyStyle, bodyClassName }: DrawerProps) {
  return (
    <Sheet
      open={!!(open ?? visible)}
      onClose={() => onClose?.()}
      title={title}
      footer={footer}
      extra={extra}
      side={placement}
      width={width}
      maskClosable={maskClosable}
      closable={closable}
      inspector={inspector}
      className={className}
      bodyStyle={bodyStyle}
      bodyClassName={bodyClassName}
    >
      {children}
    </Sheet>
  );
}

/* ------------------------------- imperative ------------------------------- */

type ConfirmType = 'confirm' | 'info' | 'success' | 'error' | 'warning';

export interface ConfirmConfig {
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  /** May return a promise; the dialog shows a spinner until it settles. */
  onOk?: () => unknown;
  onCancel?: () => void;
  danger?: boolean;
  okType?: 'primary' | 'danger';
  icon?: React.ReactNode;
  width?: number | string;
  /** Show a Cancel button (default: only for `confirm`). */
  okCancel?: boolean;
  maskClosable?: boolean;
  [key: string]: any;
}

const toneIcons: Record<ConfirmType, React.ReactNode> = {
  confirm: <CircleAlert className="size-6 text-amber-500" />,
  warning: <CircleAlert className="size-6 text-amber-500" />,
  info: <Info className="size-6 text-indigo-500" />,
  success: <CircleCheck className="size-6 text-emerald-500" />,
  error: <CircleX className="size-6 text-red-500" />,
};

function ConfirmDialog({ type, config, onDone }: { type: ConfirmType; config: ConfirmConfig; onDone: () => void }) {
  const [open, setOpen] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const close = () => {
    setOpen(false);
    setTimeout(onDone, 200);
  };
  const cancel = () => {
    config.onCancel?.();
    close();
  };
  const ok = async() => {
    setBusy(true);
    try {
      await config.onOk?.();
      close();
    } catch (error) {
      // A rejected onOk keeps the dialog open.
      console.error(error);
    } finally {
      setBusy(false);
    }
  };
  const showCancel = config.okCancel ?? type === 'confirm';
  return (
    <Dialog
      open={open}
      onClose={cancel}
      width={config.width ?? 420}
      closable={false}
      maskClosable={config.maskClosable ?? false}
      footer={(
        <>
          {showCancel && <Button onClick={cancel}>{config.cancelText ?? 'Cancel'}</Button>}
          <Button autoFocus variant={config.danger || config.okType === 'danger' ? 'danger' : 'primary'} loading={busy} onClick={ok}>{config.okText ?? 'OK'}</Button>
        </>
      )}
    >
      <div className="flex gap-3.5">
        <span className="flex shrink-0">{config.icon ?? toneIcons[type]}</span>
        <div className="min-w-0 flex-1 pt-0.5">
          {config.title && <div className="text-base font-semibold text-slate-900">{config.title}</div>}
          {config.content && <div className="mt-1.5 text-sm break-words text-slate-600">{config.content}</div>}
        </div>
      </div>
    </Dialog>
  );
}

function show(type: ConfirmType, config: ConfirmConfig) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  let current = config;
  const destroy = () => {
    root.unmount();
    host.remove();
  };
  const render = () => root.render(<ConfirmDialog type={type} config={current} onDone={destroy} />);
  render();
  return {
    destroy,
    update: (next: Partial<ConfirmConfig> | ((prev: ConfirmConfig) => ConfirmConfig)) => {
      current = typeof next === 'function' ? next(current) : { ...current, ...next };
      render();
    },
  };
}

export const modal = {
  confirm: (config: ConfirmConfig) => show('confirm', config),
  info: (config: ConfirmConfig) => show('info', config),
  success: (config: ConfirmConfig) => show('success', config),
  error: (config: ConfirmConfig) => show('error', config),
  warning: (config: ConfirmConfig) => show('warning', config),
};

type ModalComponent = typeof ModalBase & typeof modal;
/** Modal dialog with OK / Cancel footer; also `Modal.confirm()` etc. */
export const Modal = Object.assign(ModalBase, modal) as ModalComponent;
