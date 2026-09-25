import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from './cn';
import { controlHeight, normalizeSize, useDisabled } from './context';
import { ClearButton, fieldShellClass } from './input';
import { DropdownPanel } from './popover';
import { Spinner } from './spinner';

export interface CascaderOption {
  value?: any;
  label?: React.ReactNode;
  children?: CascaderOption[];
  isLeaf?: boolean;
  disabled?: boolean;
  loading?: boolean;
  [key: string]: any;
}

export interface CascaderProps {
  options?: CascaderOption[];
  value?: any[];
  defaultValue?: any[];
  onChange?: (value: any[] | undefined, selectedOptions?: CascaderOption[]) => void;
  /**
   * Load an option's children on demand. It receives the selected
   * path, fills `targetOption.children` and re-renders by updating `options`.
   */
  loadData?: (selectedOptions: CascaderOption[]) => void | Promise<void>;
  /** Commit on every level, not only leaves. */
  changeOnSelect?: boolean;
  expandTrigger?: 'click' | 'hover';
  fieldNames?: { label?: string; value?: string; children?: string };
  displayRender?: (labels: React.ReactNode[], selectedOptions?: CascaderOption[]) => React.ReactNode;
  placeholder?: React.ReactNode;
  allowClear?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large' | 'default';
  status?: 'error' | 'warning' | '';
  notFoundContent?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/** Hierarchical select, one column per level. */
export function Cascader({
  options = [], value: valueProp, defaultValue, onChange, loadData, changeOnSelect, expandTrigger = 'click', fieldNames, displayRender,
  placeholder = 'Please select', allowClear = true, disabled: disabledProp, size, status, notFoundContent, suffixIcon, className, style,
}: CascaderProps) {
  const disabled = useDisabled(disabledProp);
  const keys = { label: fieldNames?.label || 'label', value: fieldNames?.value || 'value', children: fieldNames?.children || 'children' };
  const [inner, setInner] = React.useState<any[] | undefined>(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<any[]>(value || []);
  const [pending, setPending] = React.useState<any>(null);

  React.useEffect(() => {
    if (open) setActive(value || []);
  }, [open]);

  const childrenOf = (o: CascaderOption): CascaderOption[] | undefined => o[keys.children];
  /** Options along a value path (stops at the first unknown value). */
  const pathOptions = (path: any[] = []) => {
    const out: CascaderOption[] = [];
    let level: CascaderOption[] | undefined = options;
    for (const v of path) {
      const found: CascaderOption | undefined = level?.find((o) => o[keys.value] === v);
      if (!found) break;
      out.push(found);
      level = childrenOf(found);
    }
    return out;
  };

  const selected = pathOptions(value);
  const labels = selected.map((o) => o[keys.label]);
  const hasValue = !!value && value.length > 0;

  const commit = (path: any[] | undefined, opts?: CascaderOption[]) => {
    if (valueProp === undefined) setInner(path);
    onChange?.(path, opts);
  };

  const expandable = (o: CascaderOption) => {
    const children = childrenOf(o);
    return (children && children.length > 0) || (!!loadData && !o.isLeaf);
  };

  const activate = async(o: CascaderOption, level: number, fromHover = false) => {
    if (o.disabled) return;
    const path = [...active.slice(0, level), o[keys.value]];
    setActive(path);
    const opts = pathOptions(path);
    if (loadData && !o.isLeaf && !(childrenOf(o)?.length)) {
      setPending(o[keys.value]);
      try {
        await loadData(opts);
      } finally {
        setPending(null);
      }
    }
    if (fromHover) return;
    if (!expandable(o)) {
      commit(path, opts);
      setOpen(false);
    } else if (changeOnSelect) {
      commit(path, opts);
    }
  };

  const columns: CascaderOption[][] = [options];
  pathOptions(active).forEach((o) => {
    const children = childrenOf(o);
    if (children && children.length) columns.push(children);
  });

  const field = (
    <div
      role="combobox"
      aria-expanded={open}
      aria-disabled={disabled || undefined}
      aria-invalid={status === 'error' || undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && setOpen(!open)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === 'ArrowDown') && !disabled) setOpen(true);
        if (e.key === 'Escape') setOpen(false);
      }}
      className={cn('group relative', fieldShellClass, controlHeight[normalizeSize(size)], 'cursor-pointer pr-8 pl-3', open && 'border-indigo-500 ring-3 ring-indigo-500/15', className)}
      style={style}
    >
      <span className={cn('min-w-0 flex-1 truncate', !hasValue && 'text-slate-400')}>
        {hasValue ? (displayRender ? displayRender(labels, selected) : labels.length ? labels.map((l, i) => <React.Fragment key={i}>{i > 0 && ' / '}{l}</React.Fragment>) : value!.join(' / ')) : placeholder}
      </span>
      <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-400">
        {allowClear && hasValue && !disabled ? (
          <>
            <ClearButton
              onClick={(e) => {
                e.stopPropagation();
                commit(undefined, undefined);
              }} className="hidden group-hover:flex"
            />
            <span className="group-hover:hidden">{suffixIcon ?? <ChevronDown className="size-4" />}</span>
          </>
        ) : suffixIcon ?? <ChevronDown className="size-4" />}
      </span>
    </div>
  );

  return (
    <DropdownPanel open={open} onOpenChange={setOpen} anchor={field} className="min-w-0">
      {options.length === 0 ? (
        <div className="min-w-40 px-3 py-6 text-center text-[13px] text-slate-400">{notFoundContent ?? 'No options'}</div>
      ) : (
        <div className="flex divide-x divide-slate-100">
          {columns.map((list, level) => (
            <ul key={level} role="listbox" className="m-0 max-h-64 min-w-36 list-none overflow-y-auto p-1">
              {list.map((o) => {
                const isActive = active[level] === o[keys.value];
                return (
                  <li
                    key={String(o[keys.value])}
                    role="option"
                    aria-selected={isActive}
                    aria-disabled={o.disabled || undefined}
                    onClick={() => activate(o, level)}
                    onMouseEnter={expandTrigger === 'hover' && expandable(o) ? () => activate(o, level, true) : undefined}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-100',
                      isActive && 'bg-indigo-50 font-medium text-indigo-700 hover:bg-indigo-50',
                      o.disabled && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{o[keys.label]}</span>
                    {pending === o[keys.value] || o.loading ? <Spinner className="size-3.5 text-slate-400" /> : expandable(o) && <ChevronRight className="size-3.5 text-slate-400" />}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      )}
    </DropdownPanel>
  );
}
