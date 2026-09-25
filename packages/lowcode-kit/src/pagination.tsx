import React from 'react';
import { cn } from './cn';

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

// Page numbers with ellipses: 1 … 4 5 [6] 7 8 … 20
function pages(current: number, count: number): Array<number | '…'> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: Array<number | '…'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(count - 1, current + 1);
  if (start > 2) out.push('…');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < count - 1) out.push('…');
  out.push(count);
  return out;
}

const cell = 'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-sm tabular-nums transition';

export function Pagination({ current, pageSize, total, onChange, pageSizeOptions = [10, 20, 50, 100], className }: PaginationProps) {
  const count = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);

  return (
    <nav className={cn('flex flex-wrap items-center gap-3 text-sm', className)} aria-label="Pagination">
      <span className="mr-auto text-[13px] text-slate-500 tabular-nums">{from}–{to} of {total.toLocaleString()}</span>
      <div className="flex items-center gap-1">
        <button type="button" className={cn(cell, 'text-slate-500 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40')} disabled={current <= 1} onClick={() => onChange(current - 1, pageSize)} aria-label="Previous page">‹</button>
        {pages(current, count).map((p, i) => p === '…' ?
          <span key={`gap-${i}`} className="px-1 text-slate-400">…</span> :
          (
            <button
              key={p}
              type="button"
              aria-current={p === current ? 'page' : undefined}
              onClick={() => onChange(p, pageSize)}
              className={cn(cell, p === current ? 'bg-indigo-50 font-semibold text-indigo-700 ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-slate-100')}
            >
              {p}
            </button>
          ))}
        <button type="button" className={cn(cell, 'text-slate-500 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40')} disabled={current >= count} onClick={() => onChange(current + 1, pageSize)} aria-label="Next page">›</button>
      </div>
      <select
        value={pageSize}
        onChange={(e) => onChange(1, Number(e.target.value))}
        aria-label="Rows per page"
        className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white pr-7 pl-2.5 text-sm text-slate-700 outline-none hover:border-indigo-300 focus:border-indigo-500"
      >
        {pageSizeOptions.map((n) => <option key={n} value={n}>{n} / page</option>)}
      </select>
    </nav>
  );
}
