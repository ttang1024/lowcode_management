import React from 'react';
import { cn } from './cn';
import { Spinner } from './spinner';
import { Empty } from './feedback';

export interface TableColumn<Row = any> {
  key?: React.Key;
  title?: React.ReactNode;
  dataIndex?: string | string[];
  render?: (value: any, row: Row, index: number) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  /** Truncate long cell content to one line. */
  ellipsis?: boolean;
  className?: string;
  /** Extra props for the header cell (e.g. designer double-click handlers). */
  onHeaderCell?: () => React.ThHTMLAttributes<HTMLTableCellElement>;
}

export interface TableProps<Row = any> {
  columns: TableColumn<Row>[];
  rows: Row[];
  rowKey?: string | ((row: Row, index: number) => React.Key);
  loading?: boolean;
  empty?: React.ReactNode;
  className?: string;
  onRowClick?: (row: Row) => void;
  /** Row density; `small`/`middle` tighten cell padding. */
  density?: 'default' | 'middle' | 'small';
}

const cellPadding = { default: 'py-3.5', middle: 'py-2.5', small: 'py-1.5' };

function readPath(row: any, path: string | string[] | undefined) {
  if (path === undefined || path === null || row == null) return undefined;
  const parts = Array.isArray(path) ? path : String(path).split('.');
  return parts.reduce((v, k) => (v == null ? v : v[k]), row);
}

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

/** Lightweight data table for list pages. */
export function Table<Row = any>({ columns, rows, rowKey = 'id', loading, empty, className, onRowClick, density = 'default' }: TableProps<Row>) {
  const keyOf = (row: Row, i: number) => (typeof rowKey === 'function' ? rowKey(row, i) : (readPath(row, rowKey) ?? i)) as React.Key;

  return (
    <div className={cn('relative overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50/80">
            {columns.map((col, i) => {
              const extra = col.onHeaderCell?.() || {};
              return (
                <th
                  key={col.key ?? String(col.dataIndex ?? i)}
                  style={{ width: col.width }}
                  {...extra}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase first:pl-5 last:pr-5',
                    alignClass[col.align || 'left'],
                    extra.className,
                  )}
                >
                  {col.title}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr
              key={keyOf(row, r)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn('border-b border-slate-100 transition-colors last:border-b-0 hover:bg-indigo-50/40', onRowClick && 'cursor-pointer')}
            >
              {columns.map((col, c) => {
                const value = readPath(row, col.dataIndex);
                const content = col.render ? col.render(value, row, r) : (value as React.ReactNode);
                return (
                  <td
                    key={col.key ?? String(col.dataIndex ?? c)}
                    className={cn(
                      'px-4 align-middle text-slate-700 first:pl-5 last:pr-5',
                      cellPadding[density] || cellPadding.default,
                      alignClass[col.align || 'left'],
                      col.ellipsis && 'max-w-0 truncate',
                      col.className,
                    )}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && !loading && (empty ?? <Empty className="py-14" />)}
      {rows.length === 0 && loading && <div className="h-40" />}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-indigo-600">
          <Spinner className="size-7" />
        </div>
      )}
    </div>
  );
}
