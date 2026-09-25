import React from 'react';
import { Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import { cn } from './cn';
import { controlHeight, normalizeSize, useDisabled } from './context';
import { ClearButton, fieldShellClass } from './input';
import { DropdownPanel } from './popover';
import { nodeText } from './select';
import { Spinner } from './spinner';

export interface TreeNode {
  value?: any;
  title?: React.ReactNode;
  label?: React.ReactNode;
  key?: React.Key;
  children?: TreeNode[];
  disabled?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  /** Flat-data mode: this node's id and its parent's id. */
  id?: any;
  pId?: any;
  [key: string]: any;
}

export interface TreeSelectProps {
  treeData?: TreeNode[];
  /** `treeData` is a flat list linked by `id` / `pId`. */
  treeDataSimpleMode?: boolean | { id?: string; pId?: string; rootPId?: any };
  value?: any;
  defaultValue?: any;
  onChange?: (value: any, labels?: React.ReactNode[]) => void;
  multiple?: boolean;
  /** Checkbox selection (implies `multiple`). */
  treeCheckable?: boolean;
  showSearch?: boolean;
  allowClear?: boolean;
  placeholder?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  treeDefaultExpandAll?: boolean;
  size?: 'small' | 'middle' | 'large' | 'default';
  status?: 'error' | 'warning' | '';
  notFoundContent?: React.ReactNode;
  dropdownStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

interface FlatNode {
  node: TreeNode;
  depth: number;
  parent?: any;
  hasChildren: boolean;
}

function buildTree(data: TreeNode[], simple: TreeSelectProps['treeDataSimpleMode']): TreeNode[] {
  if (!simple) return data;
  const idKey = typeof simple === 'object' && simple.id || 'id';
  const pidKey = typeof simple === 'object' && simple.pId || 'pId';
  const byId = new Map<any, TreeNode>();
  data.forEach((n) => byId.set(n[idKey], { ...n, children: [] }));
  const roots: TreeNode[] = [];
  byId.forEach((n) => {
    const parent = n[pidKey] !== undefined && n[pidKey] !== null ? byId.get(n[pidKey]) : undefined;
    if (parent && parent !== n) parent.children!.push(n);
    else roots.push(n);
  });
  return roots;
}

const valueOf = (n: TreeNode) => (n.value !== undefined ? n.value : n.key);
const labelOf = (n: TreeNode) => n.title ?? n.label ?? String(valueOf(n));

/** Select from a tree. */
export function TreeSelect({
  treeData = [], treeDataSimpleMode, value: valueProp, defaultValue, onChange, multiple: multipleProp, treeCheckable, showSearch, allowClear,
  placeholder = 'Please select', loading, disabled: disabledProp, treeDefaultExpandAll, size, status, notFoundContent, dropdownStyle, className, style,
}: TreeSelectProps) {
  const disabled = useDisabled(disabledProp);
  const multiple = !!(multipleProp || treeCheckable);
  const tree = React.useMemo(() => buildTree(treeData, treeDataSimpleMode), [treeData, treeDataSimpleMode]);
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const values: any[] = multiple ? (Array.isArray(value) ? value : value == null ? [] : [value]) : [];
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [expanded, setExpanded] = React.useState<Set<any>>(new Set());

  // Index every node by value for labels and parent lookups.
  const index = React.useMemo(() => {
    const map = new Map<any, FlatNode>();
    const walk = (nodes: TreeNode[], depth: number, parent?: any) => nodes.forEach((n) => {
      map.set(valueOf(n), { node: n, depth, parent, hasChildren: !!n.children?.length });
      if (n.children) walk(n.children, depth + 1, valueOf(n));
    });
    walk(tree, 0);
    return map;
  }, [tree]);

  React.useEffect(() => {
    if (treeDefaultExpandAll) setExpanded(new Set([...index.values()].filter((f) => f.hasChildren).map((f) => valueOf(f.node))));
  }, [treeDefaultExpandAll, index]);

  // Open on the current selection: expand its ancestors.
  React.useEffect(() => {
    if (!open) return setSearch('');
    const next = new Set(expanded);
    (multiple ? values : [value]).forEach((v) => {
      let p = index.get(v)?.parent;
      while (p !== undefined) {
        next.add(p);
        p = index.get(p)?.parent;
      }
    });
    setExpanded(next);
  }, [open]);

  const q = search.trim().toLowerCase();
  // With a search, show matches plus their ancestors, fully expanded.
  const visible = React.useMemo(() => {
    if (!q) return null;
    const keep = new Set<any>();
    index.forEach((f, v) => {
      if (nodeText(labelOf(f.node)).toLowerCase().includes(q)) {
        keep.add(v);
        let p = f.parent;
        while (p !== undefined) {
          keep.add(p);
          p = index.get(p)?.parent;
        }
      }
    });
    return keep;
  }, [q, index]);

  const rows: FlatNode[] = [];
  const walk = (nodes: TreeNode[], depth: number) => nodes.forEach((n) => {
    const v = valueOf(n);
    if (visible && !visible.has(v)) return;
    const f = index.get(v)!;
    rows.push({ ...f, depth });
    if (n.children?.length && (visible || expanded.has(v))) walk(n.children, depth + 1);
  });
  walk(tree, 0);

  const emit = (next: any) => {
    if (valueProp === undefined) setInner(next);
    const labels = (multiple ? next || [] : next === undefined ? [] : [next]).map((v: any) => {
      const n = index.get(v)?.node;
      return n ? labelOf(n) : v;
    });
    onChange?.(next, labels);
  };

  const choose = (n: TreeNode) => {
    if (n.disabled || n.selectable === false) return;
    const v = valueOf(n);
    if (multiple) {
      emit(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
    } else {
      emit(v);
      setOpen(false);
    }
  };

  const toggle = (v: any) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  });

  const display = (v: any) => {
    const n = index.get(v)?.node;
    return n ? labelOf(n) : v;
  };
  const hasValue = multiple ? values.length > 0 : value !== undefined && value !== null && value !== '';

  const field = (
    <div
      role="combobox"
      aria-expanded={open}
      aria-disabled={disabled || undefined}
      aria-invalid={status === 'error' || undefined}
      tabIndex={showSearch || disabled ? -1 : 0}
      onClick={() => !disabled && setOpen(multiple ? true : !open)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === 'ArrowDown') && !disabled) setOpen(true);
        if (e.key === 'Escape') setOpen(false);
      }}
      className={cn('group relative', fieldShellClass, multiple ? 'min-h-9 py-1' : controlHeight[normalizeSize(size)], 'cursor-pointer pr-8 pl-3', open && 'border-indigo-500 ring-3 ring-indigo-500/15', className)}
      style={style}
    >
      <div className={cn('flex min-w-0 flex-1 items-center', multiple && 'flex-wrap gap-1')}>
        {multiple && values.map((v) => (
          <span key={String(v)} className="inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-slate-100 pr-1 pl-2 text-[13px] text-slate-700">
            <span className="truncate">{display(v)}</span>
            {!disabled && (
              <button
                type="button" tabIndex={-1} aria-label="Remove" onClick={(e) => {
                  e.stopPropagation();
                  emit(values.filter((x) => x !== v));
                }} className="flex cursor-pointer text-slate-400 hover:text-slate-700"
              >
                <X className="size-3" />
              </button>
            )}
          </span>
        ))}
        {showSearch && open ? (
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={!hasValue || multiple ? undefined : nodeText(display(value))}
            className="h-6 min-w-[4ch] flex-1 bg-transparent outline-none"
          />
        ) : (!multiple || !hasValue) && (
          <span className={cn('truncate', !hasValue && 'text-slate-400')}>{hasValue ? display(value) : placeholder}</span>
        )}
      </div>
      <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-400">
        {loading ? <Spinner className="size-3.5" /> : allowClear && hasValue && !disabled ? (
          <>
            <ClearButton
              onClick={(e) => {
                e.stopPropagation();
                emit(multiple ? [] : undefined);
              }} className="hidden group-hover:flex"
            />
            <ChevronDown className="size-4 group-hover:hidden" />
          </>
        ) : <ChevronDown className="size-4" />}
      </span>
    </div>
  );

  return (
    <DropdownPanel open={open} onOpenChange={setOpen} anchor={field} keepFocus={showSearch} className="p-1">
      <div role="tree" aria-multiselectable={multiple || undefined} className="max-h-72 overflow-y-auto overscroll-contain" style={dropdownStyle}>
        {rows.length === 0 && <div className="px-3 py-6 text-center text-[13px] text-slate-400">{loading ? 'Loading…' : notFoundContent ?? 'No data'}</div>}
        {rows.map(({ node, depth, hasChildren }) => {
          const v = valueOf(node);
          const isSelected = multiple ? values.includes(v) : value === v;
          const isOpen = !!visible || expanded.has(v);
          return (
            <div
              key={String(v)}
              role="treeitem"
              aria-selected={isSelected}
              aria-expanded={hasChildren ? isOpen : undefined}
              aria-disabled={node.disabled || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(node)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2.5 text-slate-700 hover:bg-slate-100',
                isSelected && !treeCheckable && 'bg-indigo-50 font-medium text-indigo-700 hover:bg-indigo-50',
                node.disabled && 'cursor-not-allowed opacity-40',
              )}
              style={{ paddingLeft: 4 + depth * 18 }}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-label={isOpen ? 'Collapse' : 'Expand'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasChildren) toggle(v);
                }}
                className={cn('flex size-5 shrink-0 items-center justify-center rounded text-slate-400', hasChildren ? 'cursor-pointer hover:bg-slate-200/70' : 'invisible')}
              >
                <ChevronRight className={cn('size-3.5 transition-transform', isOpen && 'rotate-90')} />
              </button>
              {treeCheckable && (
                <span className={cn('flex size-4 shrink-0 items-center justify-center rounded-[5px] border', isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white')}>
                  {isSelected && <Check className="size-3" strokeWidth={3} />}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{labelOf(node)}</span>
              {multiple && !treeCheckable && isSelected && <Check className="size-4 shrink-0 text-indigo-600" />}
            </div>
          );
        })}
      </div>
    </DropdownPanel>
  );
}
