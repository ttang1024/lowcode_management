import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from './cn';
import { CardMeta, Empty } from './feedback';
import { Spinner } from './spinner';

/* -------------------------------- Progress -------------------------------- */

export interface ProgressProps {
  percent?: number;
  type?: 'line' | 'circle' | 'dashboard';
  status?: 'success' | 'exception' | 'normal' | 'active';
  showInfo?: boolean;
  strokeColor?: string;
  trailColor?: string;
  strokeWidth?: number;
  /** Circle diameter in px. */
  width?: number;
  size?: 'small' | 'default' | number;
  format?: (percent?: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export function Progress({ percent = 0, type = 'line', status, showInfo = true, strokeColor, trailColor, strokeWidth, width, size, format, className, style }: ProgressProps) {
  const p = Math.min(100, Math.max(0, Number(percent) || 0));
  const state = status || (p >= 100 ? 'success' : 'normal');
  const tone = state === 'exception' ? '#dc2626' : state === 'success' ? '#16a34a' : '#4f46e5';
  const color = strokeColor || tone;
  const info = format ? format(p) :
    state === 'exception' ? <X className="size-[1.1em]" /> :
      state === 'success' ? <Check className="size-[1.1em]" /> :
        `${Math.round(p)}%`;

  if (type === 'circle' || type === 'dashboard') {
    const d = width ?? (typeof size === 'number' ? size : size === 'small' ? 80 : 120);
    const sw = strokeWidth ?? 6;
    const r = 50 - sw / 2;
    const circ = 2 * Math.PI * r;
    const gap = type === 'dashboard' ? 0.25 : 0; // open quarter at the bottom
    const track = circ * (1 - gap);
    const rotate = type === 'dashboard' ? 90 + 45 : -90;
    return (
      <div role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100} className={cn('relative inline-flex items-center justify-center', className)} style={{ width: d, height: d, ...style }}>
        <svg viewBox="0 0 100 100" className="size-full" style={{ transform: `rotate(${rotate}deg)` }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke={trailColor || '#e2e8f0'} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${track} ${circ}`} />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${(track * p) / 100} ${circ}`} className="transition-[stroke-dasharray] duration-500" />
        </svg>
        {showInfo && <span className="absolute font-semibold text-slate-700 tabular-nums" style={{ fontSize: Math.max(12, d * 0.18), color: state === 'normal' || state === 'active' ? undefined : tone }}>{info}</span>}
      </div>
    );
  }

  const h = strokeWidth ?? (size === 'small' ? 6 : 8);
  return (
    <div role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100} className={cn('flex w-full items-center gap-2.5', className)} style={style}>
      <div className="relative flex-1 overflow-hidden rounded-full" style={{ height: h, backgroundColor: trailColor || '#e2e8f0' }}>
        <div className="relative h-full overflow-hidden rounded-full transition-[width] duration-500" style={{ width: `${p}%`, backgroundColor: color }}>
          {state === 'active' && <div className="absolute inset-0 animate-pulse bg-white/30" />}
        </div>
      </div>
      {showInfo && <span className="min-w-9 shrink-0 text-right text-[13px] text-slate-600 tabular-nums" style={{ color: state === 'normal' || state === 'active' ? undefined : tone }}>{info}</span>}
    </div>
  );
}

/* -------------------------------- Statistic ------------------------------- */

export interface StatisticProps {
  title?: React.ReactNode;
  value?: number | string;
  precision?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  groupSeparator?: string;
  decimalSeparator?: string;
  valueStyle?: React.CSSProperties;
  loading?: boolean;
  formatter?: (value?: number | string) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export function Statistic({ title, value, precision, prefix, suffix, groupSeparator = ',', decimalSeparator = '.', valueStyle, loading, formatter, className, style }: StatisticProps) {
  let shown: React.ReactNode = value;
  if (formatter) {
    shown = formatter(value);
  } else if (value !== undefined && value !== null && value !== '' && !Number.isNaN(Number(value))) {
    const raw = precision !== undefined ? Number(value).toFixed(precision) : String(value);
    const [int, dec] = raw.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
    shown = (
      <>
        {grouped}
        {dec !== undefined && <span className="text-[0.66em]">{decimalSeparator}{dec}</span>}
      </>
    );
  }
  return (
    <div className={className} style={style}>
      {title && <div className="mb-1 text-sm text-slate-500">{title}</div>}
      <div className="flex items-baseline gap-1 text-2xl font-semibold text-slate-900 tabular-nums" style={valueStyle}>
        {loading ? <Spinner className="size-6 text-indigo-600" /> : (
          <>
            {prefix && <span className="flex self-center text-[0.8em]">{prefix}</span>}
            <span>{shown}</span>
            {suffix && <span className="text-base font-medium">{suffix}</span>}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Steps --------------------------------- */

type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepItem {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: StepStatus;
  disabled?: boolean;
}

export interface StepsProps {
  current?: number;
  items?: StepItem[];
  direction?: 'horizontal' | 'vertical';
  size?: 'default' | 'small';
  /** Status of the current step. */
  status?: StepStatus;
  /** Steps become clickable. */
  onChange?: (current: number) => void;
  initial?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}

function Step(_props: StepItem) {
  return null;
}

function StepsBase({ current = 0, items, direction = 'horizontal', size, status = 'process', onChange, initial = 0, className, style, children }: StepsProps) {
  const list: StepItem[] = items || React.Children.toArray(children).filter(React.isValidElement).map((c) => (c as React.ReactElement<StepItem>).props);
  const vertical = direction === 'vertical';
  const small = size === 'small';
  return (
    <ol className={cn('m-0 flex list-none p-0', vertical ? 'flex-col' : 'items-start', className)} style={style}>
      {list.map((item, i) => {
        const index = i + initial;
        const s: StepStatus = item.status || (index < current ? 'finish' : index === current ? status : 'wait');
        const clickable = !!onChange && !item.disabled && index !== current;
        const dot = (
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full font-semibold tabular-nums transition-colors',
              small ? 'size-6 text-xs' : 'size-8 text-sm',
              item.icon ? 'text-lg' : '',
              s === 'finish' && (item.icon ? 'text-indigo-600' : 'bg-indigo-50 text-indigo-600'),
              s === 'process' && (item.icon ? 'text-indigo-600' : 'bg-indigo-600 text-white'),
              s === 'wait' && (item.icon ? 'text-slate-300' : 'border border-slate-300 text-slate-400'),
              s === 'error' && (item.icon ? 'text-red-500' : 'bg-red-50 text-red-600'),
            )}
          >
            {item.icon ?? (s === 'finish' ? <Check className="size-4" /> : s === 'error' ? <X className="size-4" /> : index + 1)}
          </span>
        );
        const last = i === list.length - 1;
        return (
          <li
            key={i}
            aria-current={index === current ? 'step' : undefined}
            onClick={clickable ? () => onChange!(index) : undefined}
            className={cn('flex min-w-0 gap-3', !last && 'flex-1', vertical && 'pb-1', clickable && 'group cursor-pointer')}
          >
            <div className={cn('flex shrink-0', vertical ? 'flex-col items-center' : 'items-center')}>
              {dot}
              {vertical && !last && <span className={cn('my-1 w-px flex-1 min-h-6', index < current ? 'bg-indigo-400' : 'bg-slate-200')} />}
            </div>
            <div className={cn('min-w-0', !vertical && 'flex flex-1 flex-col', vertical && 'pb-4')}>
              <div className="flex items-center gap-2">
                <span className={cn('font-medium whitespace-nowrap', small ? 'text-sm leading-6' : 'text-[15px] leading-8', s === 'wait' ? 'text-slate-400' : s === 'error' ? 'text-red-600' : 'text-slate-900', clickable && 'group-hover:text-indigo-600')}>
                  {item.title}
                </span>
                {item.subTitle && <span className="text-[13px] whitespace-nowrap text-slate-400">{item.subTitle}</span>}
                {!vertical && !last && <span className={cn('h-px min-w-6 flex-1', index < current ? 'bg-indigo-400' : 'bg-slate-200')} />}
              </div>
              {item.description && <div className={cn('text-[13px]', s === 'wait' ? 'text-slate-400' : 'text-slate-500', !vertical && 'pr-4')}>{item.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type StepsComponent = typeof StepsBase & { Step: typeof Step };
export const Steps = StepsBase as StepsComponent;
Steps.Step = Step;

/* -------------------------------- Timeline -------------------------------- */

export interface TimelineItem {
  label?: React.ReactNode;
  children?: React.ReactNode;
  color?: string;
  dot?: React.ReactNode;
}

export interface TimelineProps {
  items?: TimelineItem[];
  mode?: 'left' | 'right' | 'alternate';
  /** Trailing "in progress" entry (`true` shows a spinner only). */
  pending?: React.ReactNode;
  reverse?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const dotColors: Record<string, string> = { blue: 'border-indigo-500', green: 'border-emerald-500', red: 'border-red-500', gray: 'border-slate-300' };

function TimelineEntry(_props: TimelineItem) {
  return null;
}

function TimelineBase({ items, mode, pending, reverse, className, style, children }: TimelineProps) {
  let list: TimelineItem[] = items || React.Children.toArray(children).filter(React.isValidElement).map((c) => (c as React.ReactElement<TimelineItem>).props);
  if (pending) list = [...list, { children: pending === true ? null : pending, dot: <Spinner className="size-3.5 text-indigo-500" /> }];
  if (reverse) list = list.slice().reverse();
  const hasLabels = list.some((it) => it.label !== undefined && it.label !== null && it.label !== '');
  const centered = hasLabels || mode === 'alternate' || mode === 'right';

  return (
    <ul className={cn('m-0 list-none p-0', className)} style={style}>
      {list.map((it, i) => {
        const last = i === list.length - 1;
        const flip = mode === 'right' || (mode === 'alternate' && i % 2 === 1);
        const dot = it.dot ?? (
          <span className={cn('block size-2.5 rounded-full border-2 bg-white', dotColors[it.color || 'blue'] || '')} style={it.color && !dotColors[it.color] ? { borderColor: it.color } : undefined} />
        );
        const rail = (
          <div className="relative flex w-4 shrink-0 flex-col items-center">
            <span className="flex h-5 items-center">{dot}</span>
            {!last && <span className="w-0.5 flex-1 bg-slate-200" />}
          </div>
        );
        const content = <div className={cn('min-w-0 pb-5 text-sm leading-5 text-slate-700', centered && 'flex-1')}>{it.children}</div>;
        const label = <div className="min-w-0 flex-1 pb-5 text-[13px] leading-5 text-slate-500">{it.label}</div>;
        return (
          <li key={i} className="flex gap-3">
            {centered ? (flip ? <>{React.cloneElement(content, { className: cn(content.props.className, 'text-right') })}{rail}{label}</> : <>{React.cloneElement(label, { className: cn(label.props.className, 'text-right') })}{rail}{content}</>) : <>{rail}{content}</>}
          </li>
        );
      })}
    </ul>
  );
}

type TimelineComponent = typeof TimelineBase & { Item: typeof TimelineEntry };
export const Timeline = TimelineBase as TimelineComponent;
Timeline.Item = TimelineEntry;

/* ------------------------------ Descriptions ------------------------------ */

export interface DescriptionsItem {
  key?: React.Key;
  label?: React.ReactNode;
  children?: React.ReactNode;
  span?: number;
}

export interface DescriptionsProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  items?: DescriptionsItem[];
  bordered?: boolean;
  column?: number;
  size?: 'default' | 'middle' | 'small';
  layout?: 'horizontal' | 'vertical';
  colon?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function DescriptionsEntry(_props: DescriptionsItem) {
  return null;
}

/** Pack items into rows of `column` cells; the last item of a row fills it. */
function packRows(items: DescriptionsItem[], column: number) {
  const rows: Array<Array<DescriptionsItem & { span: number }>> = [];
  let row: Array<DescriptionsItem & { span: number }> = [];
  let used = 0;
  items.forEach((it, i) => {
    const span = Math.min(Math.max(it.span || 1, 1), column);
    if (used + span > column && row.length) {
      row[row.length - 1].span += column - used;
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push({ ...it, span });
    used += span;
    if (i === items.length - 1) {
      row[row.length - 1].span += column - used;
      rows.push(row);
    }
  });
  return rows;
}

function DescriptionsBase({ title, extra, items, bordered, column = 3, size, layout = 'horizontal', colon = true, className, style, children }: DescriptionsProps) {
  const list: DescriptionsItem[] = items || React.Children.toArray(children).filter(React.isValidElement).map((c) => ({ key: c.key ?? undefined, ...(c as React.ReactElement<DescriptionsItem>).props }));
  const rows = packRows(list, Math.max(1, column));
  const pad = size === 'small' ? 'px-3 py-1.5' : size === 'middle' ? 'px-4 py-2.5' : 'px-4 py-3';
  const labelCell = cn(bordered ? cn('border border-slate-200 bg-slate-50 font-medium text-slate-600', pad) : 'pr-2 pb-3 align-top text-slate-500', 'text-left text-sm font-normal whitespace-nowrap');
  const valueCell = cn(bordered ? cn('border border-slate-200', pad) : 'pb-3 align-top', 'text-sm break-words text-slate-800');
  const colonText = colon && !bordered ? ':' : '';

  return (
    <div className={className} style={style}>
      {(title || extra) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-[15px] font-semibold text-slate-900">{title}</div>
          {extra}
        </div>
      )}
      <div className={cn(bordered && 'overflow-hidden rounded-xl border border-slate-200')}>
        <table className={cn('w-full table-fixed border-collapse', bordered && '-m-px w-[calc(100%+2px)]')}>
          <tbody>
            {rows.map((row, r) => layout === 'vertical' ? (
              <React.Fragment key={r}>
                <tr>{row.map((it, i) => <th key={it.key ?? i} colSpan={it.span} className={cn(labelCell, !bordered && 'pb-1')}>{it.label}</th>)}</tr>
                <tr>{row.map((it, i) => <td key={it.key ?? i} colSpan={it.span} className={valueCell}>{it.children}</td>)}</tr>
              </React.Fragment>
            ) : (
              <tr key={r}>
                {row.map((it, i) => bordered ? (
                  <React.Fragment key={it.key ?? i}>
                    <th className={cn(labelCell, 'w-[1%]')}>{it.label}</th>
                    <td colSpan={it.span * 2 - 1} className={valueCell}>{it.children}</td>
                  </React.Fragment>
                ) : (
                  <td key={it.key ?? i} colSpan={it.span} className="pb-3 align-top text-sm">
                    <span className="mr-2 text-slate-500">{it.label}{colonText}</span>
                    <span className="break-words text-slate-800">{it.children}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type DescriptionsComponent = typeof DescriptionsBase & { Item: typeof DescriptionsEntry };
export const Descriptions = DescriptionsBase as DescriptionsComponent;
Descriptions.Item = DescriptionsEntry;

/* ---------------------------------- List ---------------------------------- */

interface ListContextValue {
  split: boolean;
  vertical: boolean;
  size?: string;
  grid: boolean;
}
const ListContext = React.createContext<ListContextValue>({ split: true, vertical: false, grid: false });

export interface ListProps<T = any> {
  dataSource?: T[];
  renderItem?: (item: T, index: number) => React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  bordered?: boolean;
  split?: boolean;
  size?: 'small' | 'default' | 'large';
  loading?: boolean;
  /** Card grid instead of rows. */
  grid?: { gutter?: number; column?: number; [key: string]: any };
  itemLayout?: 'horizontal' | 'vertical' | string;
  rowKey?: string | ((item: T) => React.Key);
  emptyText?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}

function ListBase<T = any>({ dataSource, renderItem, header, footer, bordered, split = true, size, loading, grid, itemLayout, rowKey, emptyText, className, style, children }: ListProps<T>) {
  const keyOf = (item: any, i: number): React.Key => (typeof rowKey === 'function' ? rowKey(item) : rowKey && item ? item[rowKey] ?? i : i);
  const rows = (dataSource || []).map((item, i) => <React.Fragment key={keyOf(item, i)}>{renderItem?.(item, i)}</React.Fragment>);
  const pad = size === 'small' ? 'px-4 py-2' : size === 'large' ? 'px-6 py-4' : 'px-5 py-3';
  const ctx = { split, vertical: itemLayout === 'vertical', size, grid: !!grid };
  const empty = !loading && rows.length === 0 && !children;

  return (
    <ListContext.Provider value={ctx}>
      <div className={cn('relative', bordered && 'rounded-xl border border-slate-200', className)} style={style}>
        {header && <div className={cn(bordered ? pad : 'py-3', 'font-medium text-slate-900', split && 'border-b border-slate-100')}>{header}</div>}
        {grid ? (
          <div className="grid" style={{ gap: grid.gutter ?? 16, gridTemplateColumns: grid.column ? `repeat(${grid.column}, minmax(0, 1fr))` : 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {rows}
          </div>
        ) : (
          <div className={cn(split && 'divide-y divide-slate-100', bordered && '[&>*]:px-5')}>{rows}{children}</div>
        )}
        {empty && <Empty className="py-10" title={emptyText ?? 'No data'} />}
        {footer && <div className={cn(bordered ? pad : 'py-3', 'text-slate-500', split && 'border-t border-slate-100')}>{footer}</div>}
        {loading && (
          <div className="absolute inset-0 flex min-h-24 items-center justify-center bg-white/60 text-indigo-600">
            <Spinner className="size-6" />
          </div>
        )}
      </div>
    </ListContext.Provider>
  );
}

export interface ListItemProps {
  actions?: React.ReactNode[];
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function ListItemBase({ actions, extra, className, style, children }: ListItemProps) {
  const ctx = React.useContext(ListContext);
  const actionRow = actions && actions.length > 0 && (
    <ul className="m-0 flex shrink-0 list-none items-center gap-3 p-0 text-sm text-slate-500">
      {actions.map((a, i) => <li key={i}>{a}</li>)}
    </ul>
  );
  if (ctx.grid) return <div className={className} style={style}>{children}</div>;
  return (
    <div className={cn('flex gap-4', ctx.size === 'small' ? 'py-2' : 'py-3', ctx.vertical ? 'flex-col' : 'items-center', className)} style={style}>
      <div className={cn('flex min-w-0 flex-1', ctx.vertical ? 'flex-col gap-2' : 'items-center gap-4')}>
        <div className="min-w-0 flex-1">{children}</div>
        {!ctx.vertical && actionRow}
      </div>
      {ctx.vertical && actionRow}
      {extra && <div className="shrink-0">{extra}</div>}
    </div>
  );
}

type ListItemComponent = typeof ListItemBase & { Meta: typeof CardMeta };
const ListItem = ListItemBase as ListItemComponent;
ListItem.Meta = CardMeta;

type ListComponent = typeof ListBase & { Item: ListItemComponent };
export const List = ListBase as ListComponent;
List.Item = ListItem;

/* --------------------------------- Comment -------------------------------- */

export interface CommentProps {
  author?: React.ReactNode;
  avatar?: React.ReactNode;
  content?: React.ReactNode;
  datetime?: React.ReactNode;
  actions?: React.ReactNode[];
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Author + avatar + body, nesting replies as children. */
export function Comment({ author, avatar, content, datetime, actions, className, style, children }: CommentProps) {
  return (
    <div className={cn('flex gap-3 py-3', className)} style={style}>
      {avatar && <div className="size-8 shrink-0 overflow-hidden rounded-full [&_img]:size-full [&_img]:object-cover">{avatar}</div>}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
          {author && <span className="font-medium text-slate-800">{author}</span>}
          {datetime && <span className="text-slate-400">{datetime}</span>}
        </div>
        <div className="mt-1 text-sm break-words text-slate-700">{content}</div>
        {actions && actions.length > 0 && <div className="mt-2 flex gap-3 text-[13px] text-slate-500">{actions}</div>}
        {children && <div className="mt-1">{children}</div>}
      </div>
    </div>
  );
}
