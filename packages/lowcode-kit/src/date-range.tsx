import React from 'react';
import { cn } from './cn';
import { fieldClass } from './input';

export interface DateRangeInputProps {
  /** `[from, to]` as ISO timestamps (start of the first day, end of the last). */
  value?: [string, string] | null;
  onChange?: (value: [string, string] | undefined) => void;
  className?: string;
}

const toDay = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Local-day bounds, so a range filter includes the whole of both days.
const startOf = (day: string) => new Date(`${day}T00:00:00`).toISOString();
const endOf = (day: string) => new Date(`${day}T23:59:59.999`).toISOString();

/**
 * From/to date filter. Emits a range only once both ends are set, in the same
 * shape the range filters store (ISO strings), so server `BETWEEN`
 * filters keep working.
 */
export function DateRangeInput({ value, onChange, className }: DateRangeInputProps) {
  const [from, setFrom] = React.useState(toDay(value?.[0]));
  const [to, setTo] = React.useState(toDay(value?.[1]));

  React.useEffect(() => {
    setFrom(toDay(value?.[0]));
    setTo(toDay(value?.[1]));
  }, [value?.[0], value?.[1]]);

  const update = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
    if (nextFrom && nextTo) {
      const [a, b] = nextFrom <= nextTo ? [nextFrom, nextTo] : [nextTo, nextFrom];
      onChange?.([startOf(a), endOf(b)]);
    } else if (!nextFrom && !nextTo) {
      onChange?.(undefined);
    }
  };

  const input = cn(fieldClass, 'h-9 w-[150px] px-2.5 tabular-nums');
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <input type="date" aria-label="From" className={input} value={from} max={to || undefined} onChange={(e) => update(e.target.value, to)} />
      <span className="text-slate-400">→</span>
      <input type="date" aria-label="To" className={input} value={to} min={from || undefined} onChange={(e) => update(from, e.target.value)} />
    </span>
  );
}
