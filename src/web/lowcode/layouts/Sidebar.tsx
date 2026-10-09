import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import { Tooltip, cn } from 'lowcode-kit';
import { navGroups } from './menu';
import { useAuth } from './AuthGate';

interface SidebarProps {
  selectedKey?: string;
  collapsed?: boolean;
  /** Omitted in the mobile drawer, which has no collapse control. */
  onToggle?: () => void;
}

export function BrandMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg className={cn('shrink-0 drop-shadow-[0_6px_14px_rgb(79_70_229/0.45)]', className)} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="studio-brand-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#studio-brand-gradient)" />
      <rect x="8" y="8" width="7" height="7" rx="2" fill="#fff" />
      <rect x="17" y="8" width="7" height="7" rx="2" fill="#fff" fillOpacity="0.55" />
      <rect x="8" y="17" width="16" height="7" rx="2" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}

// Labels fade out (rather than unmount) so the rail animates smoothly.
const fade = (collapsed: boolean) => cn('transition-opacity duration-200', collapsed && 'pointer-events-none opacity-0');

const footerButton = 'flex size-[30px] cursor-pointer items-center justify-center rounded-lg border-0 bg-slate-400/10 text-slate-400 transition-colors hover:bg-slate-400/20 hover:text-white';

export default function Sidebar({ selectedKey, collapsed = false, onToggle }: SidebarProps) {
  const auth = useAuth();
  return (
    <aside
      className={cn(
        'relative flex h-full shrink-0 flex-col overflow-hidden text-slate-400 transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        'bg-[radial-gradient(120%_60%_at_0%_0%,rgb(99_102_241/0.22),transparent_60%),linear-gradient(180deg,#111c35,#0f172a)]',
        collapsed ? 'w-[76px]' : 'w-[248px]',
      )}
    >
      <Link to="/admin/overview" className="flex h-[72px] shrink-0 items-center gap-3 px-[22px] text-slate-50 no-underline hover:text-slate-50">
        <BrandMark />
        <span className={cn('flex flex-col text-base leading-[1.15] font-bold tracking-tight whitespace-nowrap', fade(collapsed))}>
          Lowcode
          <small className="text-[11px] font-medium tracking-[0.12em] text-indigo-300 uppercase">Studio</small>
        </span>
      </Link>

      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3.5 pt-2 pb-4 [scrollbar-width:none]" aria-label="Main">
        {navGroups.map((group, gi) => (
          <div key={group.title} className={cn(gi > 0 && 'mt-[18px]')}>
            <div className={cn('overflow-hidden px-3 text-[11px] font-semibold tracking-widest whitespace-nowrap text-slate-500 uppercase transition-all', collapsed ? 'h-3 opacity-0' : 'h-7')}>
              {group.title}
            </div>
            {group.items.map((item) => {
              const active = item.key === selectedKey;
              const link = (
                <Link
                  key={item.key}
                  to={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative my-0.5 flex h-[42px] items-center gap-3 rounded-[10px] px-[13px] text-sm font-medium whitespace-nowrap no-underline transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-400',
                    active ?
                      'bg-gradient-to-r from-indigo-500/40 to-indigo-500/10 text-white ring-1 ring-indigo-400/35 ring-inset before:absolute before:inset-y-2.5 before:-left-3.5 before:w-[3px] before:rounded-r before:bg-indigo-400 hover:text-white' :
                      'text-slate-400 hover:bg-slate-400/10 hover:text-slate-50',
                  )}
                >
                  <span className={cn('flex w-6 shrink-0 justify-center text-[17px]', active && 'text-indigo-200')}>{item.icon}</span>
                  <span className={fade(collapsed)}>{item.title}</span>
                </Link>
              );
              return collapsed ?
                <Tooltip key={item.key} title={item.title} side="right">{link}</Tooltip> :
                link;
            })}
          </div>
        ))}
      </nav>

      <div className={cn('flex min-h-14 shrink-0 items-center gap-2 border-t border-slate-400/10', collapsed ? 'justify-center py-3' : 'justify-between pr-[18px] pl-[26px]')}>
        {!collapsed && <span className="text-xs tracking-wide whitespace-nowrap text-slate-500">v{process.env.VERSION}</span>}
        <div className={cn('flex gap-2', collapsed && 'flex-col')}>
          {auth.required && (
            <Tooltip title="Sign out" side="right">
              <button type="button" onClick={auth.logout} aria-label="Sign out" className={footerButton}>
                <LogOut size="1em" />
              </button>
            </Tooltip>
          )}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={footerButton}
            >
              {collapsed ? <ChevronsRight size="1em" /> : <ChevronsLeft size="1em" />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
