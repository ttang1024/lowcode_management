import React, { useEffect, useState } from 'react';
import { Sheet, cn } from 'lowcode-kit';
import { CrashProvider } from 'lowcode-blocks';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { findNavItem } from './menu';

const COLLAPSE_KEY = 'lowcode.sider.collapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

/** True below the tablet breakpoint, where the sidebar becomes a drawer. */
function useCompact(limit = 900) {
  const query = () => document.documentElement.clientWidth < limit;
  const [compact, setCompact] = useState(query);
  useEffect(() => {
    const onResize = () => setCompact(query());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return compact;
}

export default function LowcodeLayout(props: React.PropsWithChildren) {
  const { pathname } = useLocation();
  const current = findNavItem(pathname);
  const compact = useCompact();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      // Storage unavailable (private mode) — the preference just isn't kept.
    }
  }, [collapsed]);

  // Close the mobile drawer after navigating.
  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    document.title = current ? `${current.title} · Lowcode Studio` : 'Lowcode Studio';
  }, [current]);

  return (
    <div className="flex h-full bg-[#f4f6fb] font-sans text-slate-700">
      {compact ? (
        <Sheet
          side="left"
          width={260}
          label="Navigation"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          className="bg-slate-900"
          bodyClassName="h-full [&>aside]:w-full"
        >
          <Sidebar selectedKey={current?.key} />
        </Sheet>
      ) : (
        <Sidebar
          selectedKey={current?.key}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        <Topbar current={current} pathname={pathname} onMenu={compact ? () => setDrawerOpen(true) : undefined} />
        <main className={cn('flex-1', compact ? 'px-4 pt-1 pb-8' : 'px-8 pt-2 pb-10')}>
          <CrashProvider>
            <div className="mx-auto max-w-[1440px]">{props.children}</div>
          </CrashProvider>
        </main>
      </div>
    </div>
  );
}
