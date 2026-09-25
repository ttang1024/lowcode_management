import React from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from './cn';
import { useDisabled } from './context';
import { Button } from './button';
import { Checkbox } from './choice';
import { nodeText } from './select';

export interface TransferItem {
  key?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  [key: string]: any;
}

export interface TransferProps<T extends TransferItem = TransferItem> {
  dataSource?: T[];
  targetKeys?: string[];
  onChange?: (targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  render?: (item: T) => React.ReactNode;
  rowKey?: (item: T) => string;
  /** Headings of the source and target lists. */
  titles?: React.ReactNode[];
  /** Labels of the move-right and move-left buttons. */
  operations?: React.ReactNode[];
  listStyle?: React.CSSProperties;
  showSearch?: boolean;
  filterOption?: (input: string, item: T) => boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

interface ListProps<T extends TransferItem> {
  title?: React.ReactNode;
  items: T[];
  keyOf: (item: T) => string;
  render: (item: T) => React.ReactNode;
  checked: string[];
  onCheck: (keys: string[]) => void;
  showSearch?: boolean;
  filterOption?: (input: string, item: T) => boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

function TransferList<T extends TransferItem>({ title, items, keyOf, render, checked, onCheck, showSearch, filterOption, disabled, style }: ListProps<T>) {
  const [query, setQuery] = React.useState('');
  const q = query.trim().toLowerCase();
  const shown = q ? items.filter((it) => (filterOption ? filterOption(query, it) : nodeText(render(it)).toLowerCase().includes(q))) : items;
  const enabled = shown.filter((it) => !it.disabled).map(keyOf);
  const allChecked = enabled.length > 0 && enabled.every((k) => checked.includes(k));
  const someChecked = !allChecked && enabled.some((k) => checked.includes(k));

  return (
    <div className="flex h-64 w-56 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white" style={style}>
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2 text-[13px]">
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          disabled={disabled || enabled.length === 0}
          onChange={() => onCheck(allChecked ? checked.filter((k) => !enabled.includes(k)) : [...new Set([...checked, ...enabled])])}
          aria-label="Select all"
        />
        <span className="text-slate-500 tabular-nums">{checked.length > 0 ? `${checked.length}/` : ''}{items.length} items</span>
        <span className="ml-auto truncate font-medium text-slate-700">{title}</span>
      </div>
      {showSearch && (
        <div className="relative border-b border-slate-100 p-2">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-8 w-full rounded-lg border border-slate-200 pr-2 pl-7 text-[13px] outline-none focus:border-indigo-500"
          />
        </div>
      )}
      <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-1">
        {shown.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-slate-400">No data</li>}
        {shown.map((it) => {
          const k = keyOf(it);
          return (
            <li key={k}>
              <Checkbox
                className="flex w-full rounded-lg px-2 py-1.5 hover:bg-slate-50"
                checked={checked.includes(k)}
                disabled={disabled || it.disabled}
                onChange={() => onCheck(checked.includes(k) ? checked.filter((x) => x !== k) : [...checked, k])}
              >
                <span className="truncate">{render(it)}</span>
              </Checkbox>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Move items between two lists. */
export function Transfer<T extends TransferItem = TransferItem>({
  dataSource = [], targetKeys = [], onChange, render, rowKey, titles = [], operations = [], listStyle, showSearch, filterOption,
  disabled: disabledProp, className, style,
}: TransferProps<T>) {
  const disabled = useDisabled(disabledProp);
  const keyOf = rowKey || ((it: T) => String(it.key));
  const show = render || ((it: T) => it.title ?? keyOf(it));
  const [leftChecked, setLeftChecked] = React.useState<string[]>([]);
  const [rightChecked, setRightChecked] = React.useState<string[]>([]);
  const target = new Set(targetKeys.map(String));
  const left = dataSource.filter((it) => !target.has(keyOf(it)));
  // Target list keeps the order of `targetKeys`.
  const right = targetKeys.map((k) => dataSource.find((it) => keyOf(it) === String(k))).filter(Boolean) as T[];

  const move = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      onChange?.([...targetKeys, ...leftChecked], 'right', leftChecked);
      setLeftChecked([]);
    } else {
      onChange?.(targetKeys.filter((k) => !rightChecked.includes(String(k))), 'left', rightChecked);
      setRightChecked([]);
    }
  };

  const listProps = { keyOf, render: show, showSearch, filterOption, disabled, style: listStyle };
  return (
    <div className={cn('flex items-center gap-3', className)} style={style}>
      <TransferList {...listProps} title={titles[0]} items={left} checked={leftChecked} onCheck={setLeftChecked} />
      <div className="flex flex-col gap-2">
        <Button size="sm" variant={leftChecked.length ? 'primary' : 'secondary'} disabled={disabled || !leftChecked.length} onClick={() => move('right')} aria-label="Move to target">
          <ChevronRight className="size-4" />{operations[0]}
        </Button>
        <Button size="sm" variant={rightChecked.length ? 'primary' : 'secondary'} disabled={disabled || !rightChecked.length} onClick={() => move('left')} aria-label="Move to source">
          <ChevronLeft className="size-4" />{operations[1]}
        </Button>
      </div>
      <TransferList {...listProps} title={titles[1]} items={right} checked={rightChecked} onCheck={setRightChecked} />
    </div>
  );
}
