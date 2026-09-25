import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from './cn';
import { controlHeight, normalizeSize, useDisabled } from './context';
import { fieldShellClass } from './input';
import { useFormItemStatus } from './form';

type NumberValue = number | string | null;

export interface InputNumberProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'prefix' | 'min' | 'max' | 'step'> {
  value?: NumberValue;
  defaultValue?: NumberValue;
  /** `null` when cleared; a string in `stringMode` (keeps full precision). */
  onChange?: (value: any) => void;
  min?: number;
  max?: number;
  step?: number | string;
  precision?: number;
  /** Show the up/down stepper (default true). */
  controls?: boolean;
  stringMode?: boolean;
  prefix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  size?: 'small' | 'middle' | 'large' | 'default';
  status?: 'error' | 'warning' | '';
  formatter?: (value: string | undefined) => string;
  parser?: (display: string | undefined) => string;
  bordered?: boolean;
  keyboard?: boolean;
}

function decimals(n: number | string | undefined) {
  const s = String(n ?? '');
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

/** Numeric input with optional stepper; edits freely, commits a clamped number on blur/Enter. */
export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  {
    value, defaultValue, onChange, min, max, step = 1, precision, controls = true, stringMode, prefix, addonBefore, addonAfter,
    size, status: statusProp, formatter, parser, className, style, disabled: disabledProp, readOnly, onBlur, onKeyDown, bordered: _bordered, keyboard = true, ...rest
  },
  ref,
) {
  const disabled = useDisabled(disabledProp);
  const status = statusProp || useFormItemStatus();
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState<NumberValue>(defaultValue ?? null);
  const current = controlled ? value : inner;
  const toText = (v: NumberValue) => {
    if (v === null || v === undefined || v === '') return '';
    const s = precision !== undefined && !Number.isNaN(Number(v)) ? Number(v).toFixed(precision) : String(v);
    return formatter ? formatter(s) : s;
  };
  const [draft, setDraft] = React.useState<string | null>(null);
  const text = draft ?? toText(current);

  const emit = (next: NumberValue) => {
    if (!controlled) setInner(next);
    onChange?.(next);
  };

  const normalize = (n: number) => {
    let v = n;
    if (max !== undefined && v > max) v = max;
    if (min !== undefined && v < min) v = min;
    const places = precision ?? Math.max(decimals(step), decimals(v));
    return Number(v.toFixed(Math.min(places, 20)));
  };

  const commit = (raw: string) => {
    setDraft(null);
    const plain = (parser ? parser(raw) : raw).trim();
    if (plain === '') return emit(null);
    const n = Number(plain);
    if (Number.isNaN(n)) return; // revert to the last valid value
    const v = normalize(n);
    const next = stringMode ? String(v) : v;
    if (next !== current) emit(next);
  };

  const bump = (dir: 1 | -1) => {
    if (disabled || readOnly) return;
    const base = Number(draft ?? current ?? 0) || 0;
    const v = normalize(base + dir * Number(step));
    setDraft(null);
    emit(stringMode ? String(v) : v);
  };

  const n = Number(current);
  const atMax = max !== undefined && current !== null && current !== '' && n >= max;
  const atMin = min !== undefined && current !== null && current !== '' && n <= min;
  const height = controlHeight[normalizeSize(size)];

  const field = (
    <span
      aria-disabled={disabled || undefined}
      aria-invalid={status === 'error' || undefined}
      className={cn('group', fieldShellClass, height, 'overflow-hidden', (addonBefore || addonAfter) && 'w-auto min-w-0 flex-1', addonBefore && 'rounded-l-none', addonAfter && 'rounded-r-none', !addonBefore && !addonAfter && className)}
      style={!addonBefore && !addonAfter ? style : undefined}
    >
      {prefix && <span className="flex shrink-0 pl-3 text-slate-400">{prefix}</span>}
      <input
        ref={ref}
        inputMode="decimal"
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current === null || current === '' ? undefined : n}
        value={text}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => {
          if (draft !== null) commit(draft);
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && draft !== null) commit(draft);
          if (keyboard && e.key === 'ArrowUp') {
            e.preventDefault();
            bump(1);
          }
          if (keyboard && e.key === 'ArrowDown') {
            e.preventDefault();
            bump(-1);
          }
          onKeyDown?.(e);
        }}
        className={cn('h-full min-w-0 flex-1 bg-transparent tabular-nums outline-none placeholder:text-slate-400 disabled:cursor-not-allowed', prefix ? 'pl-2' : 'pl-3', 'pr-2')}
        {...rest}
      />
      {controls && !disabled && !readOnly && (
        <span className="flex h-full w-6 shrink-0 flex-col border-l border-slate-200 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button type="button" tabIndex={-1} aria-label="Increase" disabled={atMax} onMouseDown={(e) => e.preventDefault()} onClick={() => bump(1)} className="flex flex-1 cursor-pointer items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronUp className="size-3" />
          </button>
          <button type="button" tabIndex={-1} aria-label="Decrease" disabled={atMin} onMouseDown={(e) => e.preventDefault()} onClick={() => bump(-1)} className="flex flex-1 cursor-pointer items-center justify-center border-t border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronDown className="size-3" />
          </button>
        </span>
      )}
    </span>
  );
  if (!addonBefore && !addonAfter) return field;

  const addon = 'flex shrink-0 items-center border border-slate-200 bg-slate-50 px-3 text-sm whitespace-nowrap text-slate-500';
  return (
    <span className={cn('flex w-full items-stretch', height, className)} style={style}>
      {addonBefore && <span className={cn(addon, 'rounded-l-lg border-r-0')}>{addonBefore}</span>}
      {field}
      {addonAfter && <span className={cn(addon, 'rounded-r-lg border-l-0')}>{addonAfter}</span>}
    </span>
  );
});
