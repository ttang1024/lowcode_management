/**
 * Navigation menu: inline tree, collapsed icon rail
 * with fly-out submenus, and a horizontal bar with drop-downs. The accent
 * follows `--lc-primary` (an app's primary color) and falls back to indigo.
 */
import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from './cn';
import { Tooltip } from './tooltip';

export interface MenuItem {
  key: string;
  label?: React.ReactNode;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children?: MenuItem[];
  disabled?: boolean;
  type?: 'group' | 'divider';
  [key: string]: any;
}

export interface MenuSelectInfo {
  key: string;
  keyPath: string[];
  item: MenuItem;
  domEvent?: React.SyntheticEvent;
}

export interface MenuProps {
  items?: MenuItem[];
  mode?: 'inline' | 'vertical' | 'horizontal';
  theme?: 'light' | 'dark';
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  /** Alias for a single selected key. */
  activeKey?: string;
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onOpenChange?: (openKeys: string[]) => void;
  onSelect?: (info: MenuSelectInfo) => void;
  onClick?: (info: MenuSelectInfo) => void;
  /** Icon-only rail (inline mode). */
  inlineCollapsed?: boolean;
  /** In the collapsed rail, show each label under its icon as a tile. */
  collapsedLabels?: boolean;
  inlineIndent?: number;
  className?: string;
  style?: React.CSSProperties;
}

function findPath(items: MenuItem[], key: string, trail: string[] = []): string[] | null {
  for (const it of items) {
    if (it.key === key) return [...trail, it.key];
    if (it.children) {
      const found = findPath(it.children, key, [...trail, it.key]);
      if (found) return found;
    }
  }
  return null;
}

const themes = {
  dark: {
    root: 'bg-slate-900 text-slate-300',
    item: 'text-slate-300 hover:bg-white/5 hover:text-white',
    selected: 'bg-[var(--lc-primary,#4f46e5)] text-white hover:bg-[var(--lc-primary,#4f46e5)] hover:text-white',
    ancestor: 'text-white',
    sub: 'bg-black/20',
    group: 'text-slate-500',
    panel: 'border-slate-800 bg-slate-900 text-slate-300',
  },
  light: {
    root: 'bg-white text-slate-700',
    item: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    selected: 'bg-[color-mix(in_srgb,var(--lc-primary,#4f46e5)_10%,white)] font-medium text-[var(--lc-primary,#4f46e5)] hover:bg-[color-mix(in_srgb,var(--lc-primary,#4f46e5)_10%,white)]',
    ancestor: 'text-[var(--lc-primary,#4f46e5)]',
    sub: '',
    group: 'text-slate-400',
    panel: 'border-slate-100 bg-white text-slate-700',
  },
};

type Theme = typeof themes.light;
const itemLabel = (it: MenuItem) => it.label ?? it.title;

/** Submenu shown beside a collapsed rail item, or below a horizontal one. */
function Flyout({ item, side = 'right', t, isSelected, onPick, children }: {
  item: MenuItem;
  side?: 'right' | 'bottom';
  t: Theme;
  isSelected: (it: MenuItem) => boolean;
  onPick: (it: MenuItem, e: React.SyntheticEvent) => void;
  children: React.ReactElement;
}) {
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const hover = {
    onMouseEnter: () => {
      clearTimeout(timer.current);
      setOpen(true);
    },
    onMouseLeave: () => {
      timer.current = setTimeout(() => setOpen(false), 150);
    },
  };
  const renderList = (list: MenuItem[], depth = 0): React.ReactNode => list.map((c) => {
    if (c.type === 'divider') return <div key={c.key} className="my-1 border-t border-current/10" />;
    if (c.type === 'group' || c.children?.length) {
      return (
        <div key={c.key}>
          <div className={cn('px-3 pt-2 pb-1 text-xs font-medium', t.group)} style={{ paddingLeft: 12 + depth * 12 }}>{itemLabel(c)}</div>
          {renderList(c.children || [], depth + 1)}
        </div>
      );
    }
    return (
      <button
        key={c.key}
        type="button"
        role="menuitem"
        disabled={c.disabled}
        onClick={(e) => {
          onPick(c, e);
          setOpen(false);
        }}
        className={cn('flex w-full cursor-pointer items-center gap-2.5 rounded-lg py-2 pr-3 text-left text-sm', isSelected(c) ? t.selected : t.item, c.disabled && 'cursor-not-allowed opacity-40')}
        style={{ paddingLeft: 12 + depth * 12 }}
      >
        {c.icon && <span className="flex shrink-0 text-base">{c.icon}</span>}
        <span className="truncate">{itemLabel(c)}</span>
      </button>
    );
  });
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild {...hover}>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align="start"
          sideOffset={side === 'right' ? 8 : 4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          {...hover}
          className={cn('z-[1100] min-w-44 animate-pop-in rounded-xl border p-1 shadow-float outline-none', t.panel)}
        >
          {side === 'right' && <div className={cn('px-3 pt-1.5 pb-1 text-xs font-semibold', t.group)}>{itemLabel(item)}</div>}
          <div role="menu" className="max-h-[70vh] overflow-y-auto">{renderList(item.children || [])}</div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export function Menu({
  items = [], mode = 'inline', theme = 'light', selectedKeys, defaultSelectedKeys, activeKey, openKeys: openProp, defaultOpenKeys, onOpenChange,
  onSelect, onClick, inlineCollapsed, collapsedLabels, inlineIndent = 20, className, style,
}: MenuProps) {
  const t = themes[theme] || themes.light;
  const [innerSelected, setInnerSelected] = React.useState<string[]>(defaultSelectedKeys || []);
  const selected = selectedKeys ?? (activeKey ? [activeKey] : innerSelected);
  const selectedPath = React.useMemo(() => (selected[0] ? findPath(items, selected[0]) || [] : []), [items, selected[0]]);
  const [innerOpen, setInnerOpen] = React.useState<string[]>(() => defaultOpenKeys || selectedPath.slice(0, -1));
  const open = openProp ?? innerOpen;

  // Reveal the selected item when navigation selects something new.
  React.useEffect(() => {
    if (openProp || mode !== 'inline') return;
    const ancestors = selectedPath.slice(0, -1);
    if (ancestors.some((k) => !innerOpen.includes(k))) setInnerOpen((o) => [...new Set([...o, ...ancestors])]);
  }, [selectedPath.join('/')]);

  const toggle = (key: string) => {
    const next = open.includes(key) ? open.filter((k) => k !== key) : [...open, key];
    if (!openProp) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const pick = (item: MenuItem, e: React.SyntheticEvent) => {
    if (item.disabled) return;
    const info = { key: item.key, keyPath: (findPath(items, item.key) || [item.key]).slice().reverse(), item, domEvent: e };
    if (!selectedKeys) setInnerSelected([item.key]);
    onClick?.(info);
    onSelect?.(info);
  };

  const label = itemLabel;
  const isSelected = (it: MenuItem) => selected.includes(it.key);
  const inPath = (it: MenuItem) => selectedPath.includes(it.key);
  const flyout = { t, isSelected, onPick: pick };

  /* ------------------------------- horizontal ------------------------------- */
  if (mode === 'horizontal') {
    return (
      <nav className={cn('flex min-w-0 items-stretch gap-1 overflow-x-auto', t.root, className)} style={style}>
        {items.filter((it) => it.type !== 'divider').map((it) => {
          const active = isSelected(it) || inPath(it);
          const node = (
            <button
              type="button"
              role="menuitem"
              disabled={it.disabled}
              onClick={it.children?.length ? undefined : (e) => pick(it, e)}
              className={cn(
                'relative flex shrink-0 cursor-pointer items-center gap-2 px-4 text-sm whitespace-nowrap transition-colors',
                theme === 'dark' ? 'hover:text-white' : 'hover:text-[var(--lc-primary,#4f46e5)]',
                active && (theme === 'dark' ? 'bg-[var(--lc-primary,#4f46e5)] text-white' : 'text-[var(--lc-primary,#4f46e5)] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--lc-primary,#4f46e5)]'),
                it.disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {it.icon && <span className="flex text-base">{it.icon}</span>}
              {label(it)}
              {it.children?.length ? <ChevronDown className="size-3.5 opacity-60" /> : null}
            </button>
          );
          return it.children?.length ? <Flyout key={it.key} item={it} side="bottom" {...flyout}>{node}</Flyout> : <React.Fragment key={it.key}>{node}</React.Fragment>;
        })}
      </nav>
    );
  }

  /* ----------------------------- collapsed rail ----------------------------- */
  if (inlineCollapsed) {
    return (
      <nav className={cn('flex flex-col gap-1 p-2', t.root, className)} style={style}>
        {items.filter((it) => it.type !== 'divider').map((it) => {
          const active = isSelected(it) || inPath(it);
          const node = (
            <button
              type="button"
              role="menuitem"
              aria-label={typeof label(it) === 'string' ? label(it) as string : undefined}
              disabled={it.disabled}
              onClick={it.children?.length ? undefined : (e) => pick(it, e)}
              className={cn(
                'flex w-full cursor-pointer flex-col items-center justify-center rounded-lg text-lg transition-colors',
                collapsedLabels ? 'min-h-16 gap-1.5 px-1 py-2.5' : 'h-10',
                active ? t.selected : t.item,
                it.disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {it.icon ?? <span className="text-sm font-semibold">{String(label(it) ?? '').slice(0, 1)}</span>}
              {collapsedLabels && <span className="w-full truncate text-center text-xs">{label(it)}</span>}
            </button>
          );
          if (it.children?.length) return <Flyout key={it.key} item={it} {...flyout}>{node}</Flyout>;
          return collapsedLabels ? <React.Fragment key={it.key}>{node}</React.Fragment> : <Tooltip key={it.key} title={label(it)} side="right">{node}</Tooltip>;
        })}
      </nav>
    );
  }

  /* --------------------------------- inline --------------------------------- */
  const renderInline = (list: MenuItem[], depth: number): React.ReactNode => list.map((it) => {
    if (it.type === 'divider') return <div key={it.key} className="mx-3 my-1 border-t border-current/10" />;
    if (it.type === 'group') {
      return (
        <div key={it.key} role="group">
          <div className={cn('pt-3 pb-1 text-xs font-medium', t.group)} style={{ paddingLeft: 12 + depth * inlineIndent }}>{label(it)}</div>
          {renderInline(it.children || [], depth)}
        </div>
      );
    }
    const hasChildren = !!it.children?.length;
    const expanded = open.includes(it.key);
    return (
      <div key={it.key} role="none">
        <button
          type="button"
          role="menuitem"
          aria-expanded={hasChildren ? expanded : undefined}
          aria-current={isSelected(it) ? 'page' : undefined}
          disabled={it.disabled}
          onClick={(e) => (hasChildren ? toggle(it.key) : pick(it, e))}
          className={cn(
            'flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg pr-3 text-left text-sm transition-colors',
            isSelected(it) ? t.selected : cn(t.item, hasChildren && inPath(it) && t.ancestor),
            it.disabled && 'cursor-not-allowed opacity-40',
          )}
          style={{ paddingLeft: 12 + depth * inlineIndent }}
        >
          {it.icon && <span className="flex shrink-0 text-base">{it.icon}</span>}
          <span className="min-w-0 flex-1 truncate">{label(it)}</span>
          {hasChildren && <ChevronRight className={cn('size-3.5 shrink-0 opacity-60 transition-transform', expanded && 'rotate-90')} />}
        </button>
        {hasChildren && expanded && (
          <div role="menu" className={cn('mt-0.5 flex flex-col gap-0.5 rounded-lg', t.sub)}>{renderInline(it.children!, depth + 1)}</div>
        )}
      </div>
    );
  });

  return (
    <nav role="menu" className={cn('flex flex-col gap-0.5 p-2', t.root, className)} style={style}>
      {renderInline(items, 0)}
    </nav>
  );
}
