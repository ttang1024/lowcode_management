import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from './cn';
import { Spinner } from './spinner';

/* ---------------------------------- Space --------------------------------- */

const gaps = { small: 8, middle: 16, large: 24 };

export interface SpaceProps {
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'large' | number | [number, number];
  align?: 'start' | 'end' | 'center' | 'baseline';
  wrap?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function SpaceBase({ direction = 'horizontal', size = 'small', align, wrap, className, style, children }: SpaceProps) {
  const [x, y] = Array.isArray(size) ? size : [typeof size === 'number' ? size : gaps[size], typeof size === 'number' ? size : gaps[size]];
  const vertical = direction === 'vertical';
  return (
    <div
      className={cn('inline-flex', vertical ? 'flex-col' : 'flex-row', wrap && 'flex-wrap', className)}
      style={{ columnGap: x, rowGap: y, alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align ?? (vertical ? undefined : 'center'), ...style }}
    >
      {children}
    </div>
  );
}

/** Joined controls (e.g. an input with a button); inner corners are squared off. */
function Compact({ className, style, block, children }: { className?: string; style?: React.CSSProperties; block?: boolean; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        block ? 'flex w-full' : 'inline-flex', 'items-stretch',
        '[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)_*]:rounded-l-none',
        '[&>*:not(:last-child)]:rounded-r-none [&>*:not(:last-child)_*]:rounded-r-none [&>*:focus-within]:z-[1]',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

type SpaceComponent = typeof SpaceBase & { Compact: typeof Compact };
export const Space = SpaceBase as SpaceComponent;
Space.Compact = Compact;

/* ---------------------------------- Spin ---------------------------------- */

export interface SpinProps {
  spinning?: boolean;
  /** Only show after this many ms, so fast loads don't flash a spinner. */
  delay?: number;
  tip?: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const spinSizes = { small: 'size-4', default: 'size-6', large: 'size-9' };

export function Spin({ spinning = true, delay, tip, size = 'default', className, style, children }: SpinProps) {
  const [shown, setShown] = React.useState(spinning && !delay);
  React.useEffect(() => {
    if (!spinning) return setShown(false);
    if (!delay) return setShown(true);
    const id = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(id);
  }, [spinning, delay]);

  const indicator = (
    <span className="flex flex-col items-center gap-2 text-indigo-600" role="status" aria-live="polite">
      <Spinner className={spinSizes[size]} />
      {tip && <span className="text-[13px] text-slate-500">{tip}</span>}
    </span>
  );
  if (children === undefined) {
    return shown ? <div className={cn('flex items-center justify-center', className)} style={style}>{indicator}</div> : null;
  }
  return (
    <div className={cn('relative', className)} style={style} aria-busy={shown || undefined}>
      <div className={cn('transition-opacity', shown && 'pointer-events-none opacity-50 select-none')}>{children}</div>
      {shown && <div className="absolute inset-0 z-[4] flex max-h-[400px] items-center justify-center">{indicator}</div>}
    </div>
  );
}

/* ------------------------------- Breadcrumb ------------------------------- */

export interface BreadcrumbItem {
  key?: React.Key;
  title?: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function Breadcrumb({ items = [], separator, className, style }: {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className} style={style}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-[13px] text-slate-500">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.key ?? i} className="flex items-center gap-1.5">
              {it.href || it.onClick ? (
                <a href={it.href} onClick={it.onClick} className="rounded text-slate-500 no-underline hover:text-slate-900">{it.title}</a>
              ) : <span aria-current={last ? 'page' : undefined} className={cn(last && 'text-slate-900')}>{it.title}</span>}
              {!last && <span aria-hidden="true" className="flex text-slate-300">{separator ?? <ChevronRight className="size-3.5" />}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------- Carousel -------------------------------- */

export interface CarouselProps {
  autoplay?: boolean;
  autoplaySpeed?: number;
  dots?: boolean;
  dotPosition?: 'top' | 'bottom' | 'left' | 'right';
  effect?: 'scrollx' | 'fade';
  afterChange?: (current: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}

/** Slide show; swipe, dots or autoplay move between slides. */
export function Carousel({ autoplay, autoplaySpeed = 3000, dots = true, dotPosition = 'bottom', effect = 'scrollx', afterChange, className, style, children }: CarouselProps) {
  const slides = React.Children.toArray(children);
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const touch = React.useRef<number | null>(null);
  const count = slides.length;

  const go = (next: number) => {
    const i = (next + count) % Math.max(count, 1);
    setIndex(i);
    afterChange?.(i);
  };

  React.useEffect(() => {
    if (!autoplay || paused || count < 2) return;
    const id = setInterval(() => setIndex((i) => {
      const next = (i + 1) % count;
      afterChange?.(next);
      return next;
    }), autoplaySpeed);
    return () => clearInterval(id);
  }, [autoplay, autoplaySpeed, paused, count]);

  const vertical = dotPosition === 'left' || dotPosition === 'right';
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={style}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
      aria-roledescription="carousel"
    >
      {effect === 'fade' ? (
        <div className="relative size-full">
          {slides.map((s, i) => (
            <div key={i} aria-hidden={i !== index} className={cn('size-full transition-opacity duration-500', i === 0 ? 'relative' : 'absolute inset-0', i === index ? 'opacity-100' : 'pointer-events-none opacity-0')}>{s}</div>
          ))}
        </div>
      ) : (
        <div className="flex size-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((s, i) => <div key={i} aria-hidden={i !== index} className="size-full shrink-0">{s}</div>)}
        </div>
      )}
      {dots && count > 1 && (
        <div
          className={cn(
            'absolute z-[1] flex gap-1.5',
            vertical ? 'top-1/2 -translate-y-1/2 flex-col' : 'left-1/2 -translate-x-1/2',
            dotPosition === 'bottom' && 'bottom-3', dotPosition === 'top' && 'top-3',
            dotPosition === 'left' && 'left-3', dotPosition === 'right' && 'right-3',
          )}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={cn('cursor-pointer rounded-full bg-white shadow-sm transition-all', i === index ? (vertical ? 'h-5 w-1.5' : 'h-1.5 w-5') : 'size-1.5 opacity-50 hover:opacity-80')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
