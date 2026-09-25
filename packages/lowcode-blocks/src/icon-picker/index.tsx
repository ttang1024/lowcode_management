/* eslint-disable react/prop-types */ // props are typed via TS; the rule misreads the augmented component type.
/**
 * @module icon-picker
 * @description
 *   Pick an icon (lucide) from a searchable grid. The value is the icon name;
 *   legacy icon names already stored in configs still display (see
 *   `resolveIcon`).
 */
import React from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { ClearButton, DropdownPanel, Input, NamedIcon, cn, fieldShellClass, iconNames, useDisabled } from 'lowcode-kit';

export interface IconPickerProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  allowClear?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

type IconPickerComponent = React.FC<IconPickerProps> & {
  /** Plain text input variant (e.g. for an iconfont stylesheet URL). */
  Input: React.FC<{ value?: string; onChange?: (value: string) => void; [key: string]: any }>;
};

const PAGE = 240;

const IconPicker = (({ value, onChange, allowClear = true, disabled: disabledProp, placeholder = 'Select an icon', className, style }: IconPickerProps) => {
  const disabled = useDisabled(disabledProp);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [limit, setLimit] = React.useState(PAGE);

  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setLimit(PAGE);
    }
  }, [open]);

  const q = query.trim().toLowerCase().replace(/[-_ ]/g, '');
  const matches = React.useMemo(() => (q ? iconNames.filter((n) => n.toLowerCase().includes(q)) : iconNames), [q]);

  const field = (
    <div
      role="combobox"
      aria-expanded={open}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && setOpen(!open)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === 'ArrowDown') && !disabled && setOpen(true)}
      className={cn('group relative h-9 cursor-pointer gap-2 pr-8 pl-3', fieldShellClass, open && 'border-indigo-500 ring-3 ring-indigo-500/15', className)}
      style={style}
    >
      {value ? (
        <>
          <NamedIcon name={value} className="size-4 text-slate-700" />
          <span className="truncate">{value}</span>
        </>
      ) : <span className="text-slate-400">{placeholder}</span>}
      <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-400">
        {allowClear && value && !disabled ? (
          <>
            <ClearButton
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(undefined);
              }} className="hidden group-hover:flex"
            />
            <ChevronDown className="size-4 group-hover:hidden" />
          </>
        ) : <ChevronDown className="size-4" />}
      </span>
    </div>
  );

  return (
    <DropdownPanel open={open} onOpenChange={setOpen} anchor={field} className="w-[360px] p-2">
      <Input autoFocus allowClear value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search icons" prefix={<Search className="size-4" />} />
      <div
        className="mt-2 grid max-h-72 grid-cols-8 gap-1 overflow-y-auto overscroll-contain"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight > el.scrollHeight - 80) setLimit((l) => l + PAGE);
        }}
      >
        {matches.slice(0, limit).map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={name}
            onClick={() => {
              onChange?.(name);
              setOpen(false);
            }}
            className={cn('flex aspect-square cursor-pointer items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900', name === value && 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200')}
          >
            <NamedIcon name={name} className="size-[18px]" />
          </button>
        ))}
      </div>
      {matches.length === 0 && <div className="py-6 text-center text-[13px] text-slate-400">No icons match “{query}”</div>}
      <div className="mt-1.5 px-1 text-xs text-slate-400 tabular-nums">{matches.length} icons</div>
    </DropdownPanel>
  );
}) as IconPickerComponent;

IconPicker.Input = function IconInput({ value, onChange, ...rest }) {
  return <Input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder="Icon URL" {...rest} />;
};

export default IconPicker;
