import React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from './cn';
import { controlHeight, normalizeSize, useDisabled } from './context';
import { ClearButton, fieldShellClass } from './input';
import { DropdownPanel } from './popover';
import { Spinner } from './spinner';
import { useFormItemStatus } from './form';

export interface SelectOption {
  label?: React.ReactNode;
  value: any;
  disabled?: boolean;
  title?: string;
  [key: string]: any;
}

export interface SelectProps {
  value?: any;
  defaultValue?: any;
  onChange?: (value: any, option?: any) => void;
  options?: SelectOption[];
  /** `multiple` picks several options; `tags` also accepts typed values. */
  mode?: 'multiple' | 'tags';
  allowClear?: boolean;
  showSearch?: boolean;
  placeholder?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'middle' | 'large' | 'default';
  status?: 'error' | 'warning' | '';
  /** `false` turns off local filtering (e.g. results come from `onSearch`). */
  filterOption?: boolean | ((input: string, option: SelectOption) => boolean);
  /** Option field searched when filtering (default: label and value). */
  optionFilterProp?: string;
  /** Option field shown in the closed field (default `label`). */
  optionLabelProp?: string;
  onSearch?: (text: string) => void;
  onSelect?: (value: any, option: SelectOption) => void;
  onDeselect?: (value: any, option: SelectOption) => void;
  onClear?: () => void;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
  onDropdownVisibleChange?: (open: boolean) => void;
  notFoundContent?: React.ReactNode;
  /** Custom row content in the list. */
  optionRender?: (option: SelectOption) => React.ReactNode;
  maxTagCount?: number;
  className?: string;
  style?: React.CSSProperties;
  popupClassName?: string;
  dropdownClassName?: string;
  id?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const RENDER_LIMIT = 500;

/** Plain text of a React node, for filtering and titles. */
export function nodeText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (React.isValidElement(node)) return nodeText((node.props as { children?: React.ReactNode }).children);
  return '';
}

/** `<Select.Option value>label</Select.Option>` children → options. */
function optionsFromChildren(children: React.ReactNode): SelectOption[] {
  const out: SelectOption[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as any;
    out.push({ ...props, label: props.label ?? props.children, value: props.value ?? child.key });
  });
  return out;
}

const same = (a: any, b: any) => a === b || (a !== null && b !== null && a !== undefined && b !== undefined && String(a) === String(b) && typeof a !== 'object');

function SelectBase(props: SelectProps) {
  const {
    value: valueProp, defaultValue, onChange, options: optionsProp, mode, allowClear, showSearch, placeholder, disabled: disabledProp,
    loading, size, status: statusProp, filterOption = true, optionFilterProp, optionLabelProp = 'label', onSearch, onSelect, onDeselect, onClear,
    onFocus, onBlur, onDropdownVisibleChange, notFoundContent, optionRender, maxTagCount, className, style, popupClassName, dropdownClassName, id, children,
  } = props;
  const disabled = useDisabled(disabledProp);
  const status = statusProp || useFormItemStatus();
  const multiple = mode === 'multiple' || mode === 'tags';
  const searchable = !!showSearch || multiple;
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const values: any[] = multiple ? (Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value]) : [];
  const [open, setOpenState] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();

  const options = React.useMemo(() => optionsProp ?? optionsFromChildren(children), [optionsProp, children]);
  const find = (v: any) => options.find((o) => same(o.value, v));

  const setOpen = (next: boolean) => {
    if (next && disabled) return;
    setOpenState(next);
    onDropdownVisibleChange?.(next);
    if (!next) setSearch('');
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = options;
    if (q && filterOption !== false) {
      list = options.filter((o) => {
        if (typeof filterOption === 'function') return filterOption(search, o);
        const hay = optionFilterProp ? nodeText(o[optionFilterProp]) : `${nodeText(o.label)} ${o.value ?? ''}`;
        return hay.toLowerCase().includes(q);
      });
    }
    if (mode === 'tags' && q && !options.some((o) => String(o.value).toLowerCase() === q)) {
      list = [{ value: search.trim(), label: search.trim(), __created: true }, ...list];
    }
    return list;
  }, [options, search, filterOption, optionFilterProp, mode]);

  React.useEffect(() => setActive(0), [search, open]);
  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const emit = (next: any, option?: any) => {
    if (valueProp === undefined) setInner(next);
    onChange?.(next, option);
  };

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    if (multiple) {
      const has = values.some((v) => same(v, option.value));
      const next = has ? values.filter((v) => !same(v, option.value)) : [...values, option.value];
      emit(next, next.map((v) => find(v) ?? { value: v, label: v }));
      (has ? onDeselect : onSelect)?.(option.value, option);
      setSearch('');
      inputRef.current?.focus();
    } else {
      emit(option.value, option);
      onSelect?.(option.value, option);
      setOpen(false);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    emit(multiple ? [] : undefined, multiple ? [] : undefined);
    onClear?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const shown = filtered.slice(0, RENDER_LIMIT);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      let i = active;
      for (let n = 0; n < shown.length; n++) {
        i = (i + dir + shown.length) % shown.length;
        if (!shown[i].disabled) break;
      }
      setActive(i);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!open) return setOpen(true);
      if (shown[active]) choose(shown[active]);
    } else if (e.key === 'Escape') {
      if (open) {
        e.stopPropagation();
        setOpen(false);
      }
    } else if (e.key === 'Backspace' && multiple && !search && values.length) {
      const next = values.slice(0, -1);
      emit(next, next.map((v) => find(v)));
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const labelOf = (v: any) => {
    const o = find(v);
    if (!o) return v;
    return o[optionLabelProp] ?? o.label ?? o.value;
  };

  const hasValue = multiple ? values.length > 0 : value !== undefined && value !== null && value !== '';
  const height = controlHeight[normalizeSize(size)];
  const shownTags = maxTagCount !== undefined ? values.slice(0, maxTagCount) : values;

  const field = (
    <div
      id={id}
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-disabled={disabled || undefined}
      aria-invalid={status === 'error' || undefined}
      tabIndex={searchable || disabled ? -1 : 0}
      onClick={() => {
        if (disabled) return;
        if (searchable) inputRef.current?.focus();
        setOpen(multiple ? true : !open);
      }}
      onKeyDown={searchable ? undefined : onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        'group relative', fieldShellClass, multiple ? 'min-h-9 py-1' : height, 'cursor-pointer pr-8 pl-3',
        open && 'border-indigo-500 ring-3 ring-indigo-500/15', disabled && 'cursor-not-allowed', className,
      )}
      style={style}
    >
      <div className={cn('flex min-w-0 flex-1 items-center', multiple && 'flex-wrap gap-1')}>
        {multiple && shownTags.map((v) => (
          <span key={String(v)} className="inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-slate-100 pr-1 pl-2 text-[13px] text-slate-700">
            <span className="truncate">{labelOf(v)}</span>
            {!disabled && (
              <button
                type="button"
                tabIndex={-1}
                aria-label="Remove"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = values.filter((x) => !same(x, v));
                  emit(next, next.map((x) => find(x)));
                  const o = find(v);
                  if (o) onDeselect?.(v, o);
                }}
                className="flex cursor-pointer rounded text-slate-400 hover:text-slate-700"
              >
                <X className="size-3" />
              </button>
            )}
          </span>
        ))}
        {multiple && maxTagCount !== undefined && values.length > maxTagCount && (
          <span className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-[13px] text-slate-500">+{values.length - maxTagCount}</span>
        )}
        {!multiple && !search && (
          <span className={cn('pointer-events-none absolute inset-y-0 right-8 left-3 flex items-center truncate', !hasValue && 'text-slate-400')}>
            <span className="truncate">{hasValue ? labelOf(value) : placeholder}</span>
          </span>
        )}
        {multiple && !hasValue && !search && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{placeholder}</span>
        )}
        {searchable && (
          <input
            ref={inputRef}
            value={search}
            disabled={disabled}
            aria-autocomplete="list"
            aria-controls={listId}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearch?.(e.target.value);
              if (!open) setOpen(true);
            }}
            onKeyDown={onKeyDown}
            className={cn('h-6 min-w-[2ch] flex-1 bg-transparent outline-none disabled:cursor-not-allowed', !multiple && 'relative z-[1]', multiple && !search && 'w-[2ch] flex-none')}
          />
        )}
      </div>
      <span className="absolute inset-y-0 right-2.5 flex items-center gap-1 text-slate-400">
        {loading ? <Spinner className="size-3.5" /> : allowClear && hasValue && !disabled ? (
          <>
            <ClearButton onClick={clear} className="hidden group-hover:flex" />
            <ChevronDown className="size-4 group-hover:hidden" />
          </>
        ) : <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />}
      </span>
    </div>
  );

  const shown = filtered.slice(0, RENDER_LIMIT);
  return (
    <DropdownPanel open={open} onOpenChange={setOpen} anchor={field} keepFocus={searchable} className={cn('p-1', popupClassName, dropdownClassName)}>
      <div ref={listRef} id={listId} role="listbox" aria-multiselectable={multiple || undefined} className="max-h-64 overflow-y-auto overscroll-contain">
        {shown.length === 0 && (
          <div className="px-3 py-6 text-center text-[13px] text-slate-400">{loading ? 'Loading…' : notFoundContent ?? 'No options'}</div>
        )}
        {shown.map((o, i) => {
          const selected = multiple ? values.some((v) => same(v, o.value)) : same(value, o.value);
          return (
            <div
              key={`${String(o.value)}-${i}`}
              role="option"
              data-index={i}
              aria-selected={selected}
              aria-disabled={o.disabled || undefined}
              title={o.title ?? nodeText(o.label)}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700',
                i === active && 'bg-slate-100',
                selected && 'font-medium text-indigo-700',
                o.disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <span className="min-w-0 flex-1 truncate">{o.__created ? <>Create “{o.label}”</> : optionRender ? optionRender(o) : o.label ?? String(o.value)}</span>
              {selected && <Check className="size-4 shrink-0 text-indigo-600" />}
            </div>
          );
        })}
        {filtered.length > RENDER_LIMIT && (
          <div className="px-3 py-2 text-center text-xs text-slate-400">Showing {RENDER_LIMIT} of {filtered.length} — type to narrow down</div>
        )}
      </div>
    </DropdownPanel>
  );
}

function Option(_props: { value?: any; children?: React.ReactNode; disabled?: boolean; label?: React.ReactNode }) {
  return null;
}

type SelectComponent = typeof SelectBase & { Option: typeof Option };

/** Dropdown select. */
export const Select = SelectBase as SelectComponent;
Select.Option = Option;
