import React from 'react';
import { CircleAlert, CircleCheck, CircleX, Info, X } from 'lucide-react';
import { cn } from './cn';

export function Empty({ title = 'No data', description, className }: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 text-center', className)}>
      <svg viewBox="0 0 64 48" className="h-12 w-16 text-slate-200" fill="none" aria-hidden="true">
        <path d="M8 18 16 6h32l8 12v22a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V18Z" fill="currentColor" />
        <path d="M8 18h14l3 6h14l3-6h14" stroke="#cbd5e1" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div className="text-sm font-medium text-slate-500">{title}</div>
      {description && <div className="max-w-sm text-sm text-slate-400">{description}</div>}
    </div>
  );
}

const alertTones = {
  info: 'border-indigo-100 bg-indigo-50/70 text-indigo-900',
  success: 'border-emerald-100 bg-emerald-50/70 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50/80 text-amber-900',
  error: 'border-red-100 bg-red-50/80 text-red-900',
};

type Status = keyof typeof alertTones;

/** Icon + color per status, shared by `Alert` and `Result`. */
const statusIcons: Record<Status, [typeof Info, string]> = {
  info: [Info, 'text-indigo-500'],
  success: [CircleCheck, 'text-emerald-500'],
  warning: [CircleAlert, 'text-amber-500'],
  error: [CircleX, 'text-red-500'],
};

function statusIcon(status: Status, className: string, strokeWidth?: number) {
  const [Icon, color] = statusIcons[status];
  return <Icon className={cn(className, color)} strokeWidth={strokeWidth} />;
}

export interface AlertProps {
  type?: Status;
  /** Heading (`message` is an alias). */
  title?: React.ReactNode;
  message?: React.ReactNode;
  /** Body text (`children` works too). */
  description?: React.ReactNode;
  children?: React.ReactNode;
  showIcon?: boolean;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  /** Full-width strip without rounded corners. */
  banner?: boolean;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Alert({ type: typeProp, title, message, description, children, showIcon, icon, closable, onClose, banner, action, className, style }: AlertProps) {
  const [closed, setClosed] = React.useState(false);
  if (closed) return null;
  const type = typeProp || (banner ? 'warning' : 'info');
  const heading = title ?? message;
  const body = description ?? children;
  return (
    <div
      role={type === 'error' ? 'alert' : 'note'}
      className={cn('flex items-start gap-2.5 border px-4 py-3 text-sm leading-relaxed', banner ? 'border-x-0' : 'rounded-xl', alertTones[type], className)}
      style={style}
    >
      {(showIcon || icon || banner) && <span className="mt-[3px] flex shrink-0">{icon ?? statusIcon(type, 'size-4')}</span>}
      <div className="min-w-0 flex-1">
        {heading && <div className={body ? 'font-semibold' : undefined}>{heading}</div>}
        {body && <div className={cn(heading && 'mt-0.5 opacity-90')}>{body}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {closable && (
        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            setClosed(true);
            onClose?.();
          }}
          className="-mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-60 hover:bg-black/5 hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/70', className)} />;
}

export function SkeletonLines({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className={cn('h-3.5', i === rows - 1 ? 'w-3/5' : 'w-full')} />)}
    </div>
  );
}

const pillTones = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  danger: 'bg-red-50 text-red-700 ring-red-600/15',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  info: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/10',
};

export type PillTone = keyof typeof pillTones;

/** Rounded status label, optionally with a leading dot. */
export function Pill({ tone = 'neutral', dot, className, children }: React.PropsWithChildren<{ tone?: PillTone; dot?: boolean; className?: string }>) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset', pillTones[tone], className)}>
      {dot && <i className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Monospace identifier chip (codes, keys, paths). */
export function Code({ className, children, title }: React.PropsWithChildren<{ className?: string; title?: string }>) {
  return (
    <code title={title} className={cn('inline-block max-w-full truncate rounded-md bg-slate-100 px-2 py-px align-middle font-mono text-[12.5px] leading-5 text-slate-700', className)}>
      {children}
    </code>
  );
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  /** Media above the body (e.g. an image). */
  cover?: React.ReactNode;
  size?: 'default' | 'small';
  bordered?: boolean;
  hoverable?: boolean;
}

/**
 * Surface. Without `title`/`cover` it is a plain rounded panel the
 * caller pads; with them it gets a header and a padded body.
 */
function CardBase({ title, cover, size = 'default', bordered = true, hoverable, className, children, ...rest }: CardProps) {
  const surface = cn(
    'rounded-2xl bg-white shadow-card',
    bordered ? 'border border-slate-200/70' : 'border border-transparent',
    hoverable && 'transition-shadow hover:shadow-float',
  );
  if (!title && !cover) {
    return <div className={cn(surface, className)} {...rest}>{children}</div>;
  }
  const small = size === 'small';
  return (
    <div className={cn(surface, 'flex flex-col overflow-hidden', className)} {...rest}>
      {title && (
        <div className={cn('flex items-center border-b border-slate-100', small ? 'min-h-11 px-4' : 'min-h-14 px-5')}>
          <div className={cn('min-w-0 truncate font-semibold text-slate-900', small ? 'text-sm' : 'text-[15px]')}>{title}</div>
        </div>
      )}
      {cover && <div className="[&_img]:block [&_img]:w-full">{cover}</div>}
      <div className={small ? 'p-4' : 'p-5'}>{children}</div>
    </div>
  );
}

/** Avatar + title + description block inside a card or list item. */
function CardMeta({ avatar, title, description, className, style }: {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn('flex min-w-0 items-start gap-3', className)} style={style}>
      {avatar && <div className="shrink-0">{avatar}</div>}
      <div className="min-w-0 flex-1">
        {title && <div className="truncate font-semibold text-slate-900">{title}</div>}
        {description && <div className="mt-0.5 text-sm text-slate-500">{description}</div>}
      </div>
    </div>
  );
}

type CardComponent = typeof CardBase & { Meta: typeof CardMeta };
export const Card = CardBase as CardComponent;
Card.Meta = CardMeta;
export { CardMeta };

/** Label/value list (simple `Descriptions`). */
export function DescriptionList({ items, className }: {
  items: Array<{ key?: React.Key; label: React.ReactNode; value: React.ReactNode }>;
  className?: string;
}) {
  return (
    <dl className={cn('m-0 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/70', className)}>
      {items.map((item, i) => (
        <div key={item.key ?? i} className="grid grid-cols-[minmax(120px,1fr)_2fr] gap-4 px-4 py-2.5 text-sm">
          <dt className="font-medium text-slate-500">{item.label}</dt>
          <dd className="m-0 min-w-0 break-words text-slate-800">{item.value ?? <span className="text-slate-300">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Full-page status: success / error / info / warning / 403 / 404 / 500. */
export function Result({ status, title, description, subTitle, action, extra, icon, className, style }: {
  status?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  subTitle?: React.ReactNode;
  action?: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const headIcon = icon ?? (status && status in statusIcons ? statusIcon(status as Status, 'size-16', 1.5) : undefined);
  const body = description ?? subTitle;
  const actions = action ?? extra;
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)} style={style}>
      {headIcon ? <div className="mb-1 flex">{headIcon}</div> : status && (
        <div className="bg-gradient-to-br from-indigo-400 to-indigo-700 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent">{status}</div>
      )}
      {title && <h2 className="m-0 text-xl font-semibold text-slate-900">{title}</h2>}
      {body && <p className="m-0 max-w-md text-sm text-slate-500">{body}</p>}
      {actions && <div className="mt-3 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
