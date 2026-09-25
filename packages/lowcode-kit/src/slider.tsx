import React from 'react';
import { Star } from 'lucide-react';
import { cn } from './cn';
import { useDisabled } from './context';

type SliderValue = number | [number, number];

export interface SliderProps {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onChange?: (value: any) => void;
  /** Fires once dragging ends (same as `onChangeComplete`). */
  onAfterChange?: (value: any) => void;
  onChangeComplete?: (value: any) => void;
  min?: number;
  max?: number;
  step?: number | null;
  range?: boolean;
  disabled?: boolean;
  marks?: Record<number, React.ReactNode | { label?: React.ReactNode }>;
  /** `false` hides the value bubble; a function formats it. */
  tipFormatter?: ((value?: number) => React.ReactNode) | null;
  tooltip?: { formatter?: ((value?: number) => React.ReactNode) | null; open?: boolean };
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Single or range slider. */
export function Slider({
  value: valueProp, defaultValue, onChange, onAfterChange, onChangeComplete, min = 0, max = 100, step = 1, range, disabled: disabledProp,
  marks, tipFormatter, tooltip, className, style,
}: SliderProps) {
  const disabled = useDisabled(disabledProp);
  const fallback: SliderValue = range ? [min, min] : min;
  const [inner, setInner] = React.useState<SliderValue>(defaultValue ?? fallback);
  const raw = valueProp ?? inner;
  const values: number[] = range ?
    (Array.isArray(raw) ? raw.map(Number) : [min, Number(raw) || min]) :
    [Number(Array.isArray(raw) ? raw[0] : raw) || min];
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState<number | null>(null);
  const latest = React.useRef(values);
  latest.current = values;

  const format = tooltip?.formatter !== undefined ? tooltip.formatter : tipFormatter;
  const pct = (v: number) => ((clamp(v, min, max) - min) / (max - min || 1)) * 100;
  const snap = (v: number) => {
    const s = step || 1;
    const snapped = Math.round((v - min) / s) * s + min;
    return Number(clamp(snapped, min, max).toFixed(10));
  };

  const emit = (next: number[]) => {
    const sorted = range ? [Math.min(next[0], next[1]), Math.max(next[0], next[1])] as [number, number] : next[0];
    if (valueProp === undefined) setInner(sorted);
    onChange?.(sorted);
    return sorted;
  };

  const fromPointer = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return snap(min + ((clientX - rect.left) / rect.width) * (max - min));
  };

  const startDrag = (index: number, e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    setDragging(index);
    const move = (ev: PointerEvent) => {
      const next = latest.current.slice();
      next[index] = fromPointer(ev.clientX);
      emit(next);
    };
    const up = () => {
      setDragging(null);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const done = range ? latest.current : latest.current[0];
      onAfterChange?.(done);
      onChangeComplete?.(done);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onTrackDown = (e: React.PointerEvent) => {
    if (disabled || e.button !== 0) return;
    const v = fromPointer(e.clientX);
    // Move the nearest thumb, then keep dragging it.
    const index = range ? (Math.abs(values[0] - v) <= Math.abs(values[1] - v) ? 0 : 1) : 0;
    const next = values.slice();
    next[index] = v;
    emit(next);
    startDrag(index, e);
  };

  const onKey = (index: number, e: React.KeyboardEvent) => {
    const s = step || 1;
    const delta = { ArrowRight: s, ArrowUp: s, ArrowLeft: -s, ArrowDown: -s, PageUp: s * 10, PageDown: -s * 10 }[e.key];
    let v: number | undefined;
    if (delta !== undefined) v = snap(values[index] + delta);
    if (e.key === 'Home') v = min;
    if (e.key === 'End') v = max;
    if (v === undefined) return;
    e.preventDefault();
    const next = values.slice();
    next[index] = v;
    const done = emit(next);
    onAfterChange?.(done);
    onChangeComplete?.(done);
  };

  const lo = range ? Math.min(values[0], values[1]) : min;
  const hi = range ? Math.max(values[0], values[1]) : values[0];
  const markEntries = marks ? Object.entries(marks) : [];

  return (
    <div className={cn('relative w-full py-2 select-none', markEntries.length && 'pb-7', disabled && 'opacity-50', className)} style={style}>
      <div ref={trackRef} onPointerDown={onTrackDown} className={cn('relative h-1.5 rounded-full bg-slate-200', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
        <div className="absolute inset-y-0 rounded-full bg-indigo-500" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        {markEntries.map(([k]) => (
          <span key={k} className={cn('absolute top-1/2 size-2 -translate-1/2 rounded-full border-2 bg-white', Number(k) >= lo && Number(k) <= hi ? 'border-indigo-500' : 'border-slate-300')} style={{ left: `${pct(Number(k))}%` }} />
        ))}
        {values.map((v, i) => (
          <span
            key={i}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={v}
            aria-disabled={disabled || undefined}
            onPointerDown={(e) => {
              e.stopPropagation();
              startDrag(i, e);
            }}
            onKeyDown={(e) => onKey(i, e)}
            className={cn(
              'group absolute top-1/2 size-4 -translate-1/2 rounded-full border-2 border-indigo-500 bg-white shadow-sm outline-none transition-shadow',
              'hover:ring-4 hover:ring-indigo-500/15 focus-visible:ring-4 focus-visible:ring-indigo-500/25',
              disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
            )}
            style={{ left: `${pct(v)}%` }}
          >
            {format !== null && (
              <span
                className={cn(
                  'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-white tabular-nums',
                  tooltip?.open || dragging === i ? 'block' : 'hidden group-hover:block group-focus-visible:block',
                )}
              >
                {format ? format(v) : v}
              </span>
            )}
          </span>
        ))}
      </div>
      {markEntries.map(([k, mark]) => (
        <span key={k} className="absolute top-6 -translate-x-1/2 text-xs whitespace-nowrap text-slate-500" style={{ left: `${pct(Number(k))}%` }}>
          {mark && typeof mark === 'object' && 'label' in (mark as any) ? (mark as any).label : mark as React.ReactNode}
        </span>
      ))}
    </div>
  );
}

export interface RateProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  /** Clicking the current value again clears it (default true). */
  allowClear?: boolean;
  character?: React.ReactNode;
  disabled?: boolean;
  tooltips?: string[];
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/** Star rating. */
export function Rate({ value: valueProp, defaultValue = 0, onChange, count = 5, allowHalf, allowClear = true, character, disabled: disabledProp, tooltips, className, style }: RateProps) {
  const disabled = useDisabled(disabledProp);
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp ?? inner;
  const [hover, setHover] = React.useState<number | null>(null);
  const shown = hover ?? value;

  const pick = (v: number) => {
    const next = allowClear && v === value ? 0 : v;
    if (valueProp === undefined) setInner(next);
    onChange?.(next);
  };

  const glyph = character ?? <Star className="size-[1em]" fill="currentColor" strokeWidth={0} />;
  return (
    <span
      role="radiogroup"
      className={cn('inline-flex items-center gap-1 text-xl leading-none', disabled ? 'pointer-events-none' : 'cursor-pointer', className)}
      style={style}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: count }, (_, i) => {
        const full = shown >= i + 1;
        const half = !full && allowHalf && shown >= i + 0.5;
        const valueAt = (e: React.MouseEvent) => {
          if (!allowHalf) return i + 1;
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          return e.clientX - rect.left < rect.width / 2 ? i + 0.5 : i + 1;
        };
        return (
          <span
            key={i}
            role="radio"
            aria-checked={value >= i + 1}
            aria-label={tooltips?.[i] || `${i + 1} of ${count}`}
            title={tooltips?.[i]}
            tabIndex={disabled ? -1 : 0}
            onMouseMove={(e) => setHover(valueAt(e))}
            onClick={(e) => pick(valueAt(e))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pick(i + 1);
              }
            }}
            className="relative inline-flex text-slate-200 outline-none transition-transform hover:scale-110 focus-visible:scale-110"
          >
            {glyph}
            {(full || half) && (
              <span className="absolute inset-y-0 left-0 overflow-hidden text-amber-400" style={{ width: full ? '100%' : '50%' }}>{glyph}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}
