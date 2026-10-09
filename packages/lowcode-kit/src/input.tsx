import React from 'react';
import { Eye, EyeOff, Search as SearchIcon } from 'lucide-react';
import { cn } from './cn';
import { controlHeight, normalizeSize, useDisabled } from './context';
import { Spinner } from './spinner';
import { useFormItemStatus } from './form';

export const fieldClass = cn(
  'w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-xs outline-none transition',
  'placeholder:text-slate-400 hover:border-indigo-300',
  'focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15',
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
  'aria-invalid:border-red-400 aria-invalid:focus:ring-red-500/15',
);

/** A field-looking box that wraps other elements (focus ring follows focus inside). */
export const fieldShellClass = cn(
  'flex w-full items-center rounded-lg border border-slate-200 bg-white text-sm text-slate-800 shadow-xs transition',
  'hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-3 focus-within:ring-indigo-500/15',
  'aria-disabled:cursor-not-allowed aria-disabled:bg-slate-50 aria-disabled:text-slate-400 aria-disabled:hover:border-slate-200',
  'aria-invalid:border-red-400',
);

const addonClass = 'flex shrink-0 items-center self-stretch border border-slate-200 bg-slate-50 px-3 text-sm whitespace-nowrap text-slate-500';

function ClearIcon() {
  return <svg viewBox="0 0 16 16" className="size-3" fill="currentColor" aria-hidden="true"><path d="M4.3 3.3 8 7l3.7-3.7 1 1L9 8l3.7 3.7-1 1L8 9l-3.7 3.7-1-1L7 8 3.3 4.3z" /></svg>;
}

export function ClearButton({ onClick, className }: { onClick: (e: React.MouseEvent) => void; className?: string }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label="Clear"
      className={cn('flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600', className)}
    >
      <ClearIcon />
    </button>
  );
}

/** Set a native input's value so React fires a real change event. */
function setNativeValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Show a clear button while there is a value. */
  allowClear?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Joined box before / after the field (units, protocols, buttons). */
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  size?: 'small' | 'middle' | 'large' | 'default';
  /** Show `length / maxLength` inside the field. */
  showCount?: boolean;
  status?: 'error' | 'warning' | '';
  /** Accepted and ignored; the input is always bordered. */
  bordered?: boolean;
}

/**
 * Text input. `onChange` receives the native event, so it binds to the kit
 * `Form` (and any handler reading `e.target.value`) unchanged.
 */
const InputBase = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, style, allowClear, prefix, suffix, addonBefore, addonAfter, size, showCount, status: statusProp, bordered: _bordered, value, onChange, disabled: disabledProp, ...rest },
  ref,
) {
  const innerRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
  const disabled = useDisabled(disabledProp);
  const status = statusProp || useFormItemStatus();
  const text = value === undefined || value === null ? '' : String(value);
  const height = controlHeight[normalizeSize(size)];
  const invalid = status === 'error' || rest['aria-invalid'] === true || rest['aria-invalid'] === 'true';
  const clearable = allowClear && text !== '' && !disabled && !rest.readOnly;
  const count = showCount ? (
    <span className="text-xs text-slate-400 tabular-nums">{rest.maxLength ? `${text.length} / ${rest.maxLength}` : text.length}</span>
  ) : null;
  const trailing = clearable || suffix || count;

  const clear = () => {
    if (!innerRef.current) return;
    setNativeValue(innerRef.current, '');
    innerRef.current.focus();
  };

  const simple = !prefix && !trailing && !allowClear && !addonBefore && !addonAfter;
  const input = (
    <input
      ref={innerRef}
      value={text}
      onChange={onChange}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={simple ?
        cn(fieldClass, height, className) :
        'h-full min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed'}
      style={simple ? style : undefined}
      {...rest}
    />
  );
  if (simple) return input;

  const shell = (
    <span
      aria-disabled={disabled || undefined}
      aria-invalid={invalid || undefined}
      className={cn(
        fieldShellClass, height,
        // Beside an addon the field takes the remaining width.
        (addonBefore || addonAfter) && 'w-auto min-w-0 flex-1',
        addonBefore && 'rounded-l-none',
        addonAfter && 'rounded-r-none',
        !addonBefore && !addonAfter && className,
      )}
      style={!addonBefore && !addonAfter ? style : undefined}
    >
      {prefix && <span className="flex shrink-0 pl-3 text-slate-400">{prefix}</span>}
      {React.cloneElement(input, { className: cn('h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 disabled:cursor-not-allowed', prefix ? 'pl-2' : 'pl-3', trailing ? 'pr-1' : 'pr-3') })}
      {(trailing || allowClear) && (
        <span className="flex shrink-0 items-center gap-1.5 pr-2.5 text-slate-400">
          {clearable && <ClearButton onClick={clear} />}
          {count}
          {suffix}
        </span>
      )}
    </span>
  );
  if (!addonBefore && !addonAfter) return shell;

  return (
    <span className={cn('flex w-full items-stretch', height, className)} style={style}>
      {addonBefore && <span className={cn(addonClass, 'rounded-l-lg border-r-0')}>{addonBefore}</span>}
      {shell}
      {addonAfter && <span className={cn(addonClass, 'rounded-r-lg border-l-0')}>{addonAfter}</span>}
    </span>
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCount?: boolean;
  /** Grow with the content; `{ minRows, maxRows }` bounds the height. */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  allowClear?: boolean;
  status?: 'error' | 'warning' | '';
  size?: string;
  bordered?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, style, value, showCount, autoSize, allowClear, status: statusProp, size: _size, bordered: _bordered, disabled: disabledProp, rows, ...rest },
  ref,
) {
  const innerRef = React.useRef<HTMLTextAreaElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);
  const disabled = useDisabled(disabledProp);
  const status = statusProp || useFormItemStatus();
  const text = value === undefined || value === null ? '' : String(value);

  React.useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el || !autoSize) return;
    const { minRows = 2, maxRows = 12 } = typeof autoSize === 'object' ? autoSize : {};
    const line = parseFloat(getComputedStyle(el).lineHeight) || 20;
    el.style.height = 'auto';
    const padding = el.offsetHeight - el.clientHeight + 16;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minRows * line + padding), maxRows * line + padding)}px`;
  }, [text, autoSize]);

  const area = (
    <textarea
      ref={innerRef}
      value={text}
      rows={rows ?? (autoSize ? 2 : undefined)}
      disabled={disabled}
      aria-invalid={status === 'error' || undefined}
      className={cn(fieldClass, 'block py-2 leading-relaxed', !rows && !autoSize && 'min-h-20', autoSize && 'resize-none', (showCount || allowClear) ? 'pb-6' : '', className)}
      style={style}
      {...rest}
    />
  );
  if (!showCount && !allowClear) return area;
  return (
    <span className="relative block w-full">
      {area}
      <span className="absolute right-2.5 bottom-1.5 flex items-center gap-1.5 text-xs text-slate-400 tabular-nums">
        {allowClear && text !== '' && !disabled && (
          <ClearButton onClick={() => innerRef.current && setNativeValue(innerRef.current, '')} />
        )}
        {showCount && (rest.maxLength ? `${text.length} / ${rest.maxLength}` : text.length)}
      </span>
    </span>
  );
});

export interface SearchProps extends InputProps {
  onSearch?: (value: string, event?: React.SyntheticEvent) => void;
  /** Show a search button (`true`) or a button with this content. */
  enterButton?: boolean | React.ReactNode;
  loading?: boolean;
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(function Search({ onSearch, enterButton, loading, onKeyDown, ...rest }, ref) {
  const innerRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
  const disabled = useDisabled(rest.disabled);
  const run = (e?: React.SyntheticEvent) => onSearch?.(innerRef.current?.value ?? '', e);
  const icon = loading ? <Spinner className="size-4" /> : <SearchIcon className="size-4" />;
  const button = enterButton ? (
    <button
      type="button"
      onClick={run}
      disabled={disabled}
      className="-mx-3 flex h-full cursor-pointer items-center gap-1.5 rounded-r-[7px] bg-indigo-600 px-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      {enterButton === true ? icon : enterButton}
    </button>
  ) : undefined;
  return (
    <InputBase
      ref={innerRef}
      suffix={enterButton ? undefined : <button type="button" tabIndex={-1} onClick={run} className="flex cursor-pointer text-slate-400 hover:text-slate-600">{icon}</button>}
      addonAfter={button}
      onKeyDown={(e) => {
        if (e.key === 'Enter') run(e);
        onKeyDown?.(e);
      }}
      {...rest}
    />
  );
});

const Password = React.forwardRef<HTMLInputElement, InputProps & { visibilityToggle?: boolean }>(function Password({ visibilityToggle = true, ...rest }, ref) {
  const [visible, setVisible] = React.useState(false);
  const toggle = visibilityToggle ? (
    <button type="button" tabIndex={-1} onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'} className="flex cursor-pointer text-slate-400 hover:text-slate-600">
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  ) : undefined;
  return <InputBase ref={ref} type={visible ? 'text' : 'password'} suffix={toggle} {...rest} />;
});

type InputComponent = typeof InputBase & {
  TextArea: typeof Textarea;
  Search: typeof Search;
  Password: typeof Password;
};

export const Input = InputBase as InputComponent;
Input.TextArea = Textarea;
Input.Search = Search;
Input.Password = Password;
