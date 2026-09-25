/**
 * Date, range and time pickers. Values are `moment` objects, so stored
 * values and the moment converters keep working.
 */
import React from 'react';
import moment, { type Moment } from 'moment';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock } from 'lucide-react';
import { cn } from './cn';
import { controlHeight, normalizeSize, useDisabled } from './context';
import { ClearButton, fieldShellClass } from './input';
import { DropdownPanel } from './popover';
import { Button } from './button';

export type PickerType = 'date' | 'week' | 'month' | 'quarter' | 'year';
type Mode = 'date' | 'month' | 'quarter' | 'year';
type DisabledDate = (current: Moment) => boolean;

export function toMoment(value: any): Moment | null {
  if (value === null || value === undefined || value === '') return null;
  const m = moment.isMoment(value) ? value : moment(value);
  return m.isValid() ? m : null;
}

function defaultFormat(picker: PickerType = 'date', showTime?: boolean | { format?: string }) {
  if (picker === 'week') return 'gggg-wo';
  if (picker === 'month') return 'YYYY-MM';
  if (picker === 'quarter') return 'YYYY-[Q]Q';
  if (picker === 'year') return 'YYYY';
  if (showTime) return `YYYY-MM-DD ${typeof showTime === 'object' && showTime.format ? showTime.format : 'HH:mm:ss'}`;
  return 'YYYY-MM-DD';
}

const firstFormat = (format?: string | string[]) => (Array.isArray(format) ? format[0] : format);

/** Start of the period a picker selects. */
function periodStart(m: Moment, picker: PickerType) {
  if (picker === 'month') return m.clone().startOf('month');
  if (picker === 'quarter') return m.clone().startOf('quarter');
  if (picker === 'year') return m.clone().startOf('year');
  return m.clone();
}

const periodUnit: Record<PickerType, moment.unitOfTime.StartOf> = { date: 'day', week: 'week', month: 'month', quarter: 'quarter', year: 'year' };

/* --------------------------------- panels --------------------------------- */

const navButton = 'flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700';
const headerLabel = 'cursor-pointer rounded-md px-1.5 py-0.5 font-semibold text-slate-800 hover:text-indigo-600';

interface CalendarPanelProps {
  picker: PickerType;
  viewDate: Moment;
  onViewDateChange: (m: Moment) => void;
  onSelect: (m: Moment) => void;
  selected?: Moment | null;
  /** Range highlighting (start/end may be a hover preview). */
  rangeStart?: Moment | null;
  rangeEnd?: Moment | null;
  onHover?: (m: Moment | null) => void;
  disabledDate?: DisabledDate;
  /** Hide the prev / next arrows (the inner edges of a two-panel range). */
  hidePrev?: boolean;
  hideNext?: boolean;
}

function CalendarPanel({ picker, viewDate, onViewDateChange, onSelect, selected, rangeStart, rangeEnd, onHover, disabledDate, hidePrev, hideNext }: CalendarPanelProps) {
  const base: Mode = picker === 'week' ? 'date' : picker;
  const [mode, setMode] = React.useState<Mode>(base);
  React.useEffect(() => setMode(base), [base]);
  const today = moment();
  const unit = mode === 'date' ? 'day' : mode;

  const cellState = (m: Moment) => {
    const u = mode === 'date' ? (picker === 'week' ? 'week' : 'day') : mode;
    const isSelected = !!selected && m.isSame(selected, u);
    const lo = rangeStart && rangeEnd && rangeStart.isAfter(rangeEnd) ? rangeEnd : rangeStart;
    const hi = rangeStart && rangeEnd && rangeStart.isAfter(rangeEnd) ? rangeStart : rangeEnd;
    const isEdge = (!!lo && m.isSame(lo, unit)) || (!!hi && m.isSame(hi, unit));
    const inRange = !!lo && !!hi && m.isAfter(lo, unit) && m.isBefore(hi, unit);
    return { isSelected: isSelected || isEdge, inRange, disabled: !!disabledDate?.(m) };
  };

  const cell = (key: string, m: Moment, label: React.ReactNode, opts: { muted?: boolean; wide?: boolean; current?: boolean }, onPick: () => void) => {
    const { isSelected, inRange, disabled } = cellState(m);
    return (
      <div key={key} className={cn('flex items-center justify-center py-0.5', inRange && 'bg-indigo-50')} onMouseEnter={() => onHover?.(m)}>
        <button
          type="button"
          disabled={disabled}
          onClick={onPick}
          className={cn(
            'flex cursor-pointer items-center justify-center rounded-md text-[13px] tabular-nums transition-colors',
            opts.wide ? 'h-9 w-full max-w-16' : 'size-8',
            opts.muted ? 'text-slate-300' : 'text-slate-700',
            !isSelected && 'hover:bg-slate-100',
            opts.current && !isSelected && 'ring-1 ring-indigo-400 ring-inset',
            isSelected && 'bg-indigo-600 font-semibold text-white',
            disabled && 'cursor-not-allowed bg-slate-50 text-slate-300 hover:bg-slate-50',
          )}
        >
          {label}
        </button>
      </div>
    );
  };

  const shift = (amount: number, u: moment.unitOfTime.DurationConstructor) => onViewDateChange(viewDate.clone().add(amount, u));

  let header: React.ReactNode;
  let body: React.ReactNode;

  if (mode === 'date') {
    const start = viewDate.clone().startOf('month').startOf('week');
    const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => start.clone().add(w * 7 + d, 'day')));
    const weekdays = moment.weekdaysMin(true);
    header = (
      <>
        <span className="flex">
          {!hidePrev && <button type="button" className={navButton} aria-label="Previous year" onClick={() => shift(-1, 'year')}><ChevronsLeft className="size-4" /></button>}
          {!hidePrev && <button type="button" className={navButton} aria-label="Previous month" onClick={() => shift(-1, 'month')}><ChevronLeft className="size-4" /></button>}
        </span>
        <span className="flex items-center">
          <button type="button" className={headerLabel} onClick={() => setMode('month')}>{viewDate.format('MMM')}</button>
          <button type="button" className={headerLabel} onClick={() => setMode('year')}>{viewDate.format('YYYY')}</button>
        </span>
        <span className="flex">
          {!hideNext && <button type="button" className={navButton} aria-label="Next month" onClick={() => shift(1, 'month')}><ChevronRight className="size-4" /></button>}
          {!hideNext && <button type="button" className={navButton} aria-label="Next year" onClick={() => shift(1, 'year')}><ChevronsRight className="size-4" /></button>}
        </span>
      </>
    );
    body = (
      <div className={cn('grid gap-y-0.5', picker === 'week' ? 'grid-cols-8' : 'grid-cols-7')} onMouseLeave={() => onHover?.(null)}>
        {picker === 'week' && <span className="py-1 text-center text-xs text-slate-300">Wk</span>}
        {weekdays.map((d) => <span key={d} className="py-1 text-center text-xs font-medium text-slate-400">{d}</span>)}
        {weeks.map((days, w) => (
          <React.Fragment key={w}>
            {picker === 'week' && <span className="flex items-center justify-center text-xs text-slate-300 tabular-nums">{days[0].week()}</span>}
            {days.map((m) => cell(
              m.format('YYYYMMDD'), m, m.date(),
              { muted: m.month() !== viewDate.month(), current: m.isSame(today, 'day') },
              () => onSelect(m.clone().hour(0).minute(0).second(0).millisecond(0)),
            ))}
          </React.Fragment>
        ))}
      </div>
    );
  } else if (mode === 'month' || mode === 'quarter') {
    header = (
      <>
        <span className="flex">{!hidePrev && <button type="button" className={navButton} aria-label="Previous year" onClick={() => shift(-1, 'year')}><ChevronsLeft className="size-4" /></button>}</span>
        <button type="button" className={headerLabel} onClick={() => setMode('year')}>{viewDate.format('YYYY')}</button>
        <span className="flex">{!hideNext && <button type="button" className={navButton} aria-label="Next year" onClick={() => shift(1, 'year')}><ChevronsRight className="size-4" /></button>}</span>
      </>
    );
    const quarters = mode === 'quarter';
    const items = quarters ?
      [0, 1, 2, 3].map((q) => viewDate.clone().startOf('year').add(q, 'quarter')) :
      Array.from({ length: 12 }, (_, i) => viewDate.clone().startOf('year').add(i, 'month'));
    body = (
      <div className={cn('grid gap-y-2 py-2', quarters ? 'grid-cols-4' : 'grid-cols-3')} onMouseLeave={() => onHover?.(null)}>
        {items.map((m) => cell(
          m.format('YYYYMM'), m, quarters ? `Q${m.quarter()}` : m.format('MMM'),
          { wide: true, current: m.isSame(today, quarters ? 'quarter' : 'month') },
          () => {
            if (picker === mode) return onSelect(m);
            onViewDateChange(viewDate.clone().month(m.month()));
            setMode(base);
          },
        ))}
      </div>
    );
  } else {
    const decade = Math.floor(viewDate.year() / 10) * 10;
    header = (
      <>
        <span className="flex">{!hidePrev && <button type="button" className={navButton} aria-label="Previous decade" onClick={() => shift(-10, 'year')}><ChevronsLeft className="size-4" /></button>}</span>
        <span className="font-semibold text-slate-800 tabular-nums">{decade}–{decade + 9}</span>
        <span className="flex">{!hideNext && <button type="button" className={navButton} aria-label="Next decade" onClick={() => shift(10, 'year')}><ChevronsRight className="size-4" /></button>}</span>
      </>
    );
    const years = Array.from({ length: 12 }, (_, i) => viewDate.clone().startOf('year').year(decade - 1 + i));
    body = (
      <div className="grid grid-cols-3 gap-y-2 py-2" onMouseLeave={() => onHover?.(null)}>
        {years.map((m, i) => cell(
          String(m.year()), m, m.year(),
          { wide: true, muted: i === 0 || i === 11, current: m.isSame(today, 'year') },
          () => {
            if (picker === 'year') return onSelect(m);
            onViewDateChange(viewDate.clone().year(m.year()));
            setMode(base === 'date' ? 'month' : base);
          },
        ))}
      </div>
    );
  }

  return (
    <div className="w-[272px] p-3">
      <div className="mb-2 flex h-7 items-center justify-between">{header}</div>
      {body}
    </div>
  );
}

/* ---------------------------------- time ---------------------------------- */

interface TimeColumnsProps {
  value: Moment | null;
  onChange: (m: Moment) => void;
  format: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  className?: string;
}

function TimeColumn({ items, selected, onPick, label }: { items: number[]; selected: number | undefined; onPick: (n: number) => void; label: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el && ref.current) ref.current.scrollTo({ top: el.offsetTop - 4, behavior: 'smooth' });
  }, [selected]);
  return (
    <div ref={ref} role="listbox" aria-label={label} className="relative h-56 w-14 overflow-y-auto overscroll-contain border-l border-slate-100 py-1 first:border-l-0 [scrollbar-width:thin]">
      {items.map((n) => (
        <button
          key={n}
          type="button"
          role="option"
          aria-selected={n === selected}
          onClick={() => onPick(n)}
          className={cn('mx-auto block h-7 w-11 cursor-pointer rounded-md text-[13px] tabular-nums', n === selected ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-100')}
        >
          {String(n).padStart(2, '0')}
        </button>
      ))}
      <div className="h-48" aria-hidden="true" />
    </div>
  );
}

function TimeColumns({ value, onChange, format, hourStep = 1, minuteStep = 1, secondStep = 1, className }: TimeColumnsProps) {
  const base = value || moment().startOf('day');
  const range = (count: number, step: number) => Array.from({ length: Math.ceil(count / step) }, (_, i) => i * step);
  const set = (unit: 'hour' | 'minute' | 'second', n: number) => onChange(base.clone().set(unit, n));
  return (
    <div className={cn('flex', className)}>
      {/[Hh]/.test(format) && <TimeColumn label="Hours" items={range(24, hourStep)} selected={value?.hour()} onPick={(n) => set('hour', n)} />}
      {/m/.test(format) && <TimeColumn label="Minutes" items={range(60, minuteStep)} selected={value?.minute()} onPick={(n) => set('minute', n)} />}
      {/s/.test(format) && <TimeColumn label="Seconds" items={range(60, secondStep)} selected={value?.second()} onPick={(n) => set('second', n)} />}
    </div>
  );
}

/* ---------------------------------- field --------------------------------- */

interface FieldProps {
  open: boolean;
  onOpen: () => void;
  disabled?: boolean;
  size?: string;
  status?: string;
  icon: React.ReactNode;
  clearable: boolean;
  onClear: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function PickerField({ open, onOpen, disabled, size, status, icon, clearable, onClear, className, style, children }: FieldProps) {
  return (
    <div
      aria-disabled={disabled || undefined}
      aria-invalid={status === 'error' || undefined}
      onClick={() => !disabled && onOpen()}
      className={cn('group relative', fieldShellClass, controlHeight[normalizeSize(size)], 'cursor-pointer gap-2 pr-9 pl-3', open && 'border-indigo-500 ring-3 ring-indigo-500/15', className)}
      style={style}
    >
      {children}
      <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-400">
        {clearable && !disabled ? (
          <>
            <ClearButton
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }} className="hidden group-hover:flex"
            />
            <span className="group-hover:hidden">{icon}</span>
          </>
        ) : icon}
      </span>
    </div>
  );
}

const inputClass = 'h-full min-w-0 flex-1 bg-transparent tabular-nums outline-none placeholder:text-slate-400 disabled:cursor-not-allowed';

/* ------------------------------- DatePicker ------------------------------- */

export interface DatePickerProps {
  value?: Moment | string | null;
  defaultValue?: Moment | null;
  onChange?: (value: Moment | null, dateString: string) => void;
  picker?: PickerType;
  showTime?: boolean | { format?: string; defaultValue?: Moment };
  format?: string | string[];
  disabledDate?: DisabledDate;
  allowClear?: boolean;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large' | 'default';
  status?: 'error' | 'warning' | '';
  showToday?: boolean;
  showNow?: boolean;
  inputReadOnly?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

function DatePickerBase({
  value: valueProp, defaultValue, onChange, picker = 'date', showTime, format: formatProp, disabledDate, allowClear = true, placeholder,
  disabled: disabledProp, size, status, showToday = true, showNow, inputReadOnly, onOpenChange, className, style,
}: DatePickerProps) {
  const disabled = useDisabled(disabledProp);
  const [inner, setInner] = React.useState<Moment | null>(toMoment(defaultValue));
  const value = valueProp !== undefined ? toMoment(valueProp) : inner;
  const format = firstFormat(formatProp) || defaultFormat(picker, showTime);
  const timeFormat = typeof showTime === 'object' && showTime.format ? showTime.format : 'HH:mm:ss';
  const [open, setOpenState] = React.useState(false);
  const [draft, setDraft] = React.useState<Moment | null>(value);
  const [viewDate, setViewDate] = React.useState<Moment>(value || moment());
  const [text, setText] = React.useState<string | null>(null);

  const setOpen = (next: boolean) => {
    if (next) {
      setDraft(value);
      setViewDate(value || moment());
    } else if (showTime && draft && !(value && draft.isSame(value))) {
      // Closing a date-time panel keeps what was picked (like leaving the field).
      commit(draft);
    }
    setText(null);
    setOpenState(next);
    onOpenChange?.(next);
  };

  const commit = (m: Moment | null) => {
    if (valueProp === undefined) setInner(m);
    onChange?.(m, m ? m.format(format) : '');
  };

  const pick = (m: Moment) => {
    if (showTime) {
      const time = draft || (typeof showTime === 'object' && showTime.defaultValue) || moment().startOf('day');
      setDraft(m.clone().hour(time.hour()).minute(time.minute()).second(time.second()));
      return;
    }
    commit(periodStart(m, picker));
    setOpenState(false);
    onOpenChange?.(false);
  };

  const parseTyped = () => {
    if (text === null) return;
    const m = text.trim() === '' ? null : moment(text, format, true);
    if (m === null) commit(null);
    else if (m.isValid() && !disabledDate?.(m)) commit(periodStart(m, picker));
    setText(null);
  };

  const shown = open && showTime ? draft : value;
  const field = (
    <PickerField
      open={open}
      onOpen={() => setOpen(true)}
      disabled={disabled}
      size={size}
      status={status}
      icon={<Calendar className="size-4" />}
      clearable={allowClear && !!value}
      onClear={() => commit(null)}
      className={className}
      style={style}
    >
      <input
        value={text ?? (shown ? shown.format(format) : '')}
        placeholder={placeholder ?? (picker === 'date' ? (showTime ? 'Select date and time' : 'Select date') : `Select ${picker}`)}
        disabled={disabled}
        readOnly={inputReadOnly || picker === 'week' || picker === 'quarter'}
        onChange={(e) => setText(e.target.value)}
        onBlur={parseTyped}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            parseTyped();
            setOpen(false);
          }
          if (e.key === 'Escape') setOpen(false);
        }}
        className={inputClass}
      />
    </PickerField>
  );

  return (
    <DropdownPanel open={open} onOpenChange={setOpen} anchor={field} keepFocus anchorClassName={cn(!style?.width && 'max-w-full')}>
      <div className="flex">
        <CalendarPanel
          picker={picker}
          viewDate={viewDate}
          onViewDateChange={setViewDate}
          onSelect={pick}
          selected={showTime ? draft : value}
          disabledDate={disabledDate}
        />
        {showTime && (
          <div className="border-l border-slate-100">
            <div className="flex h-[52px] items-center justify-center border-b border-slate-100 text-sm font-semibold text-slate-800 tabular-nums">
              {draft ? draft.format(timeFormat) : '--:--:--'}
            </div>
            <TimeColumns value={draft} format={timeFormat} onChange={(m) => setDraft(m)} />
          </div>
        )}
      </div>
      {(showTime || (showToday && picker === 'date')) && (
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
          <Button
            variant="link"
            size="sm"
            disabled={!!disabledDate?.(moment())}
            onClick={() => {
              if (showTime) setDraft(moment());
              else pick(moment().startOf('day'));
            }}
          >
            {showTime && showNow !== false ? 'Now' : 'Today'}
          </Button>
          {showTime && (
            <Button
              variant="primary" size="sm" disabled={!draft} onClick={() => {
                commit(draft);
                setOpenState(false);
                onOpenChange?.(false);
              }}
            >
              OK
            </Button>
          )}
        </div>
      )}
    </DropdownPanel>
  );
}

/* ------------------------------- RangePicker ------------------------------ */

type RangeValue = [Moment | null, Moment | null] | null;

export interface RangePickerProps extends Omit<DatePickerProps, 'value' | 'defaultValue' | 'onChange' | 'placeholder'> {
  value?: [any, any] | null;
  defaultValue?: [Moment, Moment] | null;
  onChange?: (value: [Moment, Moment] | null, dateStrings: [string, string]) => void;
  placeholder?: [string, string];
  separator?: React.ReactNode;
}

function RangePicker({
  value: valueProp, defaultValue, onChange, picker = 'date', showTime, format: formatProp, disabledDate, allowClear = true, placeholder,
  disabled: disabledProp, size, status, separator, onOpenChange, className, style,
}: RangePickerProps) {
  const disabled = useDisabled(disabledProp);
  const normalize = (v: any): RangeValue => (Array.isArray(v) ? [toMoment(v[0]), toMoment(v[1])] : null);
  const [inner, setInner] = React.useState<RangeValue>(normalize(defaultValue));
  const value = valueProp !== undefined ? normalize(valueProp) : inner;
  const format = firstFormat(formatProp) || defaultFormat(picker, showTime);
  const [open, setOpenState] = React.useState(false);
  const [draft, setDraft] = React.useState<RangeValue>(value);
  const [hover, setHover] = React.useState<Moment | null>(null);
  const [viewDate, setViewDate] = React.useState<Moment>(value?.[0] || moment());
  const step: [number, moment.unitOfTime.DurationConstructor] = picker === 'year' ? [10, 'year'] : picker === 'month' || picker === 'quarter' ? [1, 'year'] : [1, 'month'];

  const commit = (next: RangeValue) => {
    const complete = next && next[0] && next[1] ? next as [Moment, Moment] : null;
    if (valueProp === undefined) setInner(complete);
    onChange?.(complete, complete ? [complete[0].format(format), complete[1].format(format)] : ['', '']);
  };

  const setOpen = (next: boolean) => {
    if (next) {
      setDraft(value);
      setViewDate(value?.[0] || moment());
    } else if (showTime && draft?.[0] && draft?.[1]) {
      commit(draft);
    }
    setHover(null);
    setOpenState(next);
    onOpenChange?.(next);
  };

  const close = () => {
    setOpenState(false);
    onOpenChange?.(false);
  };

  const pick = (m: Moment) => {
    const start = draft?.[0];
    const picked = periodStart(m, picker);
    if (start && !draft?.[1]) {
      let [a, b] = picked.isBefore(start) ? [picked, start] : [start, picked];
      if (!showTime) {
        // Whole days: from the start of the first to the end of the last.
        a = a.clone().startOf(periodUnit[picker]);
        b = b.clone().endOf(periodUnit[picker]);
        commit([a, b]);
        return close();
      }
      setDraft([a, b.clone().hour(23).minute(59).second(59)]);
    } else {
      setDraft([picked, null]);
    }
  };

  const setTime = (index: 0 | 1, hhmmss: string) => {
    if (!draft?.[index]) return;
    const [h, mi, s] = hhmmss.split(':').map(Number);
    const next = [...draft] as [Moment | null, Moment | null];
    next[index] = draft[index]!.clone().hour(h || 0).minute(mi || 0).second(s || 0);
    setDraft(next);
  };

  const shown = open ? draft : value;
  const rangeEnd = shown?.[1] || (shown?.[0] && hover) || null;
  const panelProps = { picker, onSelect: pick, rangeStart: shown?.[0], rangeEnd, onHover: setHover, disabledDate };
  const [ph0, ph1] = placeholder || ['Start date', 'End date'];

  const field = (
    <PickerField
      open={open}
      onOpen={() => setOpen(true)}
      disabled={disabled}
      size={size}
      status={status}
      icon={<Calendar className="size-4" />}
      clearable={allowClear && !!value}
      onClear={() => commit(null)}
      className={className}
      style={style}
    >
      <input readOnly value={shown?.[0] ? shown[0].format(format) : ''} placeholder={ph0} disabled={disabled} className={cn(inputClass, 'text-center')} />
      <span className="shrink-0 text-slate-400">{separator ?? '→'}</span>
      <input readOnly value={shown?.[1] ? shown[1].format(format) : ''} placeholder={ph1} disabled={disabled} className={cn(inputClass, 'text-center')} />
    </PickerField>
  );

  return (
    <DropdownPanel open={open} onOpenChange={setOpen} anchor={field}>
      <div className="flex divide-x divide-slate-100">
        <CalendarPanel {...panelProps} viewDate={viewDate} onViewDateChange={setViewDate} hideNext />
        <CalendarPanel {...panelProps} viewDate={viewDate.clone().add(step[0], step[1])} onViewDateChange={(m) => setViewDate(m.clone().subtract(step[0], step[1]))} hidePrev />
      </div>
      {showTime && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-2">
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <Clock className="size-3.5" />
            {([0, 1] as const).map((i) => (
              <input
                key={i}
                type="time"
                step={1}
                aria-label={i === 0 ? 'Start time' : 'End time'}
                disabled={!draft?.[i]}
                value={draft?.[i] ? draft[i]!.format('HH:mm:ss') : ''}
                onChange={(e) => setTime(i, e.target.value)}
                className="h-7 rounded-md border border-slate-200 px-1.5 tabular-nums outline-none focus:border-indigo-500 disabled:bg-slate-50"
              />
            ))}
          </div>
          <Button
            variant="primary" size="sm" disabled={!draft?.[0] || !draft?.[1]} onClick={() => {
              commit(draft);
              close();
            }}
          >
            OK
          </Button>
        </div>
      )}
    </DropdownPanel>
  );
}

type DatePickerComponent = typeof DatePickerBase & { RangePicker: typeof RangePicker };
export const DatePicker = DatePickerBase as DatePickerComponent;
DatePicker.RangePicker = RangePicker;
export { RangePicker };

/* ------------------------------- TimePicker ------------------------------- */

export interface TimePickerProps {
  value?: Moment | string | null;
  defaultValue?: Moment | null;
  onChange?: (value: Moment | null, timeString: string) => void;
  format?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  allowClear?: boolean;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large' | 'default';
  status?: 'error' | 'warning' | '';
  showNow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export function TimePicker({
  value: valueProp, defaultValue, onChange, format = 'HH:mm:ss', hourStep, minuteStep, secondStep, allowClear = true, placeholder = 'Select time',
  disabled: disabledProp, size, status, showNow = true, className, style,
}: TimePickerProps) {
  const disabled = useDisabled(disabledProp);
  const [inner, setInner] = React.useState<Moment | null>(toMoment(defaultValue));
  // Plain time strings (`'09:30'`) are parsed with the display format.
  const parse = (v: any) => (typeof v === 'string' && v && !moment.isMoment(v) ? (moment(v, format).isValid() ? moment(v, format) : toMoment(v)) : toMoment(v));
  const value = valueProp !== undefined ? parse(valueProp) : inner;
  const [open, setOpenState] = React.useState(false);
  const [draft, setDraft] = React.useState<Moment | null>(value);

  const commit = (m: Moment | null) => {
    if (valueProp === undefined) setInner(m);
    onChange?.(m, m ? m.format(format) : '');
  };
  const setOpen = (next: boolean) => {
    if (next) setDraft(value);
    else if (draft && !(value && draft.isSame(value))) commit(draft);
    setOpenState(next);
  };

  const field = (
    <PickerField
      open={open}
      onOpen={() => setOpen(true)}
      disabled={disabled}
      size={size}
      status={status}
      icon={<Clock className="size-4" />}
      clearable={allowClear && !!value}
      onClear={() => commit(null)}
      className={className}
      style={style}
    >
      <input readOnly value={(open ? draft : value)?.format(format) ?? ''} placeholder={placeholder} disabled={disabled} className={inputClass} />
    </PickerField>
  );

  return (
    <DropdownPanel open={open} onOpenChange={setOpen} anchor={field}>
      <TimeColumns value={draft} format={format} hourStep={hourStep} minuteStep={minuteStep} secondStep={secondStep} onChange={setDraft} className="p-1" />
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
        {showNow ? <Button variant="link" size="sm" onClick={() => setDraft(moment())}>Now</Button> : <span />}
        <Button
          variant="primary" size="sm" disabled={!draft} onClick={() => {
            commit(draft);
            setOpenState(false);
          }}
        >
          OK
        </Button>
      </div>
    </DropdownPanel>
  );
}
