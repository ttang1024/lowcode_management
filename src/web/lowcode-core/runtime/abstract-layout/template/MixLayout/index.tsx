/**
 * @module MixLayout
 * @description Master page with top-level menus across the top and the
 * active section's menus down the side.
 */
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Menu, type MenuSelectInfo } from 'lowcode-kit';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'lowcode-common';
import PageContent from '../../components/PageContent';
import MenuBar, { createAbstractMenu } from '../../components/MenuBar';
import MenuSider, { useMiniLayout } from '../../components/MenuSider';
import Logo from '../../components/Logo';
import Title from '../../components/Title';
import AppContext from '../../../app-context';
import dispatcher from '../../../dispatcher';
import { headerClass } from '../TopLayout';

const findMatch = (path: string, menus: AppMenu[]) => {
  const url = dispatcher.router.toPageUrl(path.replace(/^\/design(?=\/)/, ''));
  const match = (url: string, menu: AppMenu) => {
    if (url == dispatcher.router.toPageUrl(menu.url || '')) {
      return true;
    } else if (menu.subs) {
      return menu.subs.find((m) => match(url, m));
    }
    return false;
  };
  const menu = menus.find((m) => match(url, m));
  return menu?.customKey;
};

export default function MixLayout() {
  const appContext = useContext(AppContext);
  const menus = appContext.menus || [];
  const location = useLocation();
  const history = useHistory();
  const [activeKey, setActiveKey] = useState<string>(findMatch(location.pathname, menus));
  const { mini } = useMiniLayout();
  const dark = appContext.menuTheme !== 'light';

  const onTopActive = useCallback((e: MenuSelectInfo) => {
    const menu = menus.find((m) => m.customKey == e.key);
    const first = (menu?.subs || [])[0]?.url;
    if (first) {
      history.push(dispatcher.router.autoConvertUrl(first));
    }
    setActiveKey(e.key);
  }, [appContext.menus]);

  const topMenus = useMemo(() => {
    return menus.map(createAbstractMenu).map(({ children: _children, ...menu }) => menu);
  }, [appContext.menus]);

  const menu = menus.find((m) => m.customKey == activeKey);
  const childMenus = useMemo(() => {
    return menu?.subs || [];
  }, [menu]);

  return (
    <div className={`mix-layout menu-theme-${appContext.menuTheme} flex h-screen flex-col`}>
      <header className={headerClass(dark)}>
        <Logo />
        {mini ? <MenuSider.Togger /> : <Title className="mr-5 ml-1 self-center text-base" />}
        {!mini && (
          <Menu
            className="flex-1 bg-transparent"
            mode="horizontal"
            theme={dark ? 'dark' : 'light'}
            items={topMenus.map((m) => ({ ...m, key: String(m.key) }))}
            selectedKeys={activeKey ? [activeKey] : []}
            onSelect={onTopActive}
          />
        )}
      </header>
      <div className="flex min-h-0 flex-1">
        <MenuSider theme="light">
          <MenuBar key={activeKey} theme="light" className="h-full" menus={mini ? menus : childMenus} />
        </MenuSider>
        <main className="layout-body min-w-0 flex-1 overflow-hidden">
          <PageContent />
        </main>
      </div>
    </div>
  );
}
