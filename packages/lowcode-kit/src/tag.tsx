import React from 'react';
import { User, X } from 'lucide-react';
import { cn } from './cn';

/* ----------------------------------- Tag ---------------------------------- */

/** Preset tag color names → tones. */
const presets: Record<string, string> = {
  default: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  processing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  geekblue: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
  error: 'bg-red-50 text-red-700 ring-red-600/15',
  red: 'bg-red-50 text-red-700 ring-red-600/15',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  gold: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  volcano: 'bg-orange-50 text-orange-800 ring-orange-700/20',
  magenta: 'bg-pink-50 text-pink-700 ring-pink-600/15',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/15',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  lime: 'bg-lime-50 text-lime-700 ring-lime-600/20',
};

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** A preset (`success`, `blue`, …) or any CSS color. */
  color?: string;
  closable?: boolean;
  onClose?: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
  bordered?: boolean;
}

export function Tag({ color, closable, onClose, icon, bordered = true, className, style, children, ...rest }: TagProps) {
  const [closed, setClosed] = React.useState(false);
  if (closed) return null;
  const preset = color ? presets[color] : presets.default;
  const custom = color && !preset ? { backgroundColor: color, color: '#fff' } : undefined;
  return (
    <span
      className={cn(
        'inline-flex h-6 max-w-full items-center gap-1 rounded-md px-2 align-middle text-xs font-medium whitespace-nowrap',
        preset, bordered && preset && 'ring-1 ring-inset', className,
      )}
      style={{ ...custom, ...style }}
      {...rest}
    >
      {icon}
      <span className="truncate">{children}</span>
      {closable && (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e) => {
            onClose?.(e);
            if (!e.defaultPrevented) setClosed(true);
          }}
          className="-mr-0.5 flex cursor-pointer rounded opacity-60 hover:opacity-100"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

/* ---------------------------------- Badge --------------------------------- */

const statusColors: Record<string, string> = {
  success: 'bg-emerald-500',
  processing: 'bg-indigo-500',
  default: 'bg-slate-300',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
};

export interface BadgeProps {
  count?: React.ReactNode;
  dot?: boolean;
  showZero?: boolean;
  overflowCount?: number;
  /** Status dot + `text`, without children. */
  status?: 'success' | 'processing' | 'default' | 'error' | 'warning';
  text?: React.ReactNode;
  color?: string;
  /** `[x, y]` nudge of the indicator. */
  offset?: [number | string, number | string];
  size?: 'default' | 'small';
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function BadgeBase({ count, dot, showZero, overflowCount = 99, status, text, color, offset, size, title, className, style, children }: BadgeProps) {
  const custom = color && !statusColors[color] ? { backgroundColor: color } : undefined;
  if ((status || color) && children === undefined && count === undefined) {
    return (
      <span className={cn('inline-flex items-center gap-2 text-sm text-slate-700', className)} style={style}>
        <span className={cn('relative flex size-2 rounded-full', statusColors[status || color || 'default'] || '')} style={custom}>
          {status === 'processing' && <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-60" />}
        </span>
        {text}
      </span>
    );
  }
  const numeric = typeof count === 'number' || (typeof count === 'string' && count !== '' && !Number.isNaN(Number(count)));
  const n = numeric ? Number(count) : 0;
  const hidden = !dot && (count === undefined || count === null || (numeric && n === 0 && !showZero));
  const label = numeric && n > overflowCount ? `${overflowCount}+` : count;
  const small = size === 'small';
  const indicator = hidden ? null : dot ? (
    <span className={cn('block size-2 rounded-full ring-2 ring-white', statusColors[status || ''] || 'bg-red-500')} style={custom} />
  ) : (
    <span
      title={title ?? (numeric ? String(count) : undefined)}
      className={cn(
        'flex items-center justify-center rounded-full bg-red-500 font-semibold whitespace-nowrap text-white tabular-nums ring-2 ring-white',
        small ? 'h-4 min-w-4 px-1 text-[10px]' : 'h-5 min-w-5 px-1.5 text-xs',
      )}
      style={custom}
    >
      {label}
    </span>
  );
  if (children === undefined || children === null) {
    return <span className={cn('inline-flex align-middle', className)} style={style}>{indicator}</span>;
  }
  const [dx, dy] = offset || [0, 0];
  const px = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);
  return (
    <span className={cn('relative inline-flex align-middle', className)} style={style}>
      {children}
      {indicator && (
        <span className="absolute top-0 right-0 z-[1] translate-x-1/2 -translate-y-1/2" style={{ marginRight: `calc(-1 * ${px(dx)})`, marginTop: px(dy) }}>
          {indicator}
        </span>
      )}
    </span>
  );
}

export interface RibbonProps {
  text?: React.ReactNode;
  color?: string;
  placement?: 'start' | 'end';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Corner ribbon over a card or image. */
function Ribbon({ text, color, placement = 'end', className, style, children }: RibbonProps) {
  const preset = color && statusColors[color];
  return (
    <div className={cn('relative', className)} style={style}>
      {children}
      <div
        className={cn(
          'absolute top-2 z-[1] px-2.5 py-0.5 text-xs leading-5 font-medium whitespace-nowrap text-white shadow-sm',
          placement === 'end' ? '-right-1 rounded-l-md rounded-tr-md' : '-left-1 rounded-r-md rounded-tl-md',
          preset || (!color && 'bg-indigo-600'),
        )}
        style={color && !preset ? { backgroundColor: color } : undefined}
      >
        {text}
      </div>
    </div>
  );
}

type BadgeComponent = typeof BadgeBase & { Ribbon: typeof Ribbon };
export const Badge = BadgeBase as BadgeComponent;
Badge.Ribbon = Ribbon;
export { Ribbon };

/* --------------------------------- Avatar --------------------------------- */

export interface AvatarProps {
  src?: string;
  icon?: React.ReactNode;
  alt?: string;
  size?: number | 'small' | 'default' | 'large';
  shape?: 'circle' | 'square';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const avatarSizes = { small: 24, default: 32, large: 40 };

export function Avatar({ src, icon, alt = '', size = 'default', shape = 'circle', className, style, children }: AvatarProps) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);
  const px = typeof size === 'number' ? size : avatarSizes[size] || 32;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden bg-slate-200 align-middle font-medium whitespace-nowrap text-slate-600 select-none',
        shape === 'square' ? 'rounded-lg' : 'rounded-full',
        className,
      )}
      style={{ width: px, height: px, fontSize: Math.max(12, px * 0.42), ...style }}
    >
      {src && !failed ?
        <img src={src} alt={alt} onError={() => setFailed(true)} className="size-full object-cover" /> :
        icon ?? children ?? <User className="size-[55%]" />}
    </span>
  );
}
