import { AbstractIcon, AbstractMenu } from 'lowcode-blocks';
import type { AbstractMenuProps, SelectMenuInfo } from 'lowcode-blocks/src/abstract-menu';
import { RegistryContext } from 'lowcode-registry';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isAbsoluteUrl, useHistory } from 'lowcode-common';
import AppContext from '../../../app-context';
import { SiderContext } from '../MenuSider';
import dispatcher from '../../../dispatcher';
import type { AbstractMenuType } from 'lowcode-blocks/src/interface';

export function createAbstractMenu(item: AppMenu) {
  const isAbsolute = isAbsoluteUrl(item.url);
  const url = (isAbsolute ? item.url : ('/' + item.url).replace(/\/\//g, '/')).trim();
  return {
    title: item.name,
    label: item.name,
    href: item.subs?.length > 0 ? undefined : dispatcher.router.autoConvertUrl(url),
    key: item.customKey,
    icon: item.icon ? <AbstractIcon type={item.icon} /> : undefined,
    children: item.subs?.length > 0 ? item.subs.map(createAbstractMenu) : undefined,
  };
}

const runtime = {
  setActiveMenu: (_v: SelectMenuInfo) => {},
};

export interface LayoutMenuProps extends Partial<AbstractMenuProps> {
  noChild?: boolean
  menus?: AppMenu[]
}

const matchUrl = (menu: AbstractMenuType, route:string)=>{
  if (!menu.href) {
    return false;
  }
  if (menu.href === route) {
    return true;
  }
  const path = route.replace('#', '');
  const url = (menu.href || '').split('/').map((v) => {
    return v[0] == ':' ? '(\\w|\\d|-)+' : v;
  }).join('/').replace(/\/list$/, '/');
  return new RegExp('^' + url).test(path);
};

function findMenuByKey(menus: AbstractMenuType[], key: string, parents: AbstractMenuType[] = []): { menu: AbstractMenuType; paths: AbstractMenuType[] } | null {
  for (const menu of menus) {
    if (menu.key === key) return { menu, paths: [...parents, menu] };
    if (menu.children) {
      const result = findMenuByKey(menu.children as AbstractMenuType[], key, [...parents, menu]);
      if (result) return result;
    }
  }
  return null;
}

function findMenuByUrl(menus: AbstractMenuType[], pathname: string): { menu: AbstractMenuType; paths: AbstractMenuType[] } | null {
  for (const menu of menus) {
    if (matchUrl(menu, pathname)) return { menu, paths: [menu] };
    if (menu.children) {
      const result = findMenuByUrl(menu.children as AbstractMenuType[], pathname);
      if (result) return { menu: result.menu, paths: [menu, ...result.paths] };
    }
  }
  return null;
}

export default function LayoutMenu({ noChild, menus, ...props }: LayoutMenuProps) {
  const ctxt = useContext(RegistryContext);
  const appCtx = useContext(AppContext);
  const history = useHistory();
  const location = useLocation();
  const sider = useContext(SiderContext);
  const theme = (props.theme || sider.theme || appCtx.menuTheme) as any;
  const items = menus || appCtx.menus;

  const useMenus = useMemo(() => {
    const mapped = items?.map(createAbstractMenu);
    if (noChild) {
      return mapped?.map(({ children: _children, ...menu }) => menu);
    }
    return mapped;
  }, [items, noChild]);

  const activeKey = useMemo(() => {
    const found = findMenuByUrl(useMenus || [], location.pathname);
    return found?.menu?.key as string | undefined;
  }, [useMenus, location.pathname]);

  // Sync active menu state whenever the URL or menu list changes
  useEffect(() => {
    if (!activeKey || !useMenus) return;
    const found = findMenuByKey(useMenus, activeKey);
    if (found) {
      runtime.setActiveMenu?.({ key: activeKey, menu: found.menu, paths: found.paths });
    }
  }, [activeKey, useMenus]);

  const onActiveMenu = (info: SelectMenuInfo) => {
    const found = info.key ? findMenuByKey(useMenus || [], info.key) : null;
    if (found) {
      runtime.setActiveMenu?.({ ...info, menu: found.menu, paths: found.paths });
      if (found.menu.href) {
        history.push(found.menu.href);
      }
    }
    props.onSelect?.(info);
  };

  return (
    <AbstractMenu
      mode="inline"
      inlineCollapsed={sider.collapsed}
      collapsedLabels={sider.miniIcon}
      style={{ height: '100%' }}
      {...props}
      theme={theme}
      className={['layout-menus bg-transparent', props.className].filter(Boolean).join(' ')}
      menus={useMenus}
      selectedKey={activeKey}
      key={ctxt.appId}
      onSelect={onActiveMenu as any}
    />
  );
}

LayoutMenu.useActiveMenu = () => {
  const [menu, setMenu] = useState<SelectMenuInfo>();
  runtime.setActiveMenu = setMenu;
  return menu;
};