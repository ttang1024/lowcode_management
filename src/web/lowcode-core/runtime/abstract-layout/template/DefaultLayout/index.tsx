/**
 * @module DefaultLayout
 * @description Default master page: side menu + content.
 */
import React, { useContext } from 'react';
import { cn } from 'lowcode-kit';
import PageContent from '../../components/PageContent';
import MenuBar from '../../components/MenuBar';
import MenuSider, { useMiniLayout } from '../../components/MenuSider';
import AppContext from '../../../app-context';
import Title from '../../components/Title';

export default function DefaultLayout() {
  const appContext = useContext(AppContext);
  const { mini } = useMiniLayout();
  const dark = appContext.menuTheme !== 'light';

  return (
    <div className={`default-layout menu-theme-${appContext.menuTheme} flex h-screen`}>
      <MenuSider>
        <Title className={cn('mt-5 mb-10 text-center text-sm font-normal [.default-collapsed_&]:hidden', dark ? 'text-slate-300' : 'text-slate-500')} />
        <MenuBar />
      </MenuSider>
      <div className="flex min-w-0 flex-1 flex-col">
        {mini && (
          <header className="default-header runtime-layout-header relative z-10 flex h-12 shrink-0 items-center bg-white shadow-[0_1px_0_0_#e9e9e9]">
            <MenuSider.Togger />
          </header>
        )}
        <main className="layout-body min-h-0 flex-1 overflow-hidden">
          <PageContent />
        </main>
      </div>
    </div>
  );
}
