import React, { useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Drawer, cn } from 'lowcode-kit';
import AppContext from '../../../app-context';
import Logo from '../Logo';
import Title from '../Title';

export type SiderTheme = 'light' | 'dark';

/** Collapsed state of the enclosing sider, for the menu inside it. */
export const SiderContext = React.createContext({ collapsed: false, miniIcon: false, theme: 'dark' as SiderTheme });

export interface MenuSiderProps {
  theme?: SiderTheme
  showLogo?: boolean
  onCollapse?: (v: boolean) => void
}

export const useMiniLayout = function(limitWith = 576) {
  const isMini = () => document.documentElement.clientWidth < limitWith;
  const [mini, setMini] = useState(isMini());
  useEffect(() => {
    const onResize = () => {
      setMini(isMini());
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return {
    mini,
  };
};

/**
 * App side navigation: a collapsible rail on wide screens, a drawer (opened
 * from the header toggle) on phones.
 */
export default function MenuSider(props: React.PropsWithChildren<MenuSiderProps>) {
  const appContext = useContext(AppContext);
  const menuOptions = appContext?.config?.menuOptions;
  const [collapsed, setCollapsed] = useState(!!menuOptions?.defaultCollapsed);
  const theme = (props.theme || appContext.menuTheme || 'dark') as SiderTheme;
  const [node, setNode] = useState<HTMLDivElement>();
  const { showLogo } = props;
  const { mini } = useMiniLayout();
  const dark = theme === 'dark';
  const miniIcon = !!menuOptions?.miniIcon;

  const onToggle = useCallback(() => {
    setCollapsed((v) => {
      props.onCollapse?.(!v);
      return !v;
    });
  }, []);

  useEffect(() => {
    setNode(document.getElementById('MenuSiderTogger') as HTMLDivElement);
  }, []);

  const children = (
    <SiderContext.Provider value={{ collapsed: collapsed && !mini, miniIcon, theme }}>
      {showLogo && (
        <div className="flex flex-col items-center overflow-hidden pt-5 pb-2">
          <Logo />
          {!collapsed && <Title className="text-sm leading-[48px]" />}
        </div>
      )}
      {props.children}
    </SiderContext.Provider>
  );

  if (mini) {
    const Toggle = collapsed ? PanelLeftOpen : PanelLeftClose;
    return (
      <>
        <Drawer
          placement="left"
          width={255}
          closable={false}
          open={!collapsed}
          onClose={() => setCollapsed(true)}
          className={cn('layout-sider', dark ? 'bg-slate-900 text-slate-200' : 'bg-white')}
        >
          {children}
        </Drawer>
        {node && createPortal(
          <button type="button" aria-label="Toggle menu" onClick={onToggle} className="ml-4 flex cursor-pointer text-lg text-slate-600">
            <Toggle size="1em" />
          </button>,
          node,
        )}
      </>
    );
  }

  const width = menuOptions?.width || 210;
  const collapsedWidth = menuOptions?.collpasedWidth ?? (miniIcon ? 88 : 64);
  const collapsible = menuOptions?.collapsible !== false;
  const Toggle = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <aside
      className={cn(
        'layout-sider relative flex h-full shrink-0 flex-col transition-[width] duration-200',
        dark ? 'bg-slate-900 text-slate-200' : 'border-r border-slate-200 bg-white text-slate-700',
        collapsed ? 'default-collapsed' : 'default-expanded',
      )}
      style={{ width: collapsed ? collapsedWidth : width }}
    >
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
      {collapsible && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          className={cn(
            'flex h-12 shrink-0 cursor-pointer items-center justify-center text-base transition-colors',
            dark ? 'border-t border-white/10 text-slate-400 hover:text-white' : 'border-t border-slate-100 text-slate-500 hover:text-slate-900',
          )}
        >
          <Toggle size="1em" />
        </button>
      )}
    </aside>
  );
}

MenuSider.Togger = function MenuSiderTogger() {
  return <div className="flex h-full flex-1 flex-col items-start justify-center" id="MenuSiderTogger" />;
};
