import React from 'react';
import { cn } from './cn';
import { Input } from './input';
import { DropdownPanel } from './popover';
import type { SelectOption } from './select';

export interface AutoCompleteProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: any, option: SelectOption) => void;
  onSearch?: (text: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  size?: 'small' | 'middle' | 'large' | 'default';
  /** Filter options by the typed text (default: no local filtering). */
  filterOption?: boolean | ((input: string, option: SelectOption) => boolean);
  notFoundContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Custom input element (e.g. `Input.Search`); receives value/onChange. */
  children?: React.ReactElement;
  [key: string]: any;
}

/** Free-text input with suggestions. */
export function AutoComplete({
  value: valueProp, defaultValue, onChange, onSelect, onSearch, options = [], placeholder, disabled, allowClear, size,
  filterOption = false, notFoundContent, className, style, children,
}: AutoCompleteProps) {
  const [inner, setInner] = React.useState(defaultValue ?? '');
  const value = valueProp ?? inner;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);

  const shown = React.useMemo(() => {
    if (!filterOption || !value) return options;
    return options.filter((o) => (typeof filterOption === 'function' ?
      filterOption(value, o) :
      String(o.value).toLowerCase().includes(value.toLowerCase())));
  }, [options, value, filterOption]);

  React.useEffect(() => setActive(-1), [shown]);

  const setText = (text: string) => {
    if (valueProp === undefined) setInner(text);
    onChange?.(text);
  };

  const choose = (o: SelectOption) => {
    setText(String(o.value));
    onSelect?.(o.value, o);
    setOpen(false);
  };

  const bind = {
    value,
    placeholder,
    disabled,
    allowClear,
    size,
    autoComplete: 'off',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
      onSearch?.(e.target.value);
      setOpen(true);
    },
    onFocus: () => setOpen(true),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        setActive((i) => (shown.length ? (i + dir + shown.length) % shown.length : -1));
      } else if (e.key === 'Enter' && open && shown[active]) {
        e.preventDefault();
        choose(shown[active]);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
  };

  const field = children ? React.cloneElement(children, bind as any) : <Input {...bind} />;
  const showPanel = open && (shown.length > 0 || notFoundContent !== undefined);

  return (
    <div className={cn('w-full', className)} style={style}>
      <DropdownPanel open={showPanel} onOpenChange={setOpen} anchor={field} keepFocus className="p-1">
        <div role="listbox" className="max-h-64 overflow-y-auto">
          {shown.length === 0 && <div className="px-3 py-4 text-center text-[13px] text-slate-400">{notFoundContent}</div>}
          {shown.map((o, i) => (
            <div
              key={`${String(o.value)}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
              className={cn('cursor-pointer truncate rounded-lg px-2.5 py-1.5 text-slate-700', i === active && 'bg-slate-100')}
            >
              {o.label ?? String(o.value)}
            </div>
          ))}
        </div>
      </DropdownPanel>
    </div>
  );
}
