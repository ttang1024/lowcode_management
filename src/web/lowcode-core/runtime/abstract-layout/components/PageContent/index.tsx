import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CrashProvider, OverridePageHeader } from 'lowcode-blocks';
import { Breadcrumb as KitBreadcrumb, cn } from 'lowcode-kit';
import type { PageHeaderProps } from 'lowcode-blocks/src/page-header';
import AppContext from '../../../app-context';
import Menu from '../MenuBar';

function customBreadcrumb(props: PageHeaderProps) {
  const routes = (props.breadcrumb as any)?.routes || [];
  return (
    <KitBreadcrumb
      className="mb-1 min-h-[22px]"
      items={routes.map((item, index) => {
        const isLast = index >= routes.length - 1;
        return {
          key: index,
          title: isLast || !item.path ? item.breadcrumbName : <Link to={item.path} className="text-slate-500 no-underline hover:text-slate-900">{item.breadcrumbName}</Link>,
        };
      })}
    />
  );
}

export default function PageContent() {
  const activeMenu = Menu.useActiveMenu();
  const appContext = useContext(AppContext);
  const routes = activeMenu?.paths.map((item) => {
    return {
      path: (item.href || '').replace('#', ''),
      breadcrumbName: item.title,
    };
  });

  // The title row repeats the breadcrumb for nested menus; hide it unless a
  // page forces it (`force-show-extra` on <body>, see useAutomaticTitle).
  const needHide = useMemo(() => {
    const myRoutes = routes || [];
    const equal = myRoutes.map((m) => m.breadcrumbName).join('') == activeMenu?.menu?.title;
    return (myRoutes.length > 1 || equal) && !activeMenu?.menu?.desc;
  }, [routes, activeMenu?.menu]);

  return (
    <div
      className={cn(
        'page-container flex h-full flex-col overflow-hidden bg-[#f0f2f5]',
        needHide && '[&_.lc-page-header-heading]:hidden [.force-show-extra_&_.lc-page-header-heading]:flex',
      )}
    >
      <div className="injecter-top-actions absolute top-2 right-5 z-[999]"></div>
      <OverridePageHeader.Container>
        <OverridePageHeader.PageHeader
          className="page-header abstract-layout-header mb-0 bg-white px-7 py-3"
          title={activeMenu?.menu?.title || ''}
          subTitle={activeMenu?.menu?.desc || ''}
          breadcrumb={{ routes }}
          breadcrumbRender={customBreadcrumb}
          extra={<div className="top-actions-container flex min-h-[33px] flex-nowrap overflow-x-auto" id="PAGE_TOP_ACTIONS"></div>}
        />
        <CrashProvider>
          <div className="page-content relative m-5 min-h-0 flex-1 overflow-auto rounded bg-white px-6 py-5">{appContext.children}</div>
        </CrashProvider>
      </OverridePageHeader.Container>
    </div>
  );
}
